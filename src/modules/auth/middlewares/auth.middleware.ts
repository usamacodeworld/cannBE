import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../../config/database";
import { User } from "../../user/entities/user.entity";
import { getResponseAPI } from "../../../common/getResponseAPI";

const userRepository = AppDataSource.getRepository(User);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      res.json(getResponseAPI("401", { message: "Authentication required" }));
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      res.json(getResponseAPI("401", { message: "Invalid token format" }));
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.json(getResponseAPI("401", { message: "User not found" }));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.json(getResponseAPI("401", { message: "Invalid token" }));
  }
};
