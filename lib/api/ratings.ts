'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from './client'

export function useMyRating(themeSlug: string) {
  return useQuery({
    queryKey: queryKeys.ratings.mine(themeSlug),
    queryFn: () => fetchWithAuth(`/api/ratings/${themeSlug}/mine`),
    enabled: !!themeSlug,
  })
}

export function useSetRating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { themeSlug: string; score: number; mode: 'watch' | 'listen' }) =>
      fetchWithAuth('/api/ratings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] })
    },
  })
}