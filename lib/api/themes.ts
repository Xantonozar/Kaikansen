'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from '@/lib/api/client'
import { Theme } from '@/types/app.types'
import { ApiResponse } from '@/types/api.types'

export function useThemes(page = 1) {
  return useQuery({
    queryKey: queryKeys.popular(),
    queryFn: () => fetchWithAuth<{ themes: Theme[] }>(`/api/themes/popular?page=${page}`),
  })
}

export function useTheme(slug: string) {
  return useQuery({
    queryKey: queryKeys.theme(slug),
    queryFn: () => fetchWithAuth<Theme>(`/api/themes/${slug}`),
    enabled: !!slug,
  })
}

export function useSeasonalThemes(season: string, year: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.seasonal(),
    queryFn: () =>
      fetchWithAuth<Theme[]>(
        `/api/themes/seasonal?season=${season}&year=${year}&page=${page}`
      ),
    enabled: !!season && !!year,
  })
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => fetchWithAuth<any>(`/api/search?q=${encodeURIComponent(query)}`),
    enabled: query.length > 0,
  })
}
