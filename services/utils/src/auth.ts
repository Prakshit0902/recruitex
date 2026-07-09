import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sql } from "@app/db/client";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authentication required — no token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as { userId: number };

    const users = await sql`SELECT * FROM users WHERE user_id = ${decoded.userId}`;

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid token — user not found" });
    }

    req.user = users[0];
    next();
  } catch (error: any) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
