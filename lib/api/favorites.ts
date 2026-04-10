'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from './client'

export function useFavorites(userId: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.favorites.byUser(userId),
    queryFn: () => fetchWithAuth(`/api/favorites?page=${page}`),
    enabled: !!userId,
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (themeSlug: string) =>
      fetchWithAuth('/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ themeSlug }),
      }),
    onSuccess: (_, themeSlug) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (themeSlug: string) =>
      fetchWithAuth('/api/favorites', {
        method: 'DELETE',
        body: JSON.stringify({ themeSlug }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}