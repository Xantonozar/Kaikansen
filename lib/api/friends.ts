'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from './client'

export function useFriends(userId: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.friends.list(userId),
    queryFn: () => fetchWithAuth(`/api/friends?page=${page}`),
    enabled: !!userId,
  })
}

export function useFriendStatus(username: string) {
  return useQuery({
    queryKey: ['friends', 'status', username],
    queryFn: () => fetchWithAuth(`/api/friends?check=${username}`),
    enabled: !!username,
  })
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (username: string) =>
      fetchWithAuth(`/api/friends?request=${username}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['friends', 'status'] })
    },
  })
}

export function useFriendRequests(userId: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.friends.requests(userId),
    queryFn: () => fetchWithAuth(`/api/friends/requests?page=${page}`),
    enabled: !!userId,
  })
}

export function useFriendActivity(userId: string) {
  return useQuery({
    queryKey: queryKeys.friends.activity(userId),
    queryFn: () => fetchWithAuth('/api/friends/activity'),
    enabled: !!userId,
  })
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'reject' }) =>
      fetchWithAuth(`/api/friends/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })
}