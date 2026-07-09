import { TryCatch } from "../utils/tryCatch.js";
import { db } from "@app/db/client";
import { applications } from "@app/db/schema";
import { eq, sql, and } from "drizzle-orm";
import ErrorHandler from "../utils/errorHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { Redis } from "@upstash/redis";

// Assuming REDIS_URL from env or defaulting to localhost
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ""
});

export const getJobSeekerAnalytics = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }

    if (user.role !== "jobseeker") {
      throw new ErrorHandler(403, "Forbidden: Only job seekers can view analytics");
    }

    const { userId } = user;

    // 1. Check Redis Cache First
    const cacheKey = `analytics:jobseeker:${userId}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    // 2. Compute Scalable Analytics from DB
    
    // Status Overview (Group by)
    const statusData = await db
      .select({
        name: applications.status,
        value: sql<number>`count(*)::int`
      })
      .from(applications)
      .where(eq(applications.applicantId, userId))
      .groupBy(applications.status);

    // Applications over time (Group by month for the last 6 months)
    const timeData = await db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${applications.appliedAt}), 'Mon')`,
        count: sql<number>`count(*)::int`
      })
      .from(applications)
      .where(
        and(
          eq(applications.applicantId, userId),
          sql`${applications.appliedAt} >= NOW() - INTERVAL '6 months'`
        )
      )
      .groupBy(sql`date_trunc('month', ${applications.appliedAt})`)
      .orderBy(sql`date_trunc('month', ${applications.appliedAt}) ASC`);

    const analyticsResponse = {
      statusOverview: statusData,
      applicationsOverTime: timeData
    };

    // 3. Store result in Redis cache (TTL: 2 hours)
    await redis.set(cacheKey, analyticsResponse, { ex: 7200 });

    res.json(analyticsResponse);
  }
);
