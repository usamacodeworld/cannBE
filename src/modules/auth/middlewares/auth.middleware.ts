import { Request, Response, NextFunction } from "express";
import { User } from "../../user/user.entity";
import { RES_CODE } from "../../../constants/responseCode";
import { verifyToken, getAccessToken, getRefreshToken } from "../../../libs/jwt";
import { AppDataSource } from "../../../config/database";
import { UserInfo } from "@/types/auth";
import { AuthService } from "../services/auth.service";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || "";
  const accessToken = header.split("Bearer ")[1];
  const refreshToken = req.headers["x-refresh-token"] as string;

  if (!accessToken) {
    // No token provided, continue without authentication (guest user)
    req.user = undefined;
    return next();
  }

  try {
    // Verify the access token
    const decoded = verifyToken(accessToken);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.id },
      relations: ['roles', 'roles.permissions']
    });

    if (!user) {
      // User not found, continue without authentication (guest user)
      req.user = undefined;
      return next();
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof Error && error.message === "Token expired") {
      // Try to refresh the token if refresh token is provided
      if (refreshToken) {
        try {
          const authService = new AuthService();
          const newTokens = await authService.refreshToken(refreshToken);
          
          // Set new tokens in response headers
          res.setHeader('X-New-Access-Token', newTokens.accessToken);
          res.setHeader('X-New-Refresh-Token', newTokens.refreshToken);
          
          // Get user info from the new access token
          const newDecoded = verifyToken(newTokens.accessToken);
          const userRepository = AppDataSource.getRepository(User);
          const user = await userRepository.findOne({
            where: { id: newDecoded.id },
            relations: ['roles', 'roles.permissions']
          });

          if (!user) {
            // User not found, continue without authentication (guest user)
            req.user = undefined;
            return next();
          }

          req.user = user;
          return next();
        } catch (refreshError) {
          // Refresh token is also invalid, continue without authentication (guest user)
          req.user = undefined;
          return next();
        }
      } else {
        // No refresh token provided, continue without authentication (guest user)
        req.user = undefined;
        return next();
      }
    }
    
    if (error instanceof Error && error.message === "Invalid token") {
      // Invalid token, continue without authentication (guest user)
      req.user = undefined;
      return next();
    }

    return next(error);
  }
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || "";
  const accessToken = header.split("Bearer ")[1];
  const refreshToken = req.headers["x-refresh-token"] as string;

  if (!accessToken) {
    // Store auth error in res.locals for logging
    res.locals.authError = {
      type: "NO_TOKEN_PROVIDED",
      message: RES_CODE.NO_TOKEN_PROVIDED
    };
    res.status(401).json({ message: RES_CODE.NO_TOKEN_PROVIDED, code: 1 });
    return;
  }

  try {
    // Verify the access token
    const decoded = verifyToken(accessToken);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.id },
      relations: ['roles', 'roles.permissions']
    });

    if (!user) {
      // Store auth error in res.locals for logging
      res.locals.authError = {
        type: "USER_NOT_FOUND",
        message: RES_CODE["401"],
        userId: decoded.id
      };
      res.status(401).json({ message: RES_CODE["401"], code: 1 });
      return;
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof Error && error.message === "Token expired") {
      // Try to refresh the token if refresh token is provided
      if (refreshToken) {
        try {
          const authService = new AuthService();
          const newTokens = await authService.refreshToken(refreshToken);
          
          // Set new tokens in response headers
          res.setHeader('X-New-Access-Token', newTokens.accessToken);
          res.setHeader('X-New-Refresh-Token', newTokens.refreshToken);
          
          // Get user info from the new access token
          const newDecoded = verifyToken(newTokens.accessToken);
          const userRepository = AppDataSource.getRepository(User);
          const user = await userRepository.findOne({
            where: { id: newDecoded.id },
            relations: ['roles', 'roles.permissions']
          });

          if (!user) {
            res.status(401).json({ message: RES_CODE["401"], code: 1 });
            return;
          }

          req.user = user;
          return next();
        } catch (refreshError) {
          // Refresh token is also invalid, return 401
          res.locals.authError = {
            type: "REFRESH_TOKEN_INVALID",
            message: RES_CODE.TOKEN_EXPIRED
          };
          res.status(401).json({ 
            message: RES_CODE.TOKEN_EXPIRED, 
            code: 1,
            requiresReauth: true 
          });
          return;
        }
      } else {
        // No refresh token provided, return 401 with indication that refresh token is needed
        res.locals.authError = {
          type: "TOKEN_EXPIRED_NO_REFRESH",
          message: RES_CODE.TOKEN_EXPIRED
        };
        res.status(401).json({ 
          message: RES_CODE.TOKEN_EXPIRED, 
          code: 1,
          requiresRefreshToken: true 
        });
        return;
      }
    }
    
    if (error instanceof Error && error.message === "Invalid token") {
      // Store auth error in res.locals for logging
      res.locals.authError = {
        type: "INVALID_TOKEN_SIGNATURE",
        message: RES_CODE.INVALID_TOKEN_SIGNATURE
      };
      res.status(401).json({ message: RES_CODE.INVALID_TOKEN_SIGNATURE, code: 1 });
      return;
    }

    return next(error);
  }
};

