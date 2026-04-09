'use client'

import { useNotifications, useMarkAsRead } from '@/lib/api/notifications'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { formatRelativeTime } from '@/lib/utils'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications()
  const { mutate: markAsRead, isPending } = useMarkAsRead()

  const notifications = data?.data || []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {notifications.some((n: any) => !n.isRead) && (
          <button
            onClick={() => markAsRead({ markAll: true })}
            disabled={isPending}
            className="btn btn-outline text-sm"
          >
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notif: any) => (
            <div
              key={notif._id}
              className={`card p-4 ${notif.isRead ? 'opacity-60' : 'bg-blue-50 dark:bg-blue-900/20'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 mt-1 text-blue-600" />
                  <div>
                    <p className="font-medium">
                      {notif.type === 'friend_request' && 'Friend request from '}
                      {notif.type === 'friend_accepted' && 'Friend request accepted by '}
                      {notif.type === 'followed' && 'You were followed by '}
                      {notif.fromUserId?.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeTime(notif.createdAt)}
                    </p>
                  </div>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => markAsRead({ notificationIds: [notif._id] })}
                    className="btn btn-outline text-sm"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No notifications"
          description="You're all caught up!"
        />
      )}
    </div>
  )
}
