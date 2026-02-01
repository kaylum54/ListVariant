'use client';

import { useState } from 'react';
import { useListings, useDeleteListing } from '@/hooks/useListings';
import { Plus, Search, Trash2, Edit, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ListingsPage() {
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const { listings, isLoading, pagination } = useListings(filters);
  const deleteListing = useDeleteListing();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      deleteListing.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
          <p className="text-gray-600">
            Manage your inventory across all platforms
          </p>
        </div>
        <Link
          href="/listings/new"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Listing
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search listings..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, status: e.target.value }))
          }
          className="h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">No listings found</p>
            <Link
              href="/listings/new"
              className="text-indigo-600 hover:underline"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Title
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Price
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Condition
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Platforms
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing: any) => (
                  <tr
                    key={listing.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {listing.title}
                      </p>
                      {listing.sku && (
                        <p className="text-xs text-gray-400">{listing.sku}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      £{Number(listing.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {listing.condition?.replace(/_/g, ' ') || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          listing.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : listing.status === 'sold'
                            ? 'bg-purple-100 text-purple-700'
                            : listing.status === 'draft'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {listing.marketplaceListings?.map((ml: any) => (
                          <span
                            key={ml.id}
                            className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-600"
                          >
                            {ml.marketplace}
                          </span>
                        ))}
                        {(!listing.marketplaceListings ||
                          listing.marketplaceListings.length === 0) && (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {listings.length} of {pagination.total} listings
            </p>
            <div className="flex gap-2">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`w-8 h-8 rounded text-sm font-medium ${
                    pagination.page === i + 1
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
