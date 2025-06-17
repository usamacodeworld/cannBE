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
  let token: string | null = null;
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      res
        .status(401)
        .json(getResponseAPI("401", { message: "Authentication required" }));
      return;
    }

    // Enhanced token extraction
    const [scheme, receivedToken] = authHeader.trim().split(/\s+/);

    if (!scheme || scheme.toLowerCase() !== "bearer") {
      res.status(401).json(
        getResponseAPI("401", {
          message: "Invalid authorization scheme. Use: Bearer <token>",
        })
      );
      return;
    }

    if (!receivedToken) {
      res.status(401).json(
        getResponseAPI("401", {
          message: "Token is missing",
        })
      );
      return;
    }

    token = receivedToken.trim();
    console.log("token ===>", token);
    // Validate token structure
    const parts = token.split(".");
    if (parts.length !== 3) {
      res.status(401).json(
        getResponseAPI("401", {
          message: "Malformed token structure",
          hint: "JWT must have 3 parts separated by dots",
        })
      );
      return;
    }

    // Debug: Validate Base64URL encoding
    const [header, payload, signature] = parts;
    const base64UrlPattern = /^[A-Za-z0-9_-]+$/;

    if (
      !base64UrlPattern.test(header) ||
      !base64UrlPattern.test(payload) ||
      !base64UrlPattern.test(signature)
    ) {
      res.status(401).json(
        getResponseAPI("401", {
          message: "Invalid token encoding",
          hint: "Token must use Base64URL encoding",
        })
      );
      return;
    }

    // Debug: Attempt to decode header
    try {
      const decodedHeader = JSON.parse(
        Buffer.from(header, "base64").toString()
      );
      console.debug("Token header:", decodedHeader);

      // Verify algorithm matches
      if (decodedHeader.alg !== "HS256") {
        res.status(401).json(
          getResponseAPI("401", {
            message: "Unsupported token algorithm",
            hint: "Expected HS256 algorithm",
          })
        );
        return;
      }
    } catch (headerError) {
      res.status(401).json(
        getResponseAPI("401", {
          message: "Invalid token header",
          hint: "Failed to decode header",
        })
      );
      return;
    }

    // Actual verification
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
    });

    if (!user) {
      res
        .status(401)
        .json(getResponseAPI("401", { message: "User not found" }));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    // Enhanced error diagnostics
    let errorMessage = "Invalid token";
    let debugInfo = {};

    if (error instanceof jwt.TokenExpiredError) {
      errorMessage = "Token expired";
    } else if (error instanceof jwt.JsonWebTokenError) {
      errorMessage = error.message;

      // Provide structural debug info
      if (token) {
        debugInfo = {
          tokenLength: token.length,
          tokenPrefix: token.substring(0, 10),
          tokenSuffix: token.substring(token.length - 10),
          parts: token.split(".").length,
        };
      }
    }

    // Security: Only show debug info in development
    const response: any = { message: errorMessage };
    if (process.env.NODE_ENV === "development") {
      response.debug = debugInfo;
    }

    res.status(401).json(getResponseAPI("401", response));
    return;
  }
};
