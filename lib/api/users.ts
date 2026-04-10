'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from './client'

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