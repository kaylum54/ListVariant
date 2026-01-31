import { Queue, Worker, Job } from 'bullmq';
import { createLogger } from '../lib/logger';

const log = createLogger('job-queue');

export enum JobType {
  PROCESS_IMAGES = 'PROCESS_IMAGES',
  SYNC_MARKETPLACE = 'SYNC_MARKETPLACE',
  PUBLISH_LISTING = 'PUBLISH_LISTING',
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  CLEANUP_EXPIRED = 'CLEANUP_EXPIRED',
}

export enum Priority {
  CRITICAL = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
}

function parseRedisConnection(): { host: string; port: number; password?: string; username?: string } {
  const url = process.env.REDIS_URL;
  if (url) {
    try {
      const parsed = new URL(url);
      return {
        host: parsed.hostname || 'localhost',
        port: parseInt(parsed.port || '6379', 10),
        ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
        ...(parsed.username ? { username: decodeURIComponent(parsed.username) } : {}),
      };
    } catch {
      log.warn('Failed to parse REDIS_URL, using defaults');
    }
  }
  return { host: 'localhost', port: 6379 };
}

const redisConnection = parseRedisConnection();

export const jobQueue = new Queue('tom-flips', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500, age: 7 * 24 * 3600 }, // Keep failed jobs for 7 days for debugging
  },
});

const activeWorkers: Worker[] = [];

export function createWorker(
  processor: (job: Job) => Promise<void>,
  concurrency = 3
): Worker {
  const worker = new Worker('tom-flips', processor, {
    connection: redisConnection,
    concurrency,
    stalledInterval: 30000, // Check for stalled jobs every 30s
    maxStalledCount: 2, // Mark job as failed after 2 stalls
  });

  worker.on('completed', (job) => {
    log.info('Job completed', { jobId: job.id, type: job.name });
  });

  worker.on('failed', (job, err) => {
    log.error('Job failed', {
      jobId: job?.id,
      type: job?.name,
      error: err.message,
      attemptsMade: job?.attemptsMade,
      attemptsTotal: job?.opts?.attempts,
    });
  });

  worker.on('stalled', (jobId) => {
    log.warn('Job stalled', { jobId });
  });

  worker.on('error', (err) => {
    log.error('Worker error', { error: err.message });
  });

  activeWorkers.push(worker);
  return worker;
}

export async function addJob(
  type: JobType,
  data: Record<string, any>,
  priority: Priority = Priority.NORMAL
): Promise<string | null> {
  try {
    const job = await jobQueue.add(type, data, { priority });
    log.info('Job added', { type, priority, jobId: job.id });
    return job.id ?? null;
  } catch (err: any) {
    log.error('Failed to add job', { type, error: err.message });
    throw err; // Propagate — callers should know if enqueue fails
  }
}

/**
 * Gracefully close the queue and all workers. Call during shutdown.
 */
export async function closeQueue(): Promise<void> {
  const closePromises: Promise<void>[] = [];

  for (const worker of activeWorkers) {
    closePromises.push(
      worker.close().catch((err) => {
        log.warn('Error closing worker', { error: err.message });
      })
    );
  }

  closePromises.push(
    jobQueue.close().catch((err) => {
      log.warn('Error closing queue', { error: err.message });
    })
  );

  await Promise.allSettled(closePromises);
  activeWorkers.length = 0;
  log.info('Queue and workers closed');
}
