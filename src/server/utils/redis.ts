import Redis from 'ioredis';
import { env } from '@/env';

/**
 * Create a Redis client instance
 */
export const redis = new Redis(env.REDIS_URL, {
  // Optional: Redis connection options
  lazyConnect: true,
  // Enable auto-resuming of connections
  enableReadyCheck: false,
  // Reconnect after
  maxRetriesPerRequest: 3,
});

/**
 * Connect to Redis
 */
export async function connectRedis() {
  if (redis.status !== 'ready' && redis.status !== 'connecting') {
    await redis.connect();
  }
}

/**
 * Disconnect from Redis
 */
export async function disconnectRedis() {
  if (redis.status === 'ready' || redis.status === 'connecting') {
    await redis.quit();
  }
}

// Handle connection events
redis.on('connect', () => {
  console.log('🔴 Redis connected');
});

redis.on('ready', () => {
  console.log('🔴 Redis ready');
});

redis.on('error', (err) => {
  console.error('🔴 Redis error:', err);
});

redis.on('close', () => {
  console.log('🔴 Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔴 Redis reconnecting');
});

export default redis;
