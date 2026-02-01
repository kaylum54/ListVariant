'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

type BrowserPlatformId = 'facebook' | 'gumtree' | 'vinted' | 'depop' | 'poshmark';

interface OnboardingState {
  isComplete: boolean;
  completedAt: string | null;
  crossListReminders: Record<string, boolean>;
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [state, setState] = useState<OnboardingState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const { data } = await api.get('/users/onboarding');
        setState(data);
        if (!data.isComplete) {
          setShowOnboarding(true);
        }
      } catch {
        // Fall back to localStorage
        const completed = localStorage.getItem('onboardingComplete');
        if (!completed) {
          setShowOnboarding(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchState();
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await api.post('/users/onboarding/complete');
      setState((prev) => prev ? { ...prev, isComplete: true, completedAt: new Date().toISOString() } : null);
    } catch {
      // Fallback
    }
    localStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);
  }, []);

  const shouldShowReminder = useCallback((platform: BrowserPlatformId): boolean => {
    // Check API state
    if (state?.crossListReminders?.[platform] === false) return false;
    // Check localStorage session dismissal
    const sessionKey = `reminder_dismissed_${platform}`;
    if (sessionStorage.getItem(sessionKey)) return false;
    return true;
  }, [state]);

  const dismissReminder = useCallback(async (platform: BrowserPlatformId, permanently: boolean) => {
    if (permanently) {
      try {
        await api.patch('/users/preferences', {
          crossListReminders: { [platform]: false },
        });
        setState((prev) => prev ? {
          ...prev,
          crossListReminders: { ...prev.crossListReminders, [platform]: false },
        } : null);
      } catch {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem('crossListReminders') || '{}');
        stored[platform] = false;
        localStorage.setItem('crossListReminders', JSON.stringify(stored));
      }
    } else {
      sessionStorage.setItem(`reminder_dismissed_${platform}`, 'true');
    }
  }, []);

  return {
    showOnboarding,
    setShowOnboarding,
    completeOnboarding,
    shouldShowReminder,
    dismissReminder,
    isLoading,
  };
}
