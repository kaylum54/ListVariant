'use client';

import { useState, useCallback } from 'react';
import { useOnboarding } from './useOnboarding';

interface Platform {
  id: string;
  name: string;
  loginUrl: string;
}

const BROWSER_PLATFORMS: Record<string, Platform> = {
  facebook: { id: 'facebook', name: 'Facebook Marketplace', loginUrl: 'https://www.facebook.com/marketplace' },
  gumtree: { id: 'gumtree', name: 'Gumtree', loginUrl: 'https://www.gumtree.com/login' },
  vinted: { id: 'vinted', name: 'Vinted', loginUrl: 'https://www.vinted.co.uk/member/login' },
  depop: { id: 'depop', name: 'Depop', loginUrl: 'https://www.depop.com/login' },
  poshmark: { id: 'poshmark', name: 'Poshmark', loginUrl: 'https://poshmark.co.uk/login' },
};

export function useCrossListing() {
  const { shouldShowReminder, dismissReminder } = useOnboarding();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingPlatform, setPendingPlatform] = useState<Platform | null>(null);
  const [pendingListingId, setPendingListingId] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(false);

  const startCrossListing = useCallback((listingId: string, platformId: string) => {
    const platform = BROWSER_PLATFORMS[platformId];
    if (!platform) {
      // API-based platform (eBay/Etsy), handle differently
      return;
    }

    if (shouldShowReminder(platformId as any)) {
      setPendingPlatform(platform);
      setPendingListingId(listingId);
      setShowReminder(true);
    } else {
      // Send directly to extension
      setIsProcessing(true);
      window.postMessage({ type: 'CROSS_LIST', listingId, platform: platformId }, '*');
      setTimeout(() => setIsProcessing(false), 2000);
    }
  }, [shouldShowReminder]);

  const confirmCrossListing = useCallback(async (dontShowAgain: boolean) => {
    if (pendingPlatform && pendingListingId) {
      if (dontShowAgain) {
        await dismissReminder(pendingPlatform.id as any, true);
      } else {
        await dismissReminder(pendingPlatform.id as any, false);
      }
      setIsProcessing(true);
      window.postMessage({ type: 'CROSS_LIST', listingId: pendingListingId, platform: pendingPlatform.id }, '*');
      setTimeout(() => setIsProcessing(false), 2000);
    }
    setShowReminder(false);
    setPendingPlatform(null);
    setPendingListingId(null);
  }, [pendingPlatform, pendingListingId, dismissReminder]);

  const cancelCrossListing = useCallback(() => {
    setShowReminder(false);
    setPendingPlatform(null);
    setPendingListingId(null);
  }, []);

  return {
    isProcessing,
    pendingPlatform,
    showReminder,
    startCrossListing,
    confirmCrossListing,
    cancelCrossListing,
  };
}
