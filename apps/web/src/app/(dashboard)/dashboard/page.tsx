'use client';

import { useListings } from '@/hooks/useListings';
import { Package, TrendingUp, ShoppingBag, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { listings, pagination, isLoading } = useListings({ limit: 5 });

  const stats = {
    totalListings: pagination.total,
    activeListings: listings.filter((l: any) => l.status === 'active').length,
    draftListings: listings.filter((l: any) => l.status === 'draft').length,
    soldListings: listings.filter((l: any) => l.status === 'sold').length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here&apos;s your selling overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Listings"
          value={stats.totalListings}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Active"
          value={stats.activeListings}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Drafts"
          value={stats.draftListings}
          icon={<AlertCircle className="w-5 h-5" />}
          color="yellow"
        />
        <StatCard
          title="Sold"
          value={stats.soldListings}
          icon={<ShoppingBag className="w-5 h-5" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Listings */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Listings</h2>
            <Link
              href="/listings"
              className="text-sm text-indigo-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No listings yet</p>
              <Link
                href="/listings/new"
                className="text-indigo-600 hover:underline text-sm mt-1 inline-block"
              >
                Create your first listing
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.slice(0, 5).map((listing: any) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {listing.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {listing.condition?.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {'\u00A3'}{Number(listing.price).toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        listing.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : listing.status === 'sold'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {listing.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Marketplace Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/listings/new"
                className="block w-full p-3 text-left rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <p className="font-medium text-gray-900">New Listing</p>
                <p className="text-sm text-gray-500">
                  Create and cross-list a new item
                </p>
              </Link>
              <Link
                href="/connections"
                className="block w-full p-3 text-left rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <p className="font-medium text-gray-900">
                  Connect Marketplace
                </p>
                <p className="text-sm text-gray-500">
                  Link eBay, Facebook, or Gumtree
                </p>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Marketplace Status</h2>
            <div className="space-y-3">
              {['eBay', 'Facebook', 'Gumtree'].map((marketplace) => (
                <div
                  key={marketplace}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-700">{marketplace}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                    Not connected
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
        >
          {icon}
        </div>
        <span className="text-sm text-gray-500">{title}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
