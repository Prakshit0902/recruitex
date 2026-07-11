import { AuthenticatedRequest } from "../middlewares/auth.js";
import { db } from "@app/db/client";
import { conversations, messages, jobs, company, users, applications } from "@app/db/schema";
import { eq, and, or, sql, desc, aliasedTable } from "drizzle-orm";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

// Get all conversations for the current user
export const getConversations = TryCatch(
    async (req: AuthenticatedRequest, res) => {
        const user = req.user;

        if (!user) {
            throw new ErrorHandler(401, "Authentication required");
        }

        const applicant_user = aliasedTable(users, 'applicant_user');
        const recruiter_user = aliasedTable(users, 'recruiter_user');

        const conversationsResult = await db.select({
            conversationId: conversations.conversationId,
            applicationId: conversations.applicationId,
            jobId: conversations.jobId,
            applicantId: conversations.applicantId,
            recruiterId: conversations.recruiterId,
            lastMessageAt: conversations.lastMessageAt,
            createdAt: conversations.createdAt,
            jobTitle: jobs.title,
            companyName: company.name,
            companyLogo: company.logo,
            applicantName: applicant_user.name,
            applicantPic: applicant_user.profilePic,
            recruiterName: recruiter_user.name,
            recruiterPic: recruiter_user.profilePic,
            unreadCount: sql<number>`(
                SELECT COUNT(*)::int FROM messages m 
                WHERE m.conversation_id = ${conversations.conversationId} 
                AND m.sender_id != ${user.user_id} 
                AND m.is_read = false
            )`.as('unread_count'),
            lastMessage: sql<string>`(
                SELECT content FROM messages m 
                WHERE m.conversation_id = ${conversations.conversationId} 
                ORDER BY m.created_at DESC LIMIT 1
            )`.as('last_message')
        })
        .from(conversations)
        .innerJoin(jobs, eq(conversations.jobId, jobs.jobId))
        .innerJoin(company, eq(jobs.companyId, company.companyId))
        .innerJoin(applicant_user, eq(conversations.applicantId, applicant_user.userId))
        .innerJoin(recruiter_user, eq(conversations.recruiterId, recruiter_user.userId))
        .where(
            or(eq(conversations.applicantId, user.user_id), eq(conversations.recruiterId, user.user_id))
        )
        .orderBy(sql`${conversations.lastMessageAt} DESC NULLS LAST`);

        res.json(conversationsResult);
    }
);

