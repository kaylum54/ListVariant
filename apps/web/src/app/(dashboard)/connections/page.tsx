'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Connection {
  id: string;
  marketplace: string;
  status: string;
}

const marketplaceConfig = [
  {
    id: 'ebay',
    name: 'eBay',
    description: 'List items on eBay UK through the official API',
    color: 'bg-blue-500',
    connectType: 'oauth' as const,
    loginUrl: '',
  },
  {
    id: 'etsy',
    name: 'Etsy',
    description: 'List handmade and vintage items via the Etsy API',
    color: 'bg-orange-500',
    connectType: 'oauth' as const,
    loginUrl: '',
  },
  {
    id: 'facebook',
    name: 'Facebook Marketplace',
    description: 'Post to Facebook Marketplace via Chrome extension',
    color: 'bg-blue-700',
    connectType: 'browser' as const,
    loginUrl: 'https://www.facebook.com/login',
  },
  {
    id: 'gumtree',
    name: 'Gumtree',
    description: 'Post to Gumtree via Chrome extension',
    color: 'bg-green-600',
    connectType: 'browser' as const,
    loginUrl: 'https://www.gumtree.com/login',
  },
  {
    id: 'vinted',
    name: 'Vinted',
    description: 'List items on Vinted via Chrome extension',
    color: 'bg-teal-500',
    connectType: 'browser' as const,
    loginUrl: 'https://www.vinted.co.uk/member/login',
  },
  {
    id: 'depop',
    name: 'Depop',
    description: 'List items on Depop via Chrome extension',
    color: 'bg-red-500',
    connectType: 'browser' as const,
    loginUrl: 'https://www.depop.com/login',
  },
  {
    id: 'poshmark',
    name: 'Poshmark',
    description: 'List items on Poshmark via Chrome extension',
    color: 'bg-pink-500',
    connectType: 'browser' as const,
    loginUrl: 'https://poshmark.co.uk/login',
  },
];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<string | null>(null);

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
    const marketplace = marketplaceConfig.find((m) => m.id === marketplaceId);
    if (!marketplace) return;

    if (marketplace.connectType === 'oauth') {
      setActionLoading(marketplaceId);
      try {
        const { data } = await api.get(`/connections/${marketplaceId}/auth-url`);
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.error('Failed to get auth URL:', err);
      } finally {
        setActionLoading(null);
      }
    } else {
      // Facebook/Gumtree: Open login page, then ask user to confirm
      window.open(marketplace.loginUrl, '_blank', 'noopener,noreferrer');
      setPendingConfirm(marketplaceId);
    }
  };

  const handleConfirmConnection = async (marketplaceId: string) => {
    setActionLoading(marketplaceId);
    try {
      await api.post(`/connections/${marketplaceId}/connect`);
      await fetchConnections();
      setPendingConfirm(null);
    } catch (err) {
      console.error('Failed to confirm connection:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (marketplaceId: string) => {
    setActionLoading(marketplaceId);
    try {
      await api.post(`/connections/${marketplaceId}/disconnect`);
      await fetchConnections();
      setPendingConfirm(null);
    } catch (err) {
      console.error('Failed to disconnect:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
        <p className="text-gray-600">
          Connect your marketplace accounts to start cross-listing
        </p>
      </div>

      <div className="grid gap-6">
        {marketplaceConfig.map((marketplace) => {
          const connected = isConnected(marketplace.id);
          const isLoading = actionLoading === marketplace.id;
          const isPendingConfirm = pendingConfirm === marketplace.id;

          return (
            <div
              key={marketplace.id}
              className="bg-white rounded-xl border p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 ${marketplace.color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {marketplace.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {marketplace.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {marketplace.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : connected ? (
                    <>
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Connected
                      </span>
                      <button
                        onClick={() => handleDisconnect(marketplace.id)}
                        disabled={isLoading}
                        className="h-9 px-4 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(marketplace.id)}
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
                          {marketplace.connectType === 'oauth'
                            ? 'Sign in'
                            : 'Log in'}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Confirm connection prompt for browser-based marketplaces */}
              {isPendingConfirm && !connected && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 mb-3">
                    A new tab has been opened for you to sign into{' '}
                    <strong>{marketplace.name}</strong>. Once you&apos;re logged
                    in, click the button below to confirm.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConfirmConnection(marketplace.id)}
                      disabled={isLoading}
                      className="h-9 px-4 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          I&apos;ve signed in
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setPendingConfirm(null)}
                      className="h-9 px-4 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          Chrome Extension Required
        </h3>
        <p className="text-sm text-blue-700">
          Facebook Marketplace, Gumtree, Vinted, Depop, and Poshmark require the
          Tom Flips Chrome extension for automated listing. Make sure you are
          signed into each marketplace in your browser before cross-listing.
          eBay and Etsy connect directly via their official APIs.
        </p>
      </div>
    </div>
  );
}
