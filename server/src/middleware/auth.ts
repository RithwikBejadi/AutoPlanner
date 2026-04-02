import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.js";
import prisma from "../database/prisma.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies?.auth_token;

    if (!token) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User not found",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Token expired") {
        res.status(401).json({
          error: "Unauthorized",
          message: "Session expired",
        });
        return;
      }
      if (error.message === "Invalid token") {
        res.status(401).json({
          error: "Unauthorized",
          message: "Invalid authentication",
        });
        return;
      }
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Authentication failed",
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies?.auth_token;

    if (token) {
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true },
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
