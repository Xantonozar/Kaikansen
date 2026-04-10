'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { authFetch, getAccessToken } from '@/lib/auth-client'

export function useFollow(username: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      if (!token) throw new Error('Not authenticated')
      
      const res = await fetch(`/api/follow/${username}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.follow.status(username) })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUnfollow(username: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      if (!token) throw new Error('Not authenticated')
      
      const res = await fetch(`/api/follow/${username}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.follow.status(username) })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useFollowCheck(username: string) {
  return useQuery({
    queryKey: queryKeys.follow.status(username),
    queryFn: async () => {
      const token = getAccessToken()
      if (!token) return { following: false }
      
      const res = await fetch(`/api/follow/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      return json.success ? json.data : { following: false }
    },
    enabled: !!username,
  })
}