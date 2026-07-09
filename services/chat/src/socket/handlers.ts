import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sql } from "../utils/db.js";
import { redisClient } from "../utils/redis.js";
import { publishToTopic } from "../producer.js";

interface ChatSocket extends Socket {
    data: {
        userId: number;
        userName: string;
        userEmail: string;
        role: string;
    };
}

export function setupSocket(io: Server) {
    // ── Authentication Middleware ──
    // Verifies JWT token on WebSocket connection handshake
    io.use(async (socket: Socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET_KEY as string
            ) as JwtPayload;

            if (!decoded || !decoded.userId) {
                return next(new Error("Invalid token"));
            }

            // Fetch user info to attach to socket
            const users = await sql`
        SELECT user_id, name, email, role FROM users WHERE user_id = ${decoded.userId}
      `;

            if (users.length === 0) {
                return next(new Error("User not found"));
            }

            const user = users[0];
            socket.data.userId = user.user_id;
            socket.data.userName = user.name;
            socket.data.userEmail = user.email;
            socket.data.role = user.role;

            next();
        } catch (error) {
            next(new Error("Authentication failed"));
        }
    });

    // ── Connection Handler ──
    io.on("connection", async (socket: ChatSocket) => {
        const userId = socket.data.userId;
        console.log(`🟢 User ${socket.data.userName} (${userId}) connected`);

        // Join personal room for directed notifications
        socket.join(`user:${userId}`);

        // Mark user as online in Redis (expires in 5 minutes, refreshed by heartbeat)
        try {
            await redisClient.set(`online:${userId}`, "true", { ex: 300 });
        } catch (err) {
            console.warn("⚠️  Redis: Could not set online status (presence tracking disabled)", (err as Error).message);
        }

        // Broadcast online status to other users
        socket.broadcast.emit("user-online", { userId });

        // ── Join Conversation Room ──
        socket.on("join-conversation", async (data: { conversationId: number }) => {
            try {
                const { conversationId } = data;

                // Verify user is part of this conversation
                const [conversation] = await sql`
          SELECT conversation_id FROM conversations 
          WHERE conversation_id = ${conversationId} 
          AND (applicant_id = ${userId} OR recruiter_id = ${userId})
        `;

                if (!conversation) {
                    socket.emit("error", { message: "Not authorized for this conversation" });
                    return;
                }

                socket.join(`conversation:${conversationId}`);
                console.log(`User ${userId} joined conversation:${conversationId}`);
            } catch (error) {
                console.error("Error joining conversation:", error);
                socket.emit("error", { message: "Failed to join conversation" });
            }
        });

        // ── Leave Conversation Room ──
        socket.on("leave-conversation", (data: { conversationId: number }) => {
            socket.leave(`conversation:${data.conversationId}`);
        });

        // ── Send Message ──
        socket.on(
            "send-message",
            async (data: { conversationId: number; content: string; type?: string }) => {
                try {
                    const { conversationId, content, type = "text" } = data;

                    if (!content || !content.trim()) {
                        socket.emit("error", { message: "Message content is required" });
                        return;
                    }

                    // Verify user is part of this conversation
                    const [conversation] = await sql`
            SELECT conversation_id, applicant_id, recruiter_id, job_id 
            FROM conversations 
            WHERE conversation_id = ${conversationId} 
            AND (applicant_id = ${userId} OR recruiter_id = ${userId})
          `;

                    if (!conversation) {
                        socket.emit("error", { message: "Not authorized" });
                        return;
                    }

                    // Save message to database
                    const [message] = await sql`
            INSERT INTO messages (conversation_id, sender_id, content, message_type)
            VALUES (${conversationId}, ${userId}, ${content.trim()}, ${type})
            RETURNING message_id, conversation_id, sender_id, content, message_type, is_read, created_at
          `;

                    // Update conversation's last_message_at
                    await sql`
            UPDATE conversations SET last_message_at = NOW() 
            WHERE conversation_id = ${conversationId}
          `;

                    // Attach sender info to the message
                    const messageWithSender = {
                        ...message,
                        sender_name: socket.data.userName,
                        sender_pic: null, // Could be fetched if needed
                    };

                    // Broadcast to everyone in the conversation room (including sender for confirmation)
                    io.to(`conversation:${conversationId}`).emit("new-message", messageWithSender);

                    // Determine recipient
                    const recipientId =
                        userId === conversation.applicant_id
                            ? conversation.recruiter_id
                            : conversation.applicant_id;

                    // Also send to recipient's personal room (for unread badge even if they're not in the conversation page)
                    io.to(`user:${recipientId}`).emit("new-message-notification", {
                        conversationId,
                        message: messageWithSender,
                    });

                    // Check if recipient is offline → send email notification via Kafka
                    let isOnline = false;
                    try {
                        isOnline = !!(await redisClient.get(`online:${recipientId}`));
                    } catch (err) {
                        console.warn("⚠️  Redis: Could not check online status", (err as Error).message);
                    }

                    if (!isOnline) {
                        // Get recipient's email
                        const [recipient] = await sql`
              SELECT email, name FROM users WHERE user_id = ${recipientId}
            `;

                        if (recipient) {
                            const [job] = await sql`
                SELECT title FROM jobs WHERE job_id = ${conversation.job_id}
              `;

                            await publishToTopic("send-mail", {
                                to: recipient.email,
                                subject: `New message from ${socket.data.userName} - HireHeaven`,
                                html: `
                  <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>You have a new message!</h2>
                    <p><strong>${socket.data.userName}</strong> sent you a message regarding <strong>${job?.title || "a job"}</strong>:</p>
                    <blockquote style="border-left: 3px solid #4F46E5; padding-left: 12px; color: #555;">
                      "${content.length > 200 ? content.substring(0, 200) + "..." : content}"
                    </blockquote>
                    <a href="${process.env.FRONTEND_URL}/chat/${conversationId}" 
                       style="display: inline-block; margin-top: 16px; padding: 10px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">
                      Open Chat
                    </a>
                  </div>
                `,
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error sending message:", error);
                    socket.emit("error", { message: "Failed to send message" });
                }
            }
        );

        // ── Typing Indicator ──
        socket.on("typing", (data: { conversationId: number }) => {
            socket.to(`conversation:${data.conversationId}`).emit("user-typing", {
                conversationId: data.conversationId,
                userId,
                userName: socket.data.userName,
            });
        });

        // ── Stop Typing ──
        socket.on("stop-typing", (data: { conversationId: number }) => {
            socket.to(`conversation:${data.conversationId}`).emit("user-stop-typing", {
                conversationId: data.conversationId,
                userId,
            });
        });

        // ── Mark Messages as Read ──
        socket.on("mark-read", async (data: { conversationId: number }) => {
            try {
                const { conversationId } = data;

                await sql`
          UPDATE messages SET is_read = true 
          WHERE conversation_id = ${conversationId} 
          AND sender_id != ${userId} 
          AND is_read = false
        `;

                // Notify the other user that their messages were read
                socket.to(`conversation:${conversationId}`).emit("messages-read", {
                    conversationId,
                    readBy: userId,
                });
            } catch (error) {
                console.error("Error marking messages as read:", error);
            }
        });

        // ── Heartbeat (refresh online status) ──
        socket.on("heartbeat", async () => {
            try {
                await redisClient.set(`online:${userId}`, "true", { ex: 300 });
            } catch (err) {
                // Silently fail — heartbeat is non-critical
            }
        });

        // ── Disconnect ──
        socket.on("disconnect", async () => {
            console.log(`🔴 User ${socket.data.userName} (${userId}) disconnected`);

            // Remove online status
            try {
                await redisClient.del(`online:${userId}`);
            } catch (err) {
                // Silently fail
            }

            // Broadcast offline status
            socket.broadcast.emit("user-offline", { userId });
        });
    });
}
