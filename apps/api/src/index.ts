import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authRateLimiter, apiRateLimiter } from './middleware/security';
import { prisma } from '@syncsellr/database';
import { logger } from './lib/logger';
import { disconnectRedis } from './lib/redis';
import { closeQueue } from './jobs/queue';
import routes from './routes';

const app = express();

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow chrome-extension origins
      if (origin.startsWith('chrome-extension://')) return callback(null, true);
      // Allow configured origins
      if (config.corsOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rate limiting
app.use('/api/auth', authRateLimiter);
app.use('/api', apiRateLimiter);

// Routes
app.use('/api', routes);

// Health check
const startTime = Date.now();
app.get('/health', async (_req, res) => {
  let dbStatus = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'error';
  }

  const memUsage = process.memoryUsage();
  res.json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    database: dbStatus,
    memory: {
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
      rssMB: Math.round(memUsage.rss / 1024 / 1024),
    },
  });
});

// Error handling (must be last middleware)
app.use(errorHandler);

const server = app.listen(config.port, () => {
  logger.info(`API running on port ${config.port}`);
});

// Graceful shutdown
let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) return; // Prevent double-shutdown
  isShuttingDown = true;

  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    try {
      await Promise.allSettled([
        prisma.$disconnect().then(() => logger.info('Database disconnected')),
        disconnectRedis(),
        closeQueue(),
      ]);
    } catch (err: any) {
      logger.error('Error during shutdown', { error: err.message });
    }
    process.exit(0);
  });

  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref(); // unref so this timer doesn't keep the process alive
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled promise rejection', {
    error: reason instanceof Error ? reason : new Error(String(reason)),
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception — shutting down', { error: err });
  shutdown('uncaughtException');
});

export default app;
