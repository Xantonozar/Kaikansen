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

export function useSendFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (friendId: string) =>
      fetchWithAuth('/api/friends', {
        method: 'POST',
        body: JSON.stringify({ friendId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
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