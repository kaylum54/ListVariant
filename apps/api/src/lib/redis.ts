import Redis from 'ioredis';
import { createLogger } from './logger';

const log = createLogger('redis');

let redis: Redis | null = null;
let connectionFailed = false;

function createRedisClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    log.warn('REDIS_URL not set — running without Redis cache');
    return null;
  }

  try {
    const client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) {
          connectionFailed = true;
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
      enableReadyCheck: true,
    });

    client.on('error', (err) => {
      log.error('Redis connection error', { error: err.message });
    });

    client.on('connect', () => {
      connectionFailed = false;
      log.info('Redis connected');
    });

    client.on('close', () => {
      log.warn('Redis connection closed');
    });

    return client;
  } catch {
    log.warn('Failed to initialize Redis client');
    return null;
  }
}

/**
 * Returns a connected Redis client, or null if unavailable.
 * Lazily initializes on first call. If connection previously failed permanently,
 * returns null to avoid repeated connection attempts.
 */
function getRedisClient(): Redis | null {
  if (connectionFailed) return null;
  if (redis) return redis;

  redis = createRedisClient();
  if (redis) {
    // Kick off connection — don't block the caller, but track failure
    redis.connect().catch(() => {
      log.warn('Redis initial connection failed — app will work without cache');
      connectionFailed = true;
    });
  }
  return redis;
}

/**
 * Safely execute a Redis operation, returning fallback on any failure.
 */
async function withRedis<T>(op: (client: Redis) => Promise<T>, fallback: T): Promise<T> {
  const client = getRedisClient();
  if (!client) return fallback;
  try {
    return await op(client);
  } catch {
    return fallback;
  }
}

export async function cacheGet(key: string): Promise<string | null> {
  return withRedis((c) => c.get(key), null);
}

export async function cacheSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  await withRedis(async (c) => {
    if (ttlSeconds) {
      await c.setex(key, ttlSeconds, value);
    } else {
      await c.set(key, value);
    }
  }, undefined);
}

export async function cacheDel(key: string): Promise<void> {
  await withRedis((c) => c.del(key).then(() => undefined), undefined);
}

/**
 * Gracefully disconnect Redis. Call during shutdown.
 */
export async function disconnectRedis(): Promise<void> {
  if (redis) {
    try {
      await redis.quit();
      log.info('Redis disconnected');
    } catch {
      log.warn('Redis disconnect failed — forcing');
      redis.disconnect();
    }
    redis = null;
  }
}

export { getRedisClient };
