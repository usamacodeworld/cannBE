"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkExpiredToken = exports.decodeToken = exports.verifyToken = exports.getRefreshToken = exports.getAccessToken = void 0;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secretKey = process.env.JWT_SECRET || "your-secret-key"; // Fallback for development
const transformUserInfo = (user) => {
    if ("isGuest" in user && user.isGuest) {
        return {
            id: user.id,
            email: user.email,
        };
    }
    const regUser = user;
    return {
        id: regUser.id,
        email: regUser.email,
    };
};
const getAccessToken = (user) => {
    if (!secretKey) {
        throw new Error("JWT_SECRET is not defined");
    }
    const payload = transformUserInfo(user);
    const options = {
        expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRE || "1h"),
        algorithm: 'HS256', // Using HS256 for shorter tokens
        noTimestamp: true, // Remove timestamp to reduce token size
    };
    return jsonwebtoken_1.default.sign(payload, secretKey, options);
};
exports.getAccessToken = getAccessToken;
const getRefreshToken = (user) => {
    if (!secretKey) {
        throw new Error("JWT_SECRET is not defined");
    }
    const payload = transformUserInfo(user);
    const options = {
        expiresIn: (process.env.JWT_REFRESH_TOKEN_EXPIRE || "1d"),
        algorithm: 'HS256', // Using HS256 for shorter tokens
        noTimestamp: true, // Remove timestamp to reduce token size
    };
    return jsonwebtoken_1.default.sign(payload, secretKey, options);
};
exports.getRefreshToken = getRefreshToken;
const verifyToken = (token) => {
    if (!secretKey) {
        throw new Error("JWT_SECRET is not defined");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        return decoded;
    }
    catch (error) {
        console.log("Not verified");
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error("Invalid token");
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error("Token expired");
        }
        throw error;
    }
};
exports.verifyToken = verifyToken;
const decodeToken = (token) => {
    const decoded = jsonwebtoken_1.default.decode(token);
    if (!decoded) {
        throw new Error("Invalid token");
    }
    return decoded;
};
exports.decodeToken = decodeToken;
const checkExpiredToken = (token) => {
    const decoded = (0, exports.decodeToken)(token);
    return decoded.exp < Math.floor(Date.now() / 1000);
};
exports.checkExpiredToken = checkExpiredToken;
