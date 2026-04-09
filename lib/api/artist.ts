'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchWithAuth } from '@/lib/api/client'

export function useArtist(slug: string) {
  return useQuery({
    queryKey: [`artist-${slug}`],
    queryFn: () => fetchWithAuth<any>(`/api/artist/${slug}`),
    enabled: !!slug,
  })
}

export function getArtist(slug: string) {
  return {
    queryKey: [`artist-${slug}`],
    queryFn: () => fetchWithAuth<any>(`/api/artist/${slug}`),
    enabled: !!slug,
  }
}
