'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from './client'

export function useFollowStatus(username: string) {
  return useQuery({
    queryKey: queryKeys.follow.status(username),
    queryFn: () => fetchWithAuth(`/api/follow/${username}`),
    enabled: !!username,
  })
}

export function useFollow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (username: string) =>
      fetchWithAuth(`/api/follow/${username}?action=follow`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow'] })
    },
  })
}

export function useUnfollow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (username: string) =>
      fetchWithAuth(`/api/follow/${username}?action=unfollow`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow'] })
    },
  })
}