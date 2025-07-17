import { Request, Response, NextFunction } from 'express';
import { rateLimitService } from '../services/rate-limit.service';

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
}

export const rateLimit = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 60000, // 1 minute
    maxRequests = 100,
    keyPrefix = 'api:',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests, please try again later.'
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Create identifier based on IP and user ID if available
      const identifier = req.user?.id || req.ip || 'anonymous';
      const key = `${keyPrefix}${identifier}:${req.method}:${req.path}`;

      // Check rate limit
      const result = await rateLimitService.isAllowed(key, {
        windowMs,
        maxRequests
      });

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      });

      if (!result.allowed) {
        return res.status(429).json({
          message,
          status: 'error',
          code: 429,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }

      // Continue to next middleware
      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Continue if Redis fails
      next();
    }
  };
};

// Specific rate limit configurations
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts
  keyPrefix: 'auth:',
  message: 'Too many login attempts, please try again later.'
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  keyPrefix: 'api:',
  message: 'API rate limit exceeded, please try again later.'
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  keyPrefix: 'strict:',
  message: 'Too many requests, please slow down.'
});

export default rateLimit; 