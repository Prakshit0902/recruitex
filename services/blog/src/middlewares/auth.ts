import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sql } from "../utils/db.js";

// Minimal User interface for Blog Service
export interface User {
    user_id: number;
    name: string;
    role: "jobseeker" | "recruiter";
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

        if (!process.env.JWT_SECRET_KEY) {
            throw new Error("JWT_SEC is not defined");
        }

        const decodedPayload = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY
        ) as JwtPayload;

        if (!decodedPayload || !decodedPayload.id) {
            res.status(401).json({
                message: "Invalid Token",
            });
            return;
        }

        // Determine if we need to fetch from DB or trust token.
        // Ideally we trust token if it has role, but let's verify existence to be safe similar to user service.
        // Assuming we access the SAME database.

        const users = await sql`
      SELECT user_id, name, role 
      FROM users 
      WHERE user_id = ${decodedPayload.id}
    `;

        if (users.length === 0) {
            res.status(401).json({
                message: "User not found",
            });
            return;
        }

        const user = users[0] as User;
        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(401).json({
            message: "Authentication Failed",
        });
    }
};

export const isRecruiter = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.user?.role !== "recruiter") {
        res.status(403).json({ message: "Access denied. Recruiters only." });
        return;
    }
    next();
};
