import { Request, Response } from "express";
import { db } from "@app/db/client";
import { blogPosts } from "@app/db/schema";
import { eq, and, or, sql, desc, ilike, arrayContains } from "drizzle-orm";
import { CreatePostSchema, UpdatePostSchema } from "../models/post.model.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { ZodError } from "zod";
import redisClient from "../lib/redis.js";

// Helper to generate slug
const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
};

export const createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const validation = CreatePostSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({ message: "Validation Error", errors: validation.error.format() });
            return;
        }

        const { title, tags, coverImage, sections } = validation.data;
        const slug = validation.data.slug || generateSlug(title);

        // Check if slug exists
        const existing = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, slug));
        if (existing.length > 0) {
            res.status(400).json({ message: "Slug already exists. Please choose a different title or slug." });
            return;
        }

        const result = await db.insert(blogPosts).values({
            title,
            slug,
            authorId: user.user_id,
            tags: tags || [],
            coverImage: coverImage || null,
            sections: sections
        }).returning();

        // Invalidate caches
        const keys = await redisClient.keys('blog:posts:all:*');
        if (keys.length > 0) await Promise.all(keys.map(key => redisClient.del(key)));

        const userKeys = await redisClient.keys(`blog:user:${user.user_id}:posts:*`);
        if (userKeys.length > 0) await Promise.all(userKeys.map(key => redisClient.del(key)));

        res.status(201).json({ message: "Post created successfully", post: result[0] });
    } catch (error) {
        console.error("Create Post Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, search, tag } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const cacheKey = `blog:posts:all:${JSON.stringify(req.query)}`;
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            res.status(200).json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData);
            return;
        }

        let posts;
        let total;
        
        let conditions: any[] = [];
        if (search) conditions.push(ilike(blogPosts.title, `%${search}%`));
        if (tag) conditions.push(sql`${tag}::text = ANY(${blogPosts.tags})`);
        
        const finalCondition = conditions.length > 0 ? and(...conditions) : undefined;

        posts = await db.select().from(blogPosts)
            .where(finalCondition)
            .orderBy(desc(blogPosts.createdAt))
            .limit(Number(limit))
            .offset(offset);
            
        const countResult = await db.select({ total: sql<number>`COUNT(*)::int` }).from(blogPosts).where(finalCondition);
        total = countResult[0].total;

        const response = {
            posts,
            total,
            page: Number(page),
            limit: Number(limit)
        };

        await redisClient.set(cacheKey, JSON.stringify(response), { ex: 3600 });

        res.status(200).json(response);
    } catch (error) {
        console.error("Get All Posts Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const slug = req.params.slug as string; // Treat ID param as slug or create dedicated endpoint
        // Assuming /:idOrSlug

        const cacheKey = `blog:post:${slug}`;
        const cachedData = await redisClient.get<any>(cacheKey);

        if (cachedData) {
            res.status(200).json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData);
            return;
        }

        // Check if UUID or Slug. Actually let's assume slug for public URL.
        let postCondition = eq(blogPosts.slug, slug);
        if (!isNaN(Number(slug))) {
            postCondition = or(eq(blogPosts.slug, slug), eq(blogPosts.id, Number(slug))) as any;
        }

        const result = await db.select().from(blogPosts).where(postCondition);

        if (result.length === 0) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        await redisClient.set(cacheKey, JSON.stringify(result[0]), { ex: 86400 });

        // Fetch author details if needed (optional join)
        // For now returning raw post
        res.status(200).json(result[0]);
    } catch (error) {
        console.error("Get Post Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // functionality to verify ownership
        const existing = await db.select({ author_id: blogPosts.authorId, slug: blogPosts.slug }).from(blogPosts).where(eq(blogPosts.id, Number(id)));
        if (existing.length === 0) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        if (existing[0].author_id !== user?.user_id) {
            res.status(403).json({ message: "Forbidden. You are not the author." });
            return;
        }

        const validation = UpdatePostSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ message: "Validation Error", errors: validation.error.format() });
            return;
        }

        const { title, tags, coverImage, sections, slug } = validation.data;
        const result = await db.update(blogPosts).set({
            title: title ?? undefined,
            slug: slug ?? undefined,
            tags: tags ?? undefined,
            coverImage: coverImage ?? undefined,
            sections: sections ?? undefined,
            updatedAt: new Date()
        }).where(eq(blogPosts.id, Number(id))).returning();

        // Invalidate specific post cache
        await redisClient.del(`blog:post:${result[0].slug}`);
        // If slug changed, invalidate old slug too? For simplicity, we assume slug is primary key for cache
        if (existing[0].slug && existing[0].slug !== result[0].slug) {
            await redisClient.del(`blog:post:${existing[0].slug}`);
        }

        // Invalidate lists
        const keys = await redisClient.keys('blog:posts:all:*');
        if (keys.length > 0) await Promise.all(keys.map(key => redisClient.del(key)));

        const userKeys = await redisClient.keys(`blog:user:${user.user_id}:posts:*`);
        if (userKeys.length > 0) await Promise.all(userKeys.map(key => redisClient.del(key)));

        res.status(200).json({ message: "Post updated", post: result[0] });
    } catch (error) {
        console.error("Update Post Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const existing = await db.select({ author_id: blogPosts.authorId }).from(blogPosts).where(eq(blogPosts.id, Number(id)));
        if (existing.length === 0) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        if (existing[0].author_id !== user?.user_id) {
            res.status(403).json({ message: "Forbidden. You are not the author." });
            return;
        }

        const deletedPost = await db.delete(blogPosts).where(eq(blogPosts.id, Number(id))).returning({ slug: blogPosts.slug });

        if (deletedPost.length > 0) {
            await redisClient.del(`blog:post:${deletedPost[0].slug}`);
        }

        // Invalidate lists
        const keys = await redisClient.keys('blog:posts:all:*');
        if (keys.length > 0) await Promise.all(keys.map(key => redisClient.del(key)));

        const userKeys = await redisClient.keys(`blog:user:${user.user_id}:posts:*`);
        if (userKeys.length > 0) await Promise.all(userKeys.map(key => redisClient.del(key)));

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Delete Post Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMyPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const cacheKey = `blog:user:${user.user_id}:posts:${JSON.stringify(req.query)}`;
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            res.status(200).json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData);
            return;
        }

        const posts = await db.select().from(blogPosts)
            .where(eq(blogPosts.authorId, user.user_id))
            .orderBy(desc(blogPosts.createdAt))
            .limit(Number(limit))
            .offset(offset);

        const countResult = await db.select({ total: sql<number>`COUNT(*)::int` }).from(blogPosts).where(eq(blogPosts.authorId, user.user_id));
        const total = countResult[0].total;

        const response = {
            posts,
            total,
            page: Number(page),
            limit: Number(limit)
        };

        await redisClient.set(cacheKey, JSON.stringify(response), { ex: 3600 });

        res.status(200).json(response);
    } catch (error) {
        console.error("Get My Posts Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
