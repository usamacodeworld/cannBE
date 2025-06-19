// eslint-disable-next-line @typescript-eslint/no-require-imports
import jwt from "jsonwebtoken";

import type { RegisteredUserInfo, UserInfo } from "@/types/auth";
import type {
  AccessTokenPayload,
  AccessTokenPayloadGuestUser,
  AccessTokenPayloadRegisteredUser,
} from "./type";

const secretKey = process.env.JWT_SECRET || "your-secret-key"; // Fallback for development

const transformUserInfo = (
  user: UserInfo
): Omit<AccessTokenPayload, "iat" | "exp"> => {
  if ("isGuest" in user && user.isGuest) {
    return {
      id: user.id,
      email: user.email,
    } as AccessTokenPayloadGuestUser;
  }

  const regUser = user as RegisteredUserInfo;
  return {
    id: regUser.id,
    email: regUser.email,
  } as AccessTokenPayloadRegisteredUser;
};

export const getAccessToken = (user: UserInfo): string => {
  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined");
  }

  const payload = transformUserInfo(user);
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRE || "1h") as jwt.SignOptions["expiresIn"],
    algorithm: 'HS256', // Using HS256 for shorter tokens
    noTimestamp: true, // Remove timestamp to reduce token size
  };

  return jwt.sign(payload, secretKey, options);
};

export const getRefreshToken = (user: UserInfo): string => {
  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined");
  }

  const payload = transformUserInfo(user);
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_TOKEN_EXPIRE || "1d") as jwt.SignOptions["expiresIn"],
    algorithm: 'HS256', // Using HS256 for shorter tokens
    noTimestamp: true, // Remove timestamp to reduce token size
  };

  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = (token: string): AccessTokenPayload => {
  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    const decoded = jwt.verify(token, secretKey) as AccessTokenPayload;
    return decoded;
  } catch (error) {
    console.log("Not verified");
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    throw error;
  }
};

export const decodeToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.decode(token) as AccessTokenPayload;
  if (!decoded) {
    throw new Error("Invalid token");
  }
  return decoded;
};

export const checkExpiredToken = (token: string): boolean => {
  const decoded = decodeToken(token);
  return decoded.exp < Math.floor(Date.now() / 1000);
};
