export interface User {
  id: string;
  email: string;
  name: string | null;
  subscriptionTier: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  price: number;
  condition: string | null;
  brand: string | null;
  material: string | null;
  color: string | null;
  dimensionsLengthCm: number | null;
  dimensionsWidthCm: number | null;
  dimensionsHeightCm: number | null;
  sku: string | null;
  costPrice: number | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  images: ListingImage[];
  marketplaceListings: MarketplaceListing[];
}

export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  position: number;
}

export interface MarketplaceListing {
  id: string;
  listingId: string;
  marketplace: string;
  externalId: string | null;
  externalUrl: string | null;
  status: string;
  errorMessage: string | null;
  listedAt: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
