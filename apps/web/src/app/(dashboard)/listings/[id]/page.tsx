'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createListingSchema, CreateListingInput } from '@/schemas/listing';
import { useListing, useUpdateListing } from '@/hooks/useListings';
import { ExternalLink, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Connection {
  marketplace: string;
  status: string;
}

interface MarketplaceListing {
  marketplace: string;
  status: string;
  externalUrl?: string;
}

const crossListPlatforms = [
  { id: 'ebay', name: 'eBay', color: 'bg-blue-500', type: 'api' },
  { id: 'etsy', name: 'Etsy', color: 'bg-orange-500', type: 'api' },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-700', type: 'browser' },
  { id: 'gumtree', name: 'Gumtree', color: 'bg-green-600', type: 'browser' },
  { id: 'vinted', name: 'Vinted', color: 'bg-teal-500', type: 'browser' },
  { id: 'depop', name: 'Depop', color: 'bg-red-500', type: 'browser' },
  { id: 'poshmark', name: 'Poshmark', color: 'bg-pink-500', type: 'browser' },
];

export default function EditListingPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: listing, isLoading: isLoadingListing } = useListing(id);
  const { mutate: updateListing, isPending } = useUpdateListing();
  const [existingImages, setExistingImages] = useState<
    { id: string; url: string; position: number }[]
  >([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [crossListLoading, setCrossListLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema),
  });

  // Pre-populate form when listing loads
  useEffect(() => {
    if (listing) {
      reset({
        title: listing.title,
        description: listing.description || '',
        price: parseFloat(listing.price),
        condition: listing.condition || '',
        brand: listing.brand || '',
        material: listing.material || '',
        color: listing.color || '',
        dimensionsLengthCm: listing.dimensionsLengthCm || undefined,
        dimensionsWidthCm: listing.dimensionsWidthCm || undefined,
        dimensionsHeightCm: listing.dimensionsHeightCm || undefined,
        sku: listing.sku || '',
        costPrice: listing.costPrice ? parseFloat(listing.costPrice) : undefined,
        notes: listing.notes || '',
      });
      if (listing.images) {
        setExistingImages(listing.images);
      }
    }
  }, [listing, reset]);

  // Fetch connections for cross-list section
  useEffect(() => {
    api.get('/connections').then(({ data }) => setConnections(data)).catch(() => {});
  }, []);

  const isConnected = useCallback(
    (platformId: string) => connections.some((c) => c.marketplace === platformId && c.status === 'connected'),
    [connections]
  );

  const getMarketplaceListing = useCallback(
    (platformId: string): MarketplaceListing | undefined =>
      listing?.marketplaceListings?.find((ml: MarketplaceListing) => ml.marketplace === platformId),
    [listing]
  );

  const onSubmit = async (data: CreateListingInput) => {
    updateListing(
      { id, ...data },
      {
        onSuccess: () => router.push('/listings'),
      }
    );
  };

  if (isLoadingListing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Listing not found</h1>
        <p className="text-gray-600 mt-2">
          This listing doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <button
          onClick={() => router.push('/listings')}
          className="mt-4 h-11 px-6 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-gray-600">Update your listing details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title
              </label>
              <input
                {...register('title')}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Grey Corner Sofa - DFS - Excellent Condition"
              />
              {errors.title && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Price (£)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.price && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Condition
              </label>
              <select
                {...register('condition')}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select condition</option>
                <option value="new">New</option>
                <option value="used_like_new">Used - Like New</option>
                <option value="used_good">Used - Good</option>
                <option value="used_fair">Used - Fair</option>
              </select>
              {errors.condition && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.condition.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Brand
              </label>
              <input
                {...register('brand')}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. DFS, IKEA, Next"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Material
              </label>
              <input
                {...register('material')}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Fabric, Leather, Velvet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Color
              </label>
              <input
                {...register('color')}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Grey, Navy Blue"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder="Describe your item in detail..."
            />
          </div>
        </section>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <section className="bg-white p-6 rounded-xl border">
            <h2 className="text-lg font-semibold mb-4">Current Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden border"
                >
                  <img
                    src={`${API_URL}${image.url}`}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cross-List */}
        <section className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Cross-List to Marketplaces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {crossListPlatforms.map((platform) => {
              const connected = isConnected(platform.id);
              const ml = getMarketplaceListing(platform.id);
              const isLoading = crossListLoading === platform.id;

              return (
                <div
                  key={platform.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    connected ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center text-white font-bold text-xs`}
                    >
                      {platform.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {platform.name}
                    </span>
                  </div>

                  {ml && ml.status === 'active' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Active
                      </span>
                      {ml.externalUrl && (
                        <a
                          href={ml.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ) : ml && ml.status === 'pending' ? (
                    <span className="text-xs text-amber-600 font-medium">Pending</span>
                  ) : ml && ml.status === 'error' ? (
                    <span className="text-xs text-red-600 font-medium">Error</span>
                  ) : connected ? (
                    <button
                      type="button"
                      disabled={isLoading}
                      className="text-xs h-7 px-3 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        `List on ${platform.name}`
                      )}
                    </button>
                  ) : (
                    <a
                      href="/connections"
                      className="text-xs text-gray-400 hover:text-blue-600 hover:underline"
                    >
                      Connect first
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Dimensions */}
        <section className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Dimensions (cm)</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Length
              </label>
              <input
                type="number"
                {...register('dimensionsLengthCm', { valueAsNumber: true })}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Width
              </label>
              <input
                type="number"
                {...register('dimensionsWidthCm', { valueAsNumber: true })}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Height
              </label>
              <input
                type="number"
                {...register('dimensionsHeightCm', { valueAsNumber: true })}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Internal */}
        <section className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Internal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                SKU
              </label>
              <input
                {...register('sku')}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Auto-generated if empty"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cost Price (£)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('costPrice', { valueAsNumber: true })}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                placeholder="Internal notes..."
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-11 px-6 rounded-lg font-medium border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="h-11 px-6 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
