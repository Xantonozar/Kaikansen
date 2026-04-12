'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from './client'

export function useArtists(page = 1, search = '') {
  const params = new URLSearchParams()
  params.set('page', page.toString())
  if (search) params.set('q', search)

  return useQuery({
    queryKey: queryKeys.artist.list(page, search),
    queryFn: () => fetchWithAuth(`/api/artists?${params.toString()}`),
  })
}

export function useArtist(slug: string) {
  return useQuery({
    queryKey: queryKeys.artist.bySlug(slug),
    queryFn: () => fetchWithAuth(`/api/artist/${slug}`),
    enabled: !!slug,
  })
}