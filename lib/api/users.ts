'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from './client'

export function useSearchUsers(query: string, page = 1) {
  return useQuery({
    queryKey: ['users', 'search', query, page],
    queryFn: () => fetchWithAuth(`/api/users/search?q=${encodeURIComponent(query)}&page=${page}`),
    enabled: query.length >= 2,
  })
}

export function useUser(username: string) {
  return useQuery({
    queryKey: queryKeys.profile.byUsername(username),
    queryFn: () => fetchWithAuth(`/api/users/${username}`),
    enabled: !!username,
  })
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.profile.byUsername('me'),
    queryFn: () => fetchWithAuth('/api/users/me'),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { displayName?: string; bio?: string; avatarUrl?: string }) =>
      fetchWithAuth('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}