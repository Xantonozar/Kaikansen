'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from '@/lib/api/client'

export function useFriends(page = 1) {
  return useQuery({
    queryKey: queryKeys.friends(),
    queryFn: () => fetchWithAuth(`/api/friends?page=${page}`),
  })
}

export function useFriendRequests(page = 1) {
  return useQuery({
    queryKey: queryKeys.friendRequests(),
    queryFn: () => fetchWithAuth(`/api/friends/requests?page=${page}`),
  })
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (friendId: string) =>
      fetchWithAuth('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends() })
    },
  })
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'reject' }) =>
      fetchWithAuth(`/api/friends/requests?id=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friendRequests() })
      queryClient.invalidateQueries({ queryKey: queryKeys.friends() })
    },
  })
}
