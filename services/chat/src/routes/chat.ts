import express from "express";
import { isAuth } from "../middlewares/auth.js";
import {
    getConversations,
    getMessages,
    createConversation,
    markMessagesRead,
    getUnreadCount,
} from "../controllers/chat.js";

const router = express.Router();

router.get("/conversations", isAuth, getConversations);
router.get("/conversations/:conversationId/messages", isAuth, getMessages);
router.post("/conversations", isAuth, createConversation);
router.put("/messages/read/:conversationId", isAuth, markMessagesRead);
router.get("/unread-count", isAuth, getUnreadCount);

export default router;
