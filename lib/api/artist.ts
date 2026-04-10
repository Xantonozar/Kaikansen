'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from './client'

export function useArtist(slug: string) {
  return useQuery({
    queryKey: queryKeys.artist.bySlug(slug),
    queryFn: () => fetchWithAuth(`/api/artist/${slug}`),
    enabled: !!slug,
  })
}