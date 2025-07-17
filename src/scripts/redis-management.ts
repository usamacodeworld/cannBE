#!/usr/bin/env ts-node

import { cacheService } from '../common/services/cache.service';
import { sessionService } from '../common/services/session.service';
import { rateLimitService } from '../common/services/rate-limit.service';
import { redis } from '../config/redis';

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case 'stats':
        await showStats();
        break;
      case 'clear':
        await clearCache(args[0]);
        break;
      case 'keys':
        await listKeys(args[0]);
        break;
      case 'cleanup':
        await cleanup();
        break;
      case 'monitor':
        await monitor();
        break;
      default:
        console.log(`
🔧 Redis Management Script

Usage: yarn redis <command> [args]

Commands:
  stats                    - Show cache statistics
  clear [pattern]          - Clear cache (all or by pattern)
  keys [pattern]           - List cache keys
  cleanup                  - Clean up expired keys
  monitor                  - Monitor Redis in real-time

Examples:
  yarn redis stats
  yarn redis clear
  yarn redis clear "home:*"
  yarn redis keys "cart:*"
  yarn redis cleanup
  yarn redis monitor
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await redis.quit();
  }
}

async function showStats() {
  console.log('📊 Cache Statistics');
  console.log('==================');
  
  const cacheStats = await cacheService.getStats();
  const sessionStats = await sessionService.getSessionStats();
  const rateLimitStats = await rateLimitService.getStats();
  
  console.log(`\n🔑 Total Keys: ${cacheStats.keys}`);
  console.log(`📈 Memory Usage: ${cacheStats.info.used_memory_human || 'N/A'}`);
  console.log(`⚡ Commands/sec: ${cacheStats.info.instantaneous_ops_per_sec || 'N/A'}`);
  
  console.log(`\n👥 Sessions:`);
  console.log(`   Total: ${sessionStats.totalSessions}`);
  console.log(`   Active: ${sessionStats.activeSessions}`);
  console.log(`   Expired: ${sessionStats.expiredSessions}`);
  
  console.log(`\n🚦 Rate Limits:`);
  console.log(`   Total Keys: ${rateLimitStats.totalKeys}`);
  console.log(`   Active: ${rateLimitStats.activeKeys}`);
  console.log(`   Expired: ${rateLimitStats.expiredKeys}`);
}

async function clearCache(pattern?: string) {
  if (pattern) {
    console.log(`🗑️ Clearing cache with pattern: ${pattern}`);
    await cacheService.deletePattern(pattern);
    console.log('✅ Cache cleared');
  } else {
    console.log('🗑️ Clearing all cache...');
    await cacheService.clearAll();
    console.log('✅ All cache cleared');
  }
}

async function listKeys(pattern: string = '*') {
  console.log(`🔑 Listing keys with pattern: ${pattern}`);
  
  const keys = await redis.keys(pattern);
  
  if (keys.length === 0) {
    console.log('No keys found');
    return;
  }
  
  console.log(`\nFound ${keys.length} keys:\n`);
  
  for (const key of keys.slice(0, 50)) { // Limit to 50 keys
    const ttl = await redis.ttl(key);
    try {
      const size = await redis.memory('USAGE', key);
      console.log(`${key} (TTL: ${ttl}s, Size: ${size} bytes)`);
    } catch {
      console.log(`${key} (TTL: ${ttl}s, Size: N/A)`);
    }
  }
  
  if (keys.length > 50) {
    console.log(`\n... and ${keys.length - 50} more keys`);
  }
}

async function cleanup() {
  console.log('🧹 Cleaning up expired keys...');
  
  const sessionCleanup = await sessionService.cleanupExpiredSessions();
  const rateLimitCleanup = await rateLimitService.cleanup();
  
  console.log(`✅ Cleanup completed:`);
  console.log(`   Sessions: ${sessionCleanup} expired sessions removed`);
  console.log(`   Rate Limits: ${rateLimitCleanup} expired keys removed`);
}

async function monitor() {
  console.log('👀 Starting Redis monitor (press Ctrl+C to stop)...\n');
  
  const monitor = await redis.monitor();
  
  monitor.on('monitor', (time: number, args: string[]) => {
    const timestamp = new Date(time).toLocaleTimeString();
    console.log(`[${timestamp}] ${args.join(' ')}`);
  });
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping monitor...');
    monitor.disconnect();
    process.exit(0);
  });
}

// Run the script
main().catch(console.error); 