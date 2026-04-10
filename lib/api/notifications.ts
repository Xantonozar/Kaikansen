'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from './client'

export function useNotifications(userId: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.notifications.list(userId),
    queryFn: () => fetchWithAuth(`/api/notifications?page=${page}`),
    enabled: !!userId,
    refetchInterval: 60000,
  })
}

export function useUnreadNotificationCount(userId: string) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(userId),
    queryFn: () => fetchWithAuth('/api/notifications/unread-count'),
    enabled: !!userId,
    refetchInterval: 60000,
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { notificationIds?: string[]; markAll?: boolean }) =>
      fetchWithAuth('/api/notifications/mark-read', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}