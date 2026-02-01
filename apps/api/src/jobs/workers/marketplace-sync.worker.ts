import { Job } from 'bullmq';
import { prisma } from '@syncsellr/database';
import { createLogger } from '../../lib/logger';
import { marketplaceRegistry } from '../../services/marketplace/registry';
import { createWorker, JobType } from '../queue';

const log = createLogger('marketplace-sync-worker');

async function processJob(job: Job): Promise<void> {
  switch (job.name) {
    case JobType.SYNC_MARKETPLACE:
      await syncMarketplaceListings(job);
      break;
    default:
      log.warn('Unknown job type', { type: job.name });
  }
}

const BATCH_SIZE = 50;
const CONCURRENCY = 5;

async function syncMarketplaceListings(job: Job): Promise<void> {
  const data: { userId?: string } = job.data;

  const where: any = {
    status: 'active',
    externalId: { not: null }, // Only sync listings that have been published
  };
  if (data.userId) {
    where.listing = { userId: data.userId };
  }

  let cursor: string | undefined;
  let totalSynced = 0;
  let totalErrors = 0;

  // Cursor-based pagination loop
  while (true) {
    const listings = await prisma.marketplaceListing.findMany({
      where,
      include: {
        listing: {
          select: { id: true, userId: true, status: true },
        },
      },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    });

    if (listings.length === 0) break;

    log.info('Syncing marketplace listings batch', { count: listings.length, totalSoFar: totalSynced });

    // Process in parallel with concurrency limit
    for (let i = 0; i < listings.length; i += CONCURRENCY) {
      const batch = listings.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map((ml) => syncSingleListing(ml))
      );
      totalErrors += results.filter((r) => r.status === 'rejected').length;
    }

    totalSynced += listings.length;
    cursor = listings[listings.length - 1].id;

    // Report progress if the job supports it
    const progress = listings.length < BATCH_SIZE ? 100 : undefined;
    if (progress) {
      await job.updateProgress(100);
    }

    // If we got fewer than BATCH_SIZE, we've reached the end
    if (listings.length < BATCH_SIZE) break;
  }

  log.info('Marketplace sync complete', { totalSynced, totalErrors });
}

async function syncSingleListing(ml: any): Promise<void> {
  // Handle deleted parent listing — end the marketplace listing
  if (!ml.listing || ml.listing.status === 'archived') {
    await prisma.marketplaceListing.update({
      where: { id: ml.id },
      data: { status: 'ended', endedAt: new Date() },
    });
    log.info('Marketplace listing ended — parent listing deleted or archived', {
      marketplaceListingId: ml.id,
      marketplace: ml.marketplace,
    });
    return;
  }

  const adapter = marketplaceRegistry.get(ml.marketplace);
  if (!adapter) {
    log.warn('No adapter registered for marketplace', {
      marketplace: ml.marketplace,
      marketplaceListingId: ml.id,
    });
    return;
  }

  if (!ml.externalId) return;

  // Check if the marketplace connection is still valid
  const connection = await prisma.marketplaceConnection.findFirst({
    where: {
      userId: ml.listing.userId,
      marketplace: ml.marketplace,
      status: 'connected',
    },
    select: { id: true, tokenExpiresAt: true },
  });

  if (!connection) {
    log.warn('No active marketplace connection for user', {
      userId: ml.listing.userId,
      marketplace: ml.marketplace,
    });
    return;
  }

  // Skip if token is expired — the user needs to re-auth
  if (connection.tokenExpiresAt && connection.tokenExpiresAt < new Date()) {
    log.warn('Marketplace connection token expired', {
      userId: ml.listing.userId,
      marketplace: ml.marketplace,
      expiredAt: connection.tokenExpiresAt.toISOString(),
    });
    await prisma.marketplaceConnection.update({
      where: { id: connection.id },
      data: { status: 'error' },
    });
    return;
  }

  try {
    const status = await adapter.syncStatus(ml.externalId);
    if (status !== ml.status) {
      await prisma.marketplaceListing.update({
        where: { id: ml.id },
        data: {
          status,
          ...(status === 'ended' || status === 'sold' ? { endedAt: new Date() } : {}),
        },
      });
      log.info('Listing status updated', {
        listingId: ml.listingId,
        marketplace: ml.marketplace,
        oldStatus: ml.status,
        newStatus: status,
      });
    }

    // Update last sync timestamp on the connection
    await prisma.marketplaceConnection.update({
      where: { id: connection.id },
      data: { lastSyncAt: new Date() },
    });
  } catch (err: any) {
    log.error('Failed to sync listing', {
      listingId: ml.listingId,
      marketplace: ml.marketplace,
      externalId: ml.externalId,
      error: err.message,
    });
    // Don't rethrow — we use allSettled so other listings still process
  }
}

// Export worker creation function
export function startMarketplaceSyncWorker() {
  return createWorker(processJob, 2);
}
