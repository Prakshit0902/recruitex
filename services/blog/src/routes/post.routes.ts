import { Router } from "express";
import {
    createPost,
    getAllPosts,
    getPostBySlug,
    updatePost,
    deletePost,
    getMyPosts
} from "../controllers/post.controller.js";
import { isAuth, isRecruiter } from "../middlewares/auth.js";

const router = Router();

// Public routes
router.get("/", getAllPosts);
router.get("/:slug", getPostBySlug);

// Protected routes (Recruiter only)
router.post("/", isAuth, isRecruiter, createPost);
router.get("/user/my-posts", isAuth, isRecruiter, getMyPosts);
router.put("/:id", isAuth, isRecruiter, updatePost);
router.delete("/:id", isAuth, isRecruiter, deletePost);

export default router;