// Get messages for a conversation (paginated)
export const getMessages = TryCatch(
    async (req: AuthenticatedRequest, res) => {
        const user = req.user;

        if (!user) {
            throw new ErrorHandler(401, "Authentication required");
        }

        const { conversationId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = (page - 1) * limit;

        // Verify the user is part of this conversation
        const conversationResult = await db.select({
            conversation_id: conversations.conversationId
        }).from(conversations).where(
            and(
                eq(conversations.conversationId, Number(conversationId)),
                or(eq(conversations.applicantId, user.user_id), eq(conversations.recruiterId, user.user_id))
            )
        );
        const conversation = conversationResult[0];

        if (!conversation) {
            throw new ErrorHandler(
                403,
                "You are not authorized to view this conversation"
            );
        }

        const messagesResult = await db.select({
            messageId: messages.messageId,
            conversationId: messages.conversationId,
            senderId: messages.senderId,
            content: messages.content,
            messageType: messages.messageType,
            isRead: messages.isRead,
            createdAt: messages.createdAt,
            senderName: users.name,
            senderPic: users.profilePic
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.userId))
        .where(eq(messages.conversationId, Number(conversationId)))
        .orderBy(messages.createdAt)
        .limit(limit)
        .offset(offset);

        const countResult = await db.select({
            total: sql<number>`COUNT(*)::int`
        }).from(messages).where(eq(messages.conversationId, Number(conversationId)));
        const total = countResult[0].total;

        res.json({
            messages: messagesResult,
            page,
            limit,
            total,
            hasMore: offset + limit < total,
        });
    }
);

// Create a new conversation (or return existing one)
export const createConversation = TryCatch(
    async (req: AuthenticatedRequest, res) => {
        const user = req.user;

        if (!user) {
            throw new ErrorHandler(401, "Authentication required");
        }

        const { application_id } = req.body;

        if (!application_id) {
            throw new ErrorHandler(400, "application_id is required");
        }

        const applicationsResult = await db.select({
            application_id: applications.applicationId,
            job_id: applications.jobId,
            applicant_id: applications.applicantId,
            recruiter_id: jobs.postedByRecruiter
        })
        .from(applications)
        .innerJoin(jobs, eq(applications.jobId, jobs.jobId))
        .where(eq(applications.applicationId, application_id));
        const application = applicationsResult[0];

        if (!application) {
            throw new ErrorHandler(404, "Application not found");
        }

        // Verify the current user is either the applicant or the recruiter
        if (
            user.user_id !== application.applicant_id &&
            user.user_id !== application.recruiter_id
        ) {
            throw new ErrorHandler(
                403,
                "You are not authorized to create this conversation"
            );
        }

        // Check if conversation already exists for this application
        const existingConversations = await db.select().from(conversations).where(eq(conversations.applicationId, application_id));

        if (existingConversations.length > 0) {
            res.json({
                message: "Conversation already exists",
                conversation: {
                    ...existingConversations[0],
                    conversation_id: existingConversations[0].conversationId
                },
            });
            return;
        }

        // Create new conversation
        const newConversationsResult = await db.insert(conversations).values({
            applicationId: application.application_id,
            applicantId: application.applicant_id,
            recruiterId: application.recruiter_id,
            jobId: application.job_id
        }).returning();
        const newConversation = newConversationsResult[0];

        res.status(201).json({
            message: "Conversation created",
            conversation: {
                ...newConversation,
                conversation_id: newConversation.conversationId
            },
        });
    }
);

// Mark all messages in a conversation as read
export const markMessagesRead = TryCatch(
    async (req: AuthenticatedRequest, res) => {
        const user = req.user;

        if (!user) {
            throw new ErrorHandler(401, "Authentication required");
        }

        const { conversationId } = req.params;

        // Verify user is part of this conversation
        const conversationResult = await db.select({
            conversation_id: conversations.conversationId
        }).from(conversations).where(
            and(
                eq(conversations.conversationId, Number(conversationId)),
                or(eq(conversations.applicantId, user.user_id), eq(conversations.recruiterId, user.user_id))
            )
        );
        const conversation = conversationResult[0];

        if (!conversation) {
            throw new ErrorHandler(
                403,
                "You are not authorized to access this conversation"
            );
        }

        // Mark messages from the OTHER person as read
        await db.update(messages).set({ isRead: true }).where(
            and(
                eq(messages.conversationId, Number(conversationId)),
                sql`${messages.senderId} != ${user.user_id}`,
                eq(messages.isRead, false)
            )
        );

        res.json({ message: "Messages marked as read" });
    }
);

// Get total unread message count for the current user
export const getUnreadCount = TryCatch(
    async (req: AuthenticatedRequest, res) => {
        const user = req.user;

        if (!user) {
            throw new ErrorHandler(401, "Authentication required");
        }

        const countResult = await db.select({
            unread_count: sql<number>`COUNT(*)::int`
        })
        .from(messages)
        .innerJoin(conversations, eq(messages.conversationId, conversations.conversationId))
        .where(
            and(
                or(eq(conversations.applicantId, user.user_id), eq(conversations.recruiterId, user.user_id)),
                sql`${messages.senderId} != ${user.user_id}`,
                eq(messages.isRead, false)
            )
        );
        const result = countResult[0];

        res.json({ unread_count: result.unread_count });
    }
);
