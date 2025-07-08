import { redis } from '../../config/redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
}

export class CacheService {
  private defaultTTL = 3600; // 1 hour default

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const { ttl = this.defaultTTL } = options;
      const serializedValue = JSON.stringify(value);
      
      if (ttl > 0) {
        await redis.setex(key, ttl, serializedValue);
      } else {
        await redis.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`🗑️ Deleted ${keys.length} cache keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Set expiration time for existing key
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await redis.expire(key, ttl);
    } catch (error) {
      console.error('Cache expire error:', error);
    }
  }

  /**
   * Get time to live for key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error('Cache TTL error:', error);
      return -1;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, value: number = 1): Promise<number> {
    try {
      return await redis.incrby(key, value);
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Decrement counter
   */
  async decrement(key: string, value: number = 1): Promise<number> {
    try {
      return await redis.decrby(key, value);
    } catch (error) {
      console.error('Cache decrement error:', error);
      return 0;
    }
  }

  /**
   * Add to set
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await redis.sadd(key, ...members);
    } catch (error) {
      console.error('Cache SADD error:', error);
      return 0;
    }
  }

  /**
   * Get set members
   */
  async smembers(key: string): Promise<string[]> {
    try {
      return await redis.smembers(key);
    } catch (error) {
      console.error('Cache SMEMBERS error:', error);
      return [];
    }
  }

  /**
   * Add to sorted set with score
   */
  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      return await redis.zadd(key, score, member);
    } catch (error) {
      console.error('Cache ZADD error:', error);
      return 0;
    }
  }

  /**
   * Get top members from sorted set
   */
  async zrevrange(key: string, start: number = 0, stop: number = -1): Promise<string[]> {
    try {
      return await redis.zrevrange(key, start, stop);
    } catch (error) {
      console.error('Cache ZREVRANGE error:', error);
      return [];
    }
  }

  /**
   * Clear all cache (use with caution!)
   */
  async clearAll(): Promise<void> {
    try {
      await redis.flushdb();
      console.log('🧹 All cache cleared');
    } catch (error) {
      console.error('Cache clear all error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    try {
      const info = await redis.info();
      const keys = await redis.dbsize();
      
      return {
        keys,
        info: info.split('\r\n').reduce((acc: any, line) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { keys: 0, info: {} };
    }
  }

  /**
   * Cache wrapper with automatic fallback
   */
  async cacheWrapper<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      console.log(`📦 Cache hit: ${key}`);
      return cached;
    }

    // Fetch fresh data
    console.log(`🔄 Cache miss: ${key}`);
    const data = await fetchFunction();
    
    // Cache the result
    await this.set(key, data, options);
    
    return data;
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export default cacheService; 