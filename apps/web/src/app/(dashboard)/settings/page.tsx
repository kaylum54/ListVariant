'use client';

import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>

      <section className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Name
            </label>
            <p className="text-gray-900">{user?.name || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Email
            </label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Plan
            </label>
            <p className="text-gray-900 capitalize">
              {user?.subscriptionTier || 'Free'}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Subscription</h2>
        <p className="text-sm text-gray-600 mb-4">
          You are currently on the{' '}
          <span className="font-medium capitalize">
            {user?.subscriptionTier || 'Free'}
          </span>{' '}
          plan.
        </p>
        <button className="h-11 px-6 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
          Upgrade Plan
        </button>
      </section>
    </div>
  );
}
