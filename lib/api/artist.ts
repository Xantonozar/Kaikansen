'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
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

export function useArtistThemes(slug: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.themes.byArtist(slug),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/artist/${slug}/themes?page=${pageParam}`)
      const json = await res.json()
      return json.success ? json : { success: false, data: [], meta: { hasMore: false } }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.meta?.hasMore) return pages.length + 1
      return undefined
    },
    enabled: !!slug,
  })
}