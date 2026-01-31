export interface MarketplaceAdapter {
  readonly platform: string;

  /** Generate the OAuth authorization URL for this marketplace */
  getAuthUrl(): Promise<string>;

  /** Handle the OAuth callback after user authorization */
  handleCallback(code: string, state: string): Promise<void>;

  /** Publish a listing to the marketplace */
  publishListing(listing: ListingWithImages): Promise<PublishResult>;

  /** Update an existing listing on the marketplace */
  updateListing(externalId: string, listing: Partial<ListingWithImages>): Promise<PublishResult>;

  /** Delete/remove a listing from the marketplace */
  deleteListing(externalId: string): Promise<void>;

  /** Sync the current status of a listing from the marketplace */
  syncStatus(externalId: string): Promise<'active' | 'sold' | 'ended' | 'error'>;
}

export interface PublishResult {
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  platformData?: Record<string, unknown>;
  error?: string;
}

export interface ListingWithImages {
  id: string;
  title: string;
  description?: string;
  price: number;
  sku?: string;
  condition?: string;
  brand?: string;
  material?: string;
  color?: string;
  dimensionsLengthCm?: number;
  dimensionsWidthCm?: number;
  dimensionsHeightCm?: number;
  images?: Array<{ url: string; position: number }>;
  category?: string;
}
