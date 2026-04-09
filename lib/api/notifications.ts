'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchWithAuth } from '@/lib/api/client'
import { Notification } from '@/types/app.types'

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: () => fetchWithAuth<Notification[]>(`/api/notifications?page=${page}`),
  })
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: queryKeys.notificationCount(),
    queryFn: () => fetchWithAuth<{ count: number }>('/api/notifications/unread-count'),
    refetchInterval: 60000,
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { notificationIds?: string[]; markAll?: boolean }) =>
      fetchWithAuth('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() })
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationCount() })
    },
  })
}
