'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from './client'

export function useThemesPopular(type?: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.themes.popular(type),
    queryFn: () => fetchWithAuth(`/api/themes/popular?type=${type ?? ''}&page=${page}`),
  })
}

export function useThemesSeasonal(season: string, year: number, type?: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.themes.seasonal(season, year, type),
    queryFn: () => fetchWithAuth(`/api/themes/seasonal?season=${season}&year=${year}&type=${type ?? ''}&page=${page}`),
    enabled: !!season && !!year,
  })
}

export function useTheme(slug: string) {
  return useQuery({
    queryKey: queryKeys.themes.bySlug(slug),
    queryFn: () => fetchWithAuth(`/api/themes/${slug}`),
    enabled: !!slug,
  })
}

export function useSearch(query: string, type?: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.search.results(query, undefined, type),
    queryFn: () => fetchWithAuth(`/api/search?q=${encodeURIComponent(query)}&type=${type ?? ''}&page=${page}`),
    enabled: query.length > 1,
  })
}

export function useAnimeThemes(anilistId: number) {
  return useQuery({
    queryKey: queryKeys.anime.byId(anilistId),
    queryFn: () => fetchWithAuth(`/api/anime/${anilistId}`),
    enabled: !!anilistId,
  })
}

export function useArtistThemes(slug: string) {
  return useQuery({
    queryKey: queryKeys.themes.byArtist(slug),
    queryFn: () => fetchWithAuth(`/api/artist/${slug}`),
    enabled: !!slug,
  })
}