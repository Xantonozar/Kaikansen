'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWithAuth } from './client'

export function useHistory(userId: string, mode?: 'watch' | 'listen', page = 1) {
  return useQuery({
    queryKey: ['history', userId, mode, page],
    queryFn: () => fetchWithAuth(`/api/history?mode=${mode ?? ''}&page=${page}`),
    enabled: !!userId,
  })
}

export function useAddToHistory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { themeSlug: string; mode: 'watch' | 'listen' }) =>
      fetchWithAuth('/api/history', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
}