import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { prisma } from '@syncsellr/database';
import { config } from '../../config';
import { ApiError } from '../../utils/ApiError';
import { etsyCircuitBreaker } from '../../lib/circuitBreaker';
import { createLogger } from '../../lib/logger';
import { MarketplaceAdapter, ListingWithImages, PublishResult } from './types';

const log = createLogger('etsy-service');

const ETSY_BASE_URL = 'https://openapi.etsy.com/v3';
const ETSY_TOKEN_URL = 'https://api.etsy.com/v3/public/oauth/token';
const ETSY_AUTH_URL = 'https://www.etsy.com/oauth/connect';

// Etsy taxonomy IDs for furniture categories
const CATEGORY_MAP: Record<string, number> = {
  furniture: 891,
  vintage: 66,
  handmade: 69,
};

export class EtsyService implements MarketplaceAdapter {
  readonly platform = 'etsy';
  private client: AxiosInstance;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.client = axios.create({
      baseURL: ETSY_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // --- OAuth 2.0 with PKCE ---

  async getAuthUrl(): Promise<string> {
    const state = crypto.randomBytes(32).toString('hex');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    // Store state + verifier for callback validation
    await prisma.oAuthState.create({
      data: {
        state,
        codeVerifier,
        userId: this.userId,
        platform: 'etsy',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.etsy.clientId,
      redirect_uri: config.etsy.redirectUri,
      scope: 'listings_r listings_w transactions_r',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${ETSY_AUTH_URL}?${params}`;
  }

  async handleCallback(code: string, state: string): Promise<void> {
    // Validate state and retrieve code_verifier
    const oauthState = await prisma.oAuthState.findUnique({
      where: { state },
    });

    if (!oauthState || oauthState.userId !== this.userId || oauthState.platform !== 'etsy') {
      throw new ApiError(400, 'Invalid OAuth state');
    }

    if (oauthState.expiresAt < new Date()) {
      await prisma.oAuthState.delete({ where: { id: oauthState.id } });
      throw new ApiError(400, 'OAuth state expired');
    }

    // Exchange code for tokens
    let tokenData: { access_token: string; refresh_token: string; expires_in: number };

    try {
      const response = await axios.post(
        ETSY_TOKEN_URL,
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: config.etsy.clientId,
          redirect_uri: config.etsy.redirectUri,
          code,
          code_verifier: oauthState.codeVerifier,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      tokenData = response.data;
    } catch (error) {
      // Clean up state on token exchange failure so user can retry
      await prisma.oAuthState.delete({ where: { id: oauthState.id } }).catch(() => {});
      throw new ApiError(502, 'Failed to exchange Etsy authorization code for tokens');
    }

    // Clean up used state only after successful token exchange
    await prisma.oAuthState.delete({ where: { id: oauthState.id } });

    const { access_token, refresh_token, expires_in } = tokenData;

    await prisma.marketplaceConnection.upsert({
      where: {
        userId_marketplace: { userId: this.userId, marketplace: 'etsy' },
      },
      update: {
        status: 'connected',
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
      },
      create: {
        userId: this.userId,
        marketplace: 'etsy',
        status: 'connected',
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
      },
    });

    log.info('Etsy OAuth completed', { userId: this.userId });
  }

  // --- Token Management ---

  private async getAccessToken(): Promise<string> {
    const connection = await prisma.marketplaceConnection.findUnique({
      where: {
        userId_marketplace: { userId: this.userId, marketplace: 'etsy' },
      },
    });

    if (!connection?.accessToken) {
      throw new ApiError(401, 'Etsy not connected');
    }

    // Refresh 5 minutes before expiry
    const bufferMs = 5 * 60 * 1000;
    if (
      connection.tokenExpiresAt &&
      connection.tokenExpiresAt.getTime() - Date.now() < bufferMs
    ) {
      if (!connection.refreshToken) {
        await prisma.marketplaceConnection.update({
          where: {
            userId_marketplace: { userId: this.userId, marketplace: 'etsy' },
          },
          data: { status: 'disconnected' },
        });
        throw new ApiError(401, 'Etsy token expired and no refresh token available. Please reconnect.');
      }
      return this.refreshToken(connection.refreshToken);
    }

    return connection.accessToken;
  }

  private async refreshToken(refreshToken: string): Promise<string> {
    try {
      const response = await axios.post(
        ETSY_TOKEN_URL,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: config.etsy.clientId,
          refresh_token: refreshToken,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const { access_token, refresh_token: new_refresh, expires_in } = response.data;

      await prisma.marketplaceConnection.update({
        where: {
          userId_marketplace: { userId: this.userId, marketplace: 'etsy' },
        },
        data: {
          accessToken: access_token,
          refreshToken: new_refresh || refreshToken,
          tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        },
      });

      return access_token;
    } catch (error) {
      // Mark connection as disconnected on refresh failure
      await prisma.marketplaceConnection.update({
        where: {
          userId_marketplace: { userId: this.userId, marketplace: 'etsy' },
        },
        data: { status: 'disconnected' },
      }).catch(() => {});
      log.error('Etsy token refresh failed', { userId: this.userId });
      throw new ApiError(401, 'Etsy token refresh failed. Please reconnect your Etsy account.');
    }
  }

  // --- MarketplaceAdapter Implementation ---

  async publishListing(listing: ListingWithImages): Promise<PublishResult> {
    return etsyCircuitBreaker.execute(async () => {
      try {
        const token = await this.getAccessToken();
        const shopId = await this.getShopId(token);

        // Create the listing
        const taxonomyId = CATEGORY_MAP[listing.category || ''] || CATEGORY_MAP.furniture;
        const createResponse = await this.client.post(
          `/application/shops/${shopId}/listings`,
          {
            title: listing.title.substring(0, 140),
            description: listing.description || listing.title,
            price: listing.price,
            quantity: 1,
            taxonomy_id: taxonomyId,
            who_made: 'someone_else',
            when_made: 'before_2000',
            is_supply: false,
            shipping_profile_id: await this.getShippingProfileId(token, shopId),
            tags: this.generateTags(listing),
          },
          { headers: { Authorization: `Bearer ${token}`, 'x-api-key': config.etsy.clientId } }
        );

        const etsyListingId = createResponse.data.listing_id;

        // Upload images
        if (listing.images?.length) {
          for (const image of listing.images.slice(0, 10)) {
            await this.uploadImage(token, shopId, etsyListingId, image.url);
          }
        }

        const externalUrl = `https://www.etsy.com/listing/${etsyListingId}`;

        // Store in DB
        await prisma.marketplaceListing.upsert({
          where: {
            listingId_marketplace: { listingId: listing.id, marketplace: 'etsy' },
          },
          update: {
            status: 'active',
            externalId: String(etsyListingId),
            externalUrl,
            listedAt: new Date(),
            platformData: { shopId },
          },
          create: {
            listingId: listing.id,
            marketplace: 'etsy',
            status: 'active',
            externalId: String(etsyListingId),
            externalUrl,
            listedAt: new Date(),
            platformData: { shopId },
          },
        });

        log.info('Listing published to Etsy', { listingId: listing.id, etsyListingId });
        return { success: true, externalId: String(etsyListingId), externalUrl };
      } catch (error: any) {
        log.error('Failed to publish to Etsy', { listingId: listing.id, error: error.message });
        return { success: false, error: error.message };
      }
    });
  }

  async updateListing(externalId: string, listing: Partial<ListingWithImages>): Promise<PublishResult> {
    return etsyCircuitBreaker.execute(async () => {
      try {
        const token = await this.getAccessToken();
        const updateData: Record<string, any> = {};

        if (listing.title) updateData.title = listing.title.substring(0, 140);
        if (listing.description) updateData.description = listing.description;
        if (listing.price) updateData.price = listing.price;
        if (listing.category) updateData.taxonomy_id = CATEGORY_MAP[listing.category] || CATEGORY_MAP.furniture;

        await this.client.patch(
          `/application/listings/${externalId}`,
          updateData,
          { headers: { Authorization: `Bearer ${token}`, 'x-api-key': config.etsy.clientId } }
        );

        log.info('Listing updated on Etsy', { externalId });
        return { success: true, externalId };
      } catch (error: any) {
        log.error('Failed to update on Etsy', { externalId, error: error.message });
        return { success: false, error: error.message };
      }
    });
  }

  async deleteListing(externalId: string): Promise<void> {
    return etsyCircuitBreaker.execute(async () => {
      try {
        const token = await this.getAccessToken();
        await this.client.delete(
          `/application/listings/${encodeURIComponent(externalId)}`,
          { headers: { Authorization: `Bearer ${token}`, 'x-api-key': config.etsy.clientId } }
        );
        log.info('Listing deleted from Etsy', { externalId });
      } catch (error) {
        log.error('Failed to delete listing from Etsy', { externalId, error: error instanceof Error ? error.message : 'Unknown error' });
        throw error instanceof ApiError ? error : new ApiError(502, 'Failed to delete listing from Etsy');
      }
    });
  }

  async syncStatus(externalId: string): Promise<'active' | 'sold' | 'ended' | 'error'> {
    return etsyCircuitBreaker.execute(async () => {
      try {
        const token = await this.getAccessToken();
        const response = await this.client.get(
          `/application/listings/${encodeURIComponent(externalId)}`,
          { headers: { Authorization: `Bearer ${token}`, 'x-api-key': config.etsy.clientId } }
        );

        const stateMap: Record<string, 'active' | 'sold' | 'ended' | 'error'> = {
          active: 'active',
          sold_out: 'sold',
          inactive: 'ended',
          expired: 'ended',
          removed: 'ended',
        };

        return stateMap[response.data.state] || 'error';
      } catch (error) {
        log.error('Failed to sync status from Etsy', { externalId, error: error instanceof Error ? error.message : 'Unknown error' });
        return 'error';
      }
    });
  }

  // --- Helper Methods ---

  private async getShopId(token: string): Promise<number> {
    const response = await this.client.get('/application/users/me', {
      headers: { Authorization: `Bearer ${token}`, 'x-api-key': config.etsy.clientId },
    });
    return response.data.shop_id;
  }

  private async getShippingProfileId(token: string, shopId: number): Promise<number> {
    const response = await this.client.get(
      `/application/shops/${shopId}/shipping-profiles`,
      { headers: { Authorization: `Bearer ${token}`, 'x-api-key': config.etsy.clientId } }
    );

    if (response.data.results?.length > 0) {
      return response.data.results[0].shipping_profile_id;
    }

    throw new ApiError(400, 'No shipping profile found on Etsy. Please create one in your Etsy shop settings.');
  }

  private async uploadImage(token: string, shopId: number, listingId: number, imageUrl: string): Promise<void> {
    try {
      // Download the image
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(imageResponse.data);

      // Etsy expects multipart/form-data for image uploads
      const FormData = (await import('form-data')).default;
      const form = new FormData();
      form.append('image', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

      await this.client.post(
        `/application/shops/${shopId}/listings/${listingId}/images`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${token}`,
            'x-api-key': config.etsy.clientId,
          },
        }
      );
    } catch (error: any) {
      log.warn('Failed to upload image to Etsy', { listingId, imageUrl, error: error.message });
    }
  }

  private generateTags(listing: ListingWithImages): string[] {
    const tags: string[] = [];
    if (listing.title) {
      tags.push(...listing.title.split(/\s+/).filter(w => w.length > 2).slice(0, 5));
    }
    if (listing.brand) tags.push(listing.brand);
    if (listing.material) tags.push(listing.material);
    if (listing.color) tags.push(listing.color);
    tags.push('furniture');
    return tags.slice(0, 13); // Etsy allows max 13 tags
  }
}
