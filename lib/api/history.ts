'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from '@/lib/api/client'

export function useHistory(page = 1) {
  return useQuery({
    queryKey: queryKeys.history(),
    queryFn: () => fetchWithAuth(`/api/history?page=${page}`),
  })
}

export function useAddToHistory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (themeSlug: string) =>
      fetchWithAuth('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeSlug }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.history() })
    },
  })
}
