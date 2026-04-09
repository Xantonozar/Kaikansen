'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from '@/lib/api/client'
import { Rating } from '@/types/app.types'
import { ApiResponse } from '@/types/api.types'

export function useRating(themeSlug: string) {
  return useQuery({
    queryKey: queryKeys.myRating(themeSlug),
    queryFn: () => fetchWithAuth<Rating>(`/api/ratings/${themeSlug}/mine`),
    enabled: !!themeSlug,
  })
}

export function useRatings(page = 1) {
  return useQuery({
    queryKey: queryKeys.ratings(),
    queryFn: () => fetchWithAuth<Rating[]>(`/api/ratings?page=${page}`),
  })
}

export function useSetRating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { themeSlug: string; rating: number }) =>
      fetchWithAuth('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ratings() })
    },
  })
}
