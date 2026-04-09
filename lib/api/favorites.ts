'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from '@/lib/api/client'

export function useFavorites(page = 1) {
  return useQuery({
    queryKey: queryKeys.favorites(),
    queryFn: () => fetchWithAuth(`/api/favorites?page=${page}`),
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (themeSlug: string) =>
      fetchWithAuth('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeSlug }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites() })
    },
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (themeSlug: string) =>
      fetchWithAuth('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeSlug }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites() })
    },
  })
}
