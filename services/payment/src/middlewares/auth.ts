import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { db } from "@app/db/client";
import { users, userSkills, skills } from "@app/db/schema";
import { eq, sql } from "drizzle-orm";

interface User {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  role: "jobseeker" | "recruiter";
  bio: string | null;
  resume: string | null;
  resume_public_id: string | null;
  profile_pic: string | null;
  profile_pic_public_id: string | null;
  skills: string[];
  subscription: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Authorization header is missing or invalid",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decodedPayload = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as JwtPayload;

    if (!decodedPayload || !decodedPayload.id) {
      res.status(401).json({
        message: "Invalid Token",
      });
      return;
    }

    const usersResult = await db.select({
      user_id: users.userId,
      name: users.name,
      email: users.email,
      phone_number: users.phoneNumber,
      role: users.role,
      bio: users.bio,
      resume: users.resume,
      resume_public_id: users.resumePublicId,
      profile_pic: users.profilePic,
      profile_pic_public_id: users.profilePicPublicId,
      subscription: users.subscription,
      skills: sql<string[]>`ARRAY_AGG(${skills.name}) FILTER (WHERE ${skills.name} IS NOT NULL)`
    })
    .from(users)
    .leftJoin(userSkills, eq(users.userId, userSkills.userId))
    .leftJoin(skills, eq(userSkills.skillId, skills.skillId))
    .where(eq(users.userId, decodedPayload.id))
    .groupBy(users.userId);

    if (usersResult.length === 0) {
      res.status(401).json({
        message: "User associated with this token no longer exists.",
      });
      return;
    }

    const user = usersResult[0] as User;

    user.skills = user.skills || [];

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "Authentication Failed. Please login again",
    });
  }
};
