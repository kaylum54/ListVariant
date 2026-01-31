'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createListingSchema, CreateListingInput } from '@/schemas/listing';
import { useCreateListing } from '@/hooks/useListings';

export default function NewListingPage() {
  const router = useRouter();
  const { mutate: createListing, isPending } = useCreateListing();
  const [images, setImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema),
  });

  const [isDragging, setIsDragging] = useState(false);

  const onSubmit = async (data: CreateListingInput) => {
    createListing(
      { ...data, images },
      {
        onSuccess: () => router.push('/listings'),
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Create New Listing
        </h1>
        <p className="text-gray-600">
          Add a new item to your inventory
        </p>
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

        {/* Photos */}
        <section className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Photos</h2>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const files = Array.from(e.dataTransfer.files).filter((f) =>
                f.type.startsWith('image/')
              );
              setImages((prev) => [...prev, ...files]);
            }}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              id="image-upload"
              onChange={(e) => {
                const fileList = e.target.files;
                if (fileList && fileList.length > 0) {
                  const newFiles = Array.from(fileList);
                  setImages((prev) => [...prev, ...newFiles]);
                }
                e.target.value = '';
              }}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-base font-medium">
                  Drop images here or click to browse
                </p>
                <p className="text-sm mt-1">
                  JPEG, PNG, WebP, GIF up to 10MB each
                </p>
              </div>
            </label>
          </div>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="relative group aspect-square rounded-lg overflow-hidden border"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...images];
                          [newImages[index - 1], newImages[index]] = [
                            newImages[index],
                            newImages[index - 1],
                          ];
                          setImages(newImages);
                        }}
                        className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-xs shadow hover:bg-white"
                        title="Move left"
                      >
                        &larr;
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setImages(images.filter((_, i) => i !== index))
                      }
                      className="w-7 h-7 bg-red-500/90 text-white rounded-full flex items-center justify-center text-xs shadow hover:bg-red-600"
                      title="Remove"
                    >
                      &times;
                    </button>
                  </div>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
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
            {isPending ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
