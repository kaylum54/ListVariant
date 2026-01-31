'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ListingFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useListings(filters: ListingFilters = {}) {
  const query = useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all')
        params.set('status', filters.status);
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());

      const { data } = await api.get(`/listings?${params.toString()}`);
      return data;
    },
  });

  return {
    listings: query.data?.listings || [],
    pagination: {
      total: query.data?.total || 0,
      page: query.data?.page || 1,
      limit: query.data?.limit || 20,
      totalPages: query.data?.totalPages || 0,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data } = await api.get(`/listings/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      images,
      ...listingData
    }: {
      images?: File[];
      [key: string]: any;
    }) => {
      const formData = new FormData();

      // Append listing fields
      Object.entries(listingData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });

      // Append image files
      if (images) {
        images.forEach((file) => {
          formData.append('images', file);
        });
      }

      const { data } = await api.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: result } = await api.put(`/listings/${id}`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/listings/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
