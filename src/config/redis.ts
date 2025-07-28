import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  // password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  // Enable key prefix for better organization
  keyPrefix: "cannbe:",
  // Connection timeout
  connectTimeout: 10000,
  // Command timeout
  commandTimeout: 5000,
};

// Create Redis instance
export const redis = new Redis(redisConfig);

// Handle Redis connection events
redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (error) => {
  console.error("❌ Redis connection error:", error);
});

redis.on("close", () => {
  console.log("🔌 Redis connection closed");
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down Redis connection...");
  await redis.quit();
  process.exit(0);
});

export default redis;
