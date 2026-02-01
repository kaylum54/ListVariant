'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Loader2, CheckCircle2, Puzzle, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { useOnboarding } from '@/hooks/useOnboarding';

interface Connection {
  id: string;
  marketplace: string;
  status: string;
}

const API_PLATFORMS = [
  {
    id: 'ebay',
    name: 'eBay',
    description: 'List items on eBay UK through the official API. Faster and more reliable than browser automation.',
    color: 'bg-blue-500',
    letter: 'E',
  },
  {
    id: 'etsy',
    name: 'Etsy',
    description: 'List handmade and vintage items via the Etsy API. Supports all listing fields.',
    color: 'bg-orange-500',
    letter: 'E',
  },
];

const BROWSER_PLATFORMS = [
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-700', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
  { id: 'gumtree', name: 'Gumtree', color: 'bg-green-600', textColor: 'text-green-700', bgLight: 'bg-green-50' },
  { id: 'vinted', name: 'Vinted', color: 'bg-teal-500', textColor: 'text-teal-700', bgLight: 'bg-teal-50' },
  { id: 'depop', name: 'Depop', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
  { id: 'poshmark', name: 'Poshmark', color: 'bg-pink-500', textColor: 'text-pink-700', bgLight: 'bg-pink-50' },
];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { setShowOnboarding } = useOnboarding();

  const fetchConnections = useCallback(async () => {
    try {
      const { data } = await api.get('/connections');
      setConnections(data);
    } catch {
      // Silently fail - user may not have any connections yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Check for OAuth callbacks (eBay, Etsy)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ebay_connected') === 'true' || params.get('etsy_connected') === 'true') {
      window.history.replaceState({}, '', '/connections');
      fetchConnections();
    }
  }, [fetchConnections]);

  const isConnected = (marketplaceId: string) => {
    return connections.some(
      (c) => c.marketplace === marketplaceId && c.status === 'connected'
    );
  };

  const handleConnect = async (marketplaceId: string) => {
    setActionLoading(marketplaceId);
    try {
      const { data } = await api.get(`/connections/${marketplaceId}/auth-url`);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to get auth URL:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (marketplaceId: string) => {
    setActionLoading(marketplaceId);
    try {
      await api.post(`/connections/${marketplaceId}/disconnect`);
      await fetchConnections();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
        <p className="text-gray-600">
          Connect your marketplace accounts to start cross-listing
        </p>
      </div>

      {/* Section 1: API Integrations */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">API Integrations</h2>
          <p className="text-sm text-gray-500">
            These marketplaces use official APIs for faster, more reliable listings.
          </p>
        </div>

        <div className="grid gap-4">
          {API_PLATFORMS.map((platform) => {
            const connected = isConnected(platform.id);
            const isLoading = actionLoading === platform.id;

            return (
              <div
                key={platform.id}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}
                    >
                      {platform.letter}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {platform.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {platform.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    ) : connected ? (
                      <>
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          Connected
                        </span>
                        <button
                          onClick={() => handleDisconnect(platform.id)}
                          disabled={isLoading}
                          className="h-9 px-4 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Disconnecting...' : 'Disconnect'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(platform.id)}
                        disabled={isLoading}
                        className="h-9 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            Connect
                            <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Browser-Based Marketplaces */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Browser-Based Marketplaces</h2>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Puzzle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                No connection needed
              </h3>
              <p className="text-sm text-blue-700 leading-relaxed mb-4">
                These platforms are handled by the Tom Flips browser extension. Just
                make sure you&apos;re logged into each marketplace in your browser.
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {BROWSER_PLATFORMS.map((platform) => (
                  <span
                    key={platform.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${platform.bgLight} ${platform.textColor}`}
                  >
                    <span className={`w-2 h-2 ${platform.color} rounded-full`} />
                    {platform.name}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setShowOnboarding(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                View setup guide
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
