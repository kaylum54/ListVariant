'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string | null;
  subscriptionTier?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      const { data } = await api.get('/auth/me');
      setState({ user: data, isLoading: false, isAuthenticated: true });
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setState({ user: data.user, isLoading: false, isAuthenticated: true });
    // Notify the Chrome extension about the login
    window.dispatchEvent(
      new CustomEvent('syncsellr-auth', {
        detail: { action: 'login', token: data.accessToken },
      })
    );
    return data;
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      const { data } = await api.post('/auth/register', {
        email,
        password,
        name,
      });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setState({ user: data.user, isLoading: false, isAuthenticated: true });
      // Notify the Chrome extension about the registration
      window.dispatchEvent(
        new CustomEvent('syncsellr-auth', {
          detail: { action: 'login', token: data.accessToken },
        })
      );
      return data;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setState({ user: null, isLoading: false, isAuthenticated: false });
    // Notify the Chrome extension about the logout
    window.dispatchEvent(
      new CustomEvent('syncsellr-auth', {
        detail: { action: 'logout' },
      })
    );
    router.push('/login');
  }, [router]);

  return {
    ...state,
    login,
    register,
    logout,
  };
}
