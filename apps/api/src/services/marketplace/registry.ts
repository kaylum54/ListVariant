import { MarketplaceAdapter } from './types';

export class MarketplaceRegistry {
  private adapters = new Map<string, MarketplaceAdapter>();
  private factories = new Map<string, (userId: string) => MarketplaceAdapter>();
  // Simple per-user adapter cache to avoid creating new instances on every call
  private userAdapterCache = new Map<string, { adapter: MarketplaceAdapter; createdAt: number }>();
  private static USER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  register(adapter: MarketplaceAdapter): void {
    this.adapters.set(adapter.platform, adapter);
  }

  registerFactory(platform: string, factory: (userId: string) => MarketplaceAdapter): void {
    this.factories.set(platform, factory);
  }

  get(platform: string): MarketplaceAdapter | undefined {
    return this.adapters.get(platform);
  }

  getForUser(platform: string, userId: string): MarketplaceAdapter | undefined {
    const factory = this.factories.get(platform);
    if (factory) {
      const cacheKey = `${platform}:${userId}`;
      const cached = this.userAdapterCache.get(cacheKey);
      if (cached && Date.now() - cached.createdAt < MarketplaceRegistry.USER_CACHE_TTL) {
        return cached.adapter;
      }
      const adapter = factory(userId);
      this.userAdapterCache.set(cacheKey, { adapter, createdAt: Date.now() });
      return adapter;
    }
    return this.adapters.get(platform);
  }

  getAll(): MarketplaceAdapter[] {
    return Array.from(this.adapters.values());
  }

  has(platform: string): boolean {
    return this.adapters.has(platform) || this.factories.has(platform);
  }
}

export const marketplaceRegistry = new MarketplaceRegistry();

// Register adapter factories for API-based platforms
import { EtsyService } from './etsy.service';
marketplaceRegistry.registerFactory('etsy', (userId) => new EtsyService(userId));
