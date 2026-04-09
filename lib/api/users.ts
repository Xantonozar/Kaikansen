'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from '@/lib/api/client'
import { User } from '@/types/app.types'

export function useUser(username: string) {
  return useQuery({
    queryKey: queryKeys.user(username),
    queryFn: () => fetchWithAuth<User>(`/api/users/${username}`),
    enabled: !!username,
  })
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => fetchWithAuth<User>('/api/users/me'),
  })
}
