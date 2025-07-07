import { redis } from '../../config/redis';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix?: string; // Key prefix for Redis
}

export class RateLimitService {
  private defaultConfig: RateLimitConfig = {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    keyPrefix: 'rate_limit:'
  };

  /**
   * Check if request is allowed
   */
  async isAllowed(identifier: string, config?: Partial<RateLimitConfig>): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const key = `${finalConfig.keyPrefix}${identifier}`;
    const now = Date.now();
    const windowStart = now - finalConfig.windowMs;

    try {
      // Get current count
      const currentCount = await redis.get(key);
      const count = currentCount ? parseInt(currentCount) : 0;

      // Check if window has passed
      if (count === 0) {
        // First request in new window
        await redis.setex(key, Math.ceil(finalConfig.windowMs / 1000), '1');
        return {
          allowed: true,
          remaining: finalConfig.maxRequests - 1,
          resetTime: now + finalConfig.windowMs
        };
      }

      // Check if limit exceeded
      if (count >= finalConfig.maxRequests) {
        const ttl = await redis.ttl(key);
        return {
          allowed: false,
          remaining: 0,
          resetTime: now + (ttl * 1000)
        };
      }

      // Increment counter
      await redis.incr(key);
      const newCount = count + 1;

      return {
        allowed: true,
        remaining: finalConfig.maxRequests - newCount,
        resetTime: now + finalConfig.windowMs
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Allow request if Redis fails
      return {
        allowed: true,
        remaining: finalConfig.maxRequests,
        resetTime: now + finalConfig.windowMs
      };
    }
  }

  /**
   * Reset rate limit for an identifier
   */
  async reset(identifier: string, config?: Partial<RateLimitConfig>): Promise<void> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const key = `${finalConfig.keyPrefix}${identifier}`;
    
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Rate limit reset error:', error);
    }
  }

  /**
   * Get current rate limit status
   */
  async getStatus(identifier: string, config?: Partial<RateLimitConfig>): Promise<{
    current: number;
    remaining: number;
    resetTime: number;
    limit: number;
  }> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const key = `${finalConfig.keyPrefix}${identifier}`;
    const now = Date.now();

    try {
      const currentCount = await redis.get(key);
      const count = currentCount ? parseInt(currentCount) : 0;
      const ttl = await redis.ttl(key);

      return {
        current: count,
        remaining: Math.max(0, finalConfig.maxRequests - count),
        resetTime: ttl > 0 ? now + (ttl * 1000) : now,
        limit: finalConfig.maxRequests
      };
    } catch (error) {
      console.error('Rate limit status error:', error);
      return {
        current: 0,
        remaining: finalConfig.maxRequests,
        resetTime: now,
        limit: finalConfig.maxRequests
      };
    }
  }

  /**
   * Clean up expired rate limit keys
   */
  async cleanup(): Promise<number> {
    try {
      const pattern = `${this.defaultConfig.keyPrefix}*`;
      const keys = await redis.keys(pattern);
      let deletedCount = 0;

      for (const key of keys) {
        const ttl = await redis.ttl(key);
        if (ttl <= 0) {
          await redis.del(key);
          deletedCount++;
        }
      }

      console.log(`🧹 Cleaned up ${deletedCount} expired rate limit keys`);
      return deletedCount;
    } catch (error) {
      console.error('Rate limit cleanup error:', error);
      return 0;
    }
  }

  /**
   * Get rate limit statistics
   */
  async getStats(): Promise<any> {
    try {
      const pattern = `${this.defaultConfig.keyPrefix}*`;
      const keys = await redis.keys(pattern);
      const stats = {
        totalKeys: keys.length,
        activeKeys: 0,
        expiredKeys: 0
      };

      for (const key of keys) {
        const ttl = await redis.ttl(key);
        if (ttl > 0) {
          stats.activeKeys++;
        } else {
          stats.expiredKeys++;
        }
      }

      return stats;
    } catch (error) {
      console.error('Rate limit stats error:', error);
      return { totalKeys: 0, activeKeys: 0, expiredKeys: 0 };
    }
  }
}

// Export singleton instance
export const rateLimitService = new RateLimitService();
export default rateLimitService; 