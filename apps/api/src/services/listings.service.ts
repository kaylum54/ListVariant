import { prisma } from '@syncsellr/database';
import { CreateListingInput, UpdateListingInput } from '../schemas/listing.schema';
import { ApiError } from '../utils/ApiError';

export class ListingsService {
  async getAll(
    userId: string,
    filters?: { status?: string; page?: number; limit?: number }
  ) {
    const { status, page = 1, limit = 20 } = filters || {};

    // Guard against invalid pagination values
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const where = {
      userId,
      ...(status && status !== 'all' ? { status } : {}),
    };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { images: true, marketplaceListings: true },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      listings,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async getById(id: string, userId: string) {
    const listing = await prisma.listing.findFirst({
      where: { id, userId },
      include: { images: true, marketplaceListings: true },
    });

    if (!listing) {
      throw new ApiError(404, 'Listing not found');
    }

    return listing;
  }

  async create(
    userId: string,
    data: CreateListingInput,
    files?: Express.Multer.File[]
  ) {
    return prisma.listing.create({
      data: {
        ...data,
        userId,
        sku: data.sku || this.generateSku(),
        images:
          files && files.length > 0
            ? {
                create: files.map((file, index) => ({
                  url: `/uploads/${file.filename}`,
                  position: index,
                })),
              }
            : undefined,
      },
      include: { images: true },
    });
  }

  async update(id: string, userId: string, data: UpdateListingInput) {
    const listing = await prisma.listing.findFirst({ where: { id, userId } });
    if (!listing) throw new ApiError(404, 'Listing not found');

    return prisma.listing.update({
      where: { id },
      data,
      include: { images: true, marketplaceListings: true },
    });
  }

  async delete(id: string, userId: string) {
    const listing = await prisma.listing.findFirst({
      where: { id, userId },
      include: { marketplaceListings: true },
    });
    if (!listing) throw new ApiError(404, 'Listing not found');

    // Check for active marketplace listings before deleting
    const activeMarketplaceListings = listing.marketplaceListings.filter(
      (ml) => ml.status === 'active'
    );
    if (activeMarketplaceListings.length > 0) {
      throw new ApiError(
        409,
        'Cannot delete listing with active marketplace listings. Please remove them first.'
      );
    }

    // Use transaction to clean up related records atomically
    await prisma.$transaction([
      prisma.marketplaceListing.deleteMany({ where: { listingId: id } }),
      prisma.listingImage.deleteMany({ where: { listingId: id } }),
      prisma.listing.delete({ where: { id } }),
    ]);

    return { success: true };
  }

  private generateSku(): string {
    return `TF-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  }
}
