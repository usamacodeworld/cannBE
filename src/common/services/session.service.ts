import { redis } from '../../config/redis';
import { User } from '../../modules/user/user.entity';

export interface SessionData {
  userId: string;
  userType: string;
  roles: string[];
  permissions: string[];
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class SessionService {
  private sessionPrefix = 'session:';
  private defaultTTL = 86400; // 24 hours

  /**
   * Create a new session
   */
  async createSession(sessionId: string, user: User, ipAddress?: string, userAgent?: string): Promise<void> {
    const sessionData: SessionData = {
      userId: user.id,
      userType: user.type,
      roles: user.roles?.map(role => role.name) || [],
      permissions: user.roles?.flatMap(role => role.permissions?.map(perm => perm.name) || []) || [],
      lastActivity: new Date(),
      ipAddress,
      userAgent
    };

    const key = this.sessionPrefix + sessionId;
    await redis.setex(key, this.defaultTTL, JSON.stringify(sessionData));
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const key = this.sessionPrefix + sessionId;
      const data = await redis.get(key);
      
      if (!data) return null;

      const sessionData: SessionData = JSON.parse(data);
      
      // Update last activity
      sessionData.lastActivity = new Date();
      await redis.setex(key, this.defaultTTL, JSON.stringify(sessionData));
      
      return sessionData;
    } catch (error) {
      console.error('Session get error:', error);
      return null;
    }
  }

  /**
   * Update session data
   */
  async updateSession(sessionId: string, updates: Partial<SessionData>): Promise<void> {
    try {
      const key = this.sessionPrefix + sessionId;
      const existingData = await this.getSession(sessionId);
      
      if (!existingData) return;

      const updatedData = { ...existingData, ...updates, lastActivity: new Date() };
      await redis.setex(key, this.defaultTTL, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Session update error:', error);
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const key = this.sessionPrefix + sessionId;
      await redis.del(key);
    } catch (error) {
      console.error('Session delete error:', error);
    }
  }

  /**
   * Extend session TTL
   */
  async extendSession(sessionId: string, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const key = this.sessionPrefix + sessionId;
      await redis.expire(key, ttl);
    } catch (error) {
      console.error('Session extend error:', error);
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      const pattern = this.sessionPrefix + '*';
      const keys = await redis.keys(pattern);
      const sessions: SessionData[] = [];

      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          const sessionData: SessionData = JSON.parse(data);
          if (sessionData.userId === userId) {
            sessions.push(sessionData);
          }
        }
      }

      return sessions;
    } catch (error) {
      console.error('Get user sessions error:', error);
      return [];
    }
  }

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(userId: string): Promise<void> {
    try {
      const sessions = await this.getUserSessions(userId);
      for (const session of sessions) {
        // Extract session ID from the session data
        const pattern = this.sessionPrefix + '*';
        const keys = await redis.keys(pattern);
        
        for (const key of keys) {
          const data = await redis.get(key);
          if (data) {
            const sessionData: SessionData = JSON.parse(data);
            if (sessionData.userId === userId) {
              await redis.del(key);
            }
          }
        }
      }
    } catch (error) {
      console.error('Delete user sessions error:', error);
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const pattern = this.sessionPrefix + '*';
      const keys = await redis.keys(pattern);
      let deletedCount = 0;

      for (const key of keys) {
        const ttl = await redis.ttl(key);
        if (ttl <= 0) {
          await redis.del(key);
          deletedCount++;
        }
      }

      console.log(`🧹 Cleaned up ${deletedCount} expired sessions`);
      return deletedCount;
    } catch (error) {
      console.error('Cleanup expired sessions error:', error);
      return 0;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<any> {
    try {
      const pattern = this.sessionPrefix + '*';
      const keys = await redis.keys(pattern);
      const stats = {
        totalSessions: keys.length,
        activeSessions: 0,
        expiredSessions: 0
      };

      for (const key of keys) {
        const ttl = await redis.ttl(key);
        if (ttl > 0) {
          stats.activeSessions++;
        } else {
          stats.expiredSessions++;
        }
      }

      return stats;
    } catch (error) {
      console.error('Session stats error:', error);
      return { totalSessions: 0, activeSessions: 0, expiredSessions: 0 };
    }
  }
}

// Export singleton instance
export const sessionService = new SessionService();
export default sessionService; 