// export const authenticate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   let token: string | null = null;
//   try {
//     const authHeader = req.headers.authorization || "";

//     if (!authHeader) {
//       res
//         .status(401)
//         .json(getResponseAPI("401", { message: "Authentication required" }));
//       return;
//     }

//     // Enhanced token extraction
//     const [scheme, receivedToken] = authHeader.trim().split(/\s+/);

//     if (!scheme || scheme.toLowerCase() !== "bearer") {
//       res.status(401).json(
//         getResponseAPI("401", {
//           message: "Invalid authorization scheme. Use: Bearer <token>",
//         })
//       );
//       return;
//     }

//     if (!receivedToken) {
//       res.status(401).json(
//         getResponseAPI("401", {
//           message: "Token is missing",
//         })
//       );
//       return;
//     }

//     token = receivedToken.trim();
//     console.log("token ===>", token);
//     // Validate token structure
//     const parts = token.split(".");
//     if (parts.length !== 3) {
//       res.status(401).json(
//         getResponseAPI("401", {
//           message: "Malformed token structure",
//           hint: "JWT must have 3 parts separated by dots",
//         })
//       );
//       return;
//     }

//     // Debug: Validate Base64URL encoding
//     const [header, payload, signature] = parts;
//     const base64UrlPattern = /^[A-Za-z0-9_-]+$/;

//     if (
//       !base64UrlPattern.test(header) ||
//       !base64UrlPattern.test(payload) ||
//       !base64UrlPattern.test(signature)
//     ) {
//       res.status(401).json(
//         getResponseAPI("401", {
//           message: "Invalid token encoding",
//           hint: "Token must use Base64URL encoding",
//         })
//       );
//       return;
//     }

//     // Debug: Attempt to decode header
//     try {
//       const decodedHeader = JSON.parse(
//         Buffer.from(header, "base64").toString()
//       );
//       console.debug("Token header:", decodedHeader);

//       // Verify algorithm matches
//       if (decodedHeader.alg !== "HS256") {
//         res.status(401).json(
//           getResponseAPI("401", {
//             message: "Unsupported token algorithm",
//             hint: "Expected HS256 algorithm",
//           })
//         );
//         return;
//       }
//     } catch (headerError) {
//       res.status(401).json(
//         getResponseAPI("401", {
//           message: "Invalid token header",
//           hint: "Failed to decode header",
//         })
//       );
//       return;
//     }

//     // Actual verification
//     const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
//     const user = await userRepository.findOne({
//       where: { id: decoded.userId },
//     });

//     if (!user) {
//       res
//         .status(401)
//         .json(getResponseAPI("401", { message: "User not found" }));
//       return;
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error("Authentication error:", error);

//     // Enhanced error diagnostics
//     let errorMessage = "Invalid token";
//     let debugInfo = {};

//     if (error instanceof jwt.TokenExpiredError) {
//       errorMessage = "Token expired";
//     } else if (error instanceof jwt.JsonWebTokenError) {
//       errorMessage = error.message;

//       // Provide structural debug info
//       if (token) {
//         debugInfo = {
//           tokenLength: token.length,
//           tokenPrefix: token.substring(0, 10),
//           tokenSuffix: token.substring(token.length - 10),
//           parts: token.split(".").length,
//         };
//       }
//     }

//     // Security: Only show debug info in development
//     const response: any = { message: errorMessage };
//     if (process.env.NODE_ENV === "development") {
//       response.debug = debugInfo;
//     }

//     res.status(401).json(getResponseAPI("401", response));
//     return;
//   }
// };
