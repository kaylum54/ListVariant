import axios, { AxiosInstance, AxiosError } from 'axios';
import crypto from 'crypto';
import { prisma } from '@tom-flips/database';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';
import { ListingWithImages, PublishResult, MarketplaceAdapter } from './marketplace/types';

export class EbayService implements MarketplaceAdapter {
  readonly platform = 'ebay';
  private client: AxiosInstance;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.client = axios.create({
      baseURL: config.ebay.apiUrl,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // OAuth Flow
  async getAuthUrl(): Promise<string> {
    const state = crypto.randomBytes(32).toString('hex');

    // Store state for callback validation (CSRF protection)
    await prisma.oAuthState.create({
      data: {
        state,
        codeVerifier: '', // Not used for eBay (no PKCE), but required by schema
        userId: this.userId,
        platform: 'ebay',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    const params = new URLSearchParams({
      client_id: config.ebay.clientId,
      redirect_uri: config.ebay.redirectUri,
      response_type: 'code',
      state,
      scope: [
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.account',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      ].join(' '),
    });

    return `https://auth.ebay.com/oauth2/authorize?${params}`;
  }

  async handleCallback(code: string, state: string): Promise<void> {
    // Validate state parameter (CSRF protection)
    const oauthState = await prisma.oAuthState.findUnique({
      where: { state },
    });

    if (!oauthState || oauthState.userId !== this.userId || oauthState.platform !== 'ebay') {
      throw new ApiError(400, 'Invalid OAuth state');
    }

    if (oauthState.expiresAt < new Date()) {
      await prisma.oAuthState.delete({ where: { id: oauthState.id } });
      throw new ApiError(400, 'OAuth state expired');
    }

    const credentials = Buffer.from(
      `${config.ebay.clientId}:${config.ebay.clientSecret}`
    ).toString('base64');

    let tokenData: { access_token: string; refresh_token: string; expires_in: number };

    try {
      const response = await axios.post(
        'https://api.ebay.com/identity/v1/oauth2/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: config.ebay.redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        }
      );
      tokenData = response.data;
    } catch (error) {
      // Clean up state on token exchange failure so user can retry
      await prisma.oAuthState.delete({ where: { id: oauthState.id } }).catch(() => {});
      throw new ApiError(502, 'Failed to exchange eBay authorization code for tokens');
    }

    // Clean up used state only after successful token exchange
    await prisma.oAuthState.delete({ where: { id: oauthState.id } });

    const { access_token, refresh_token, expires_in } = tokenData;

    await prisma.marketplaceConnection.upsert({
      where: {
        userId_marketplace: { userId: this.userId, marketplace: 'ebay' },
      },
      update: {
        status: 'connected',
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
      },
      create: {
        userId: this.userId,
        marketplace: 'ebay',
        status: 'connected',
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
      },
    });
  }

  private async getAccessToken(): Promise<string> {
    const connection = await prisma.marketplaceConnection.findUnique({
      where: {
        userId_marketplace: { userId: this.userId, marketplace: 'ebay' },
      },
    });

    if (!connection?.accessToken) {
      throw new ApiError(401, 'eBay not connected');
    }

    // Check if token needs refresh (with 5-minute buffer)
    const bufferMs = 5 * 60 * 1000;
    if (
      connection.tokenExpiresAt &&
      connection.tokenExpiresAt.getTime() - Date.now() < bufferMs
    ) {
      if (!connection.refreshToken) {
        // Mark connection as disconnected if we can't refresh
        await prisma.marketplaceConnection.update({
          where: {
            userId_marketplace: { userId: this.userId, marketplace: 'ebay' },
          },
          data: { status: 'disconnected' },
        });
        throw new ApiError(401, 'eBay token expired and no refresh token available. Please reconnect.');
      }
      return this.refreshToken(connection.refreshToken);
    }

    return connection.accessToken;
  }

  private async refreshToken(refreshToken: string): Promise<string> {
    const credentials = Buffer.from(
      `${config.ebay.clientId}:${config.ebay.clientSecret}`
    ).toString('base64');

    try {
      const response = await axios.post(
        'https://api.ebay.com/identity/v1/oauth2/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      const { access_token, expires_in } = response.data;

      await prisma.marketplaceConnection.update({
        where: {
          userId_marketplace: { userId: this.userId, marketplace: 'ebay' },
        },
        data: {
          accessToken: access_token,
          tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        },
      });

      return access_token;
    } catch (error) {
      // Mark connection as disconnected on refresh failure
      await prisma.marketplaceConnection.update({
        where: {
          userId_marketplace: { userId: this.userId, marketplace: 'ebay' },
        },
        data: { status: 'disconnected' },
      }).catch(() => {});
      throw new ApiError(401, 'eBay token refresh failed. Please reconnect your eBay account.');
    }
  }

  // Inventory Management
  async createInventoryItem(listing: ListingWithImages): Promise<string> {
    const token = await this.getAccessToken();
    const sku = listing.sku || `TF-${listing.id}`;

    const inventoryItem = {
      availability: {
        shipToLocationAvailability: { quantity: 1 },
      },
      condition: this.mapCondition(listing.condition || ''),
      product: {
        title: listing.title,
        description: listing.description || listing.title,
        aspects: this.buildAspects(listing),
        imageUrls: listing.images?.map((img) => img.url) || [],
      },
    };

    await this.client.put(
      `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
      inventoryItem,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Language': 'en-GB',
        },
      }
    );

    return sku;
  }

  async createOffer(listing: ListingWithImages, sku: string): Promise<string> {
    const token = await this.getAccessToken();

    const offer = {
      sku,
      marketplaceId: 'EBAY_GB',
      format: 'FIXED_PRICE',
      availableQuantity: 1,
      categoryId: '38208',
      listingPolicies: {
        fulfillmentPolicyId: await this.getDefaultFulfillmentPolicy(),
        paymentPolicyId: await this.getDefaultPaymentPolicy(),
        returnPolicyId: await this.getDefaultReturnPolicy(),
      },
      pricingSummary: {
        price: {
          currency: 'GBP',
          value: listing.price.toString(),
        },
      },
      listingDescription: this.buildListingDescription(listing),
    };

    const response = await this.client.post(
      '/sell/inventory/v1/offer',
      offer,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.offerId;
  }

  async publishOffer(offerId: string): Promise<string> {
    const token = await this.getAccessToken();

    const response = await this.client.post(
      `/sell/inventory/v1/offer/${encodeURIComponent(offerId)}/publish`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data.listingId;
  }

  async withdrawOffer(offerId: string): Promise<void> {
    const token = await this.getAccessToken();

    await this.client.post(
      `/sell/inventory/v1/offer/${encodeURIComponent(offerId)}/withdraw`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  // Full publish flow (MarketplaceAdapter implementation)
  async publishListing(listing: ListingWithImages): Promise<PublishResult> {
    try {
      const sku = await this.createInventoryItem(listing);
      const offerId = await this.createOffer(listing, sku);
      const listingId = await this.publishOffer(offerId);

      // Update marketplace listing record
      await prisma.marketplaceListing.upsert({
        where: {
          listingId_marketplace: {
            listingId: listing.id,
            marketplace: 'ebay',
          },
        },
        update: {
          status: 'active',
          externalId: listingId,
          externalUrl: `https://www.ebay.co.uk/itm/${listingId}`,
          listedAt: new Date(),
          platformData: { sku, offerId },
        },
        create: {
          listingId: listing.id,
          marketplace: 'ebay',
          status: 'active',
          externalId: listingId,
          externalUrl: `https://www.ebay.co.uk/itm/${listingId}`,
          listedAt: new Date(),
          platformData: { sku, offerId },
        },
      });

      return {
        success: true,
        externalId: listingId,
        externalUrl: `https://www.ebay.co.uk/itm/${listingId}`,
        platformData: { sku, offerId },
      };
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : 'Failed to publish listing to eBay';
      return { success: false, error: message };
    }
  }

  async updateListing(externalId: string, listing: Partial<ListingWithImages>): Promise<PublishResult> {
    try {
      const token = await this.getAccessToken();

      // eBay updates go through inventory item update
      if (listing.title || listing.description) {
        const updateData: Record<string, unknown> = {};
        if (listing.title) updateData.title = listing.title;
        if (listing.description) updateData.description = listing.description;

        await this.client.put(
          `/sell/inventory/v1/inventory_item/${encodeURIComponent(externalId)}`,
          { product: updateData },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Language': 'en-GB',
            },
          }
        );
      }

      return { success: true, externalId };
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : 'Failed to update listing on eBay';
      return { success: false, error: message };
    }
  }

  async deleteListing(externalId: string): Promise<void> {
    const token = await this.getAccessToken();
    await this.client.delete(
      `/sell/inventory/v1/inventory_item/${encodeURIComponent(externalId)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  async syncStatus(externalId: string): Promise<'active' | 'sold' | 'ended' | 'error'> {
    try {
      const token = await this.getAccessToken();
      const response = await this.client.get(
        `/sell/inventory/v1/inventory_item/${encodeURIComponent(externalId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // eBay inventory items use availability to determine status
      const quantity = response.data?.availability?.shipToLocationAvailability?.quantity;
      if (quantity === 0) return 'sold';
      if (quantity > 0) return 'active';
      return 'error';
    } catch {
      return 'error';
    }
  }

  // Helper methods
  private mapCondition(condition: string): string {
    const map: Record<string, string> = {
      new: 'NEW',
      used_like_new: 'LIKE_NEW',
      used_good: 'VERY_GOOD',
      used_fair: 'GOOD',
    };
    return map[condition] || 'USED_EXCELLENT';
  }

  private buildAspects(listing: ListingWithImages): Record<string, string[]> {
    const aspects: Record<string, string[]> = {};

    if (listing.brand) aspects['Brand'] = [listing.brand];
    if (listing.material) aspects['Material'] = [listing.material];
    if (listing.color) aspects['Colour'] = [listing.color];

    return aspects;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private buildListingDescription(listing: ListingWithImages): string {
    let desc = `<h2>${this.escapeHtml(listing.title)}</h2>`;
    desc += `<p>${this.escapeHtml(listing.description || '')}</p>`;

    if (
      listing.dimensionsLengthCm ||
      listing.dimensionsWidthCm ||
      listing.dimensionsHeightCm
    ) {
      desc += '<h3>Dimensions</h3><ul>';
      if (listing.dimensionsLengthCm)
        desc += `<li>Length: ${this.escapeHtml(String(listing.dimensionsLengthCm))}cm</li>`;
      if (listing.dimensionsWidthCm)
        desc += `<li>Width: ${this.escapeHtml(String(listing.dimensionsWidthCm))}cm</li>`;
      if (listing.dimensionsHeightCm)
        desc += `<li>Height: ${this.escapeHtml(String(listing.dimensionsHeightCm))}cm</li>`;
      desc += '</ul>';
    }

    return desc;
  }

  private async getDefaultFulfillmentPolicy(): Promise<string> {
    return 'FULFILLMENT_POLICY_ID';
  }

  private async getDefaultPaymentPolicy(): Promise<string> {
    return 'PAYMENT_POLICY_ID';
  }

  private async getDefaultReturnPolicy(): Promise<string> {
    return 'RETURN_POLICY_ID';
  }
}
