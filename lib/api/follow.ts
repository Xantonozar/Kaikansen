'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from '@/lib/api/client'

export function useFollow(username: string) {
  return useMutation({
    mutationFn: () =>
      fetchWithAuth(`/api/follow/${username}?action=follow`, {
        method: 'POST',
      }),
  })
}

export function useUnfollow(username: string) {
  return useMutation({
    mutationFn: () =>
      fetchWithAuth(`/api/follow/${username}?action=unfollow`, {
        method: 'POST',
      }),
  })
}
