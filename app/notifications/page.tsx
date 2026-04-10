'use client'

import { useNotifications, useMarkAsRead } from '@/lib/api/notifications'
import { useAuth } from '@/providers/AuthProvider'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { timeAgo } from '@/lib/utils'
import { Bell, UserPlus, Star, Heart, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function NotificationsPage() {
  const { user, isLoading: isAuthLoading } = useAuth()

  const { data, isLoading } = useNotifications(user?.id ?? '', 1)
  const { mutate: markAsRead, isPending } = useMarkAsRead()

  const notifications = (data?.data ?? []) as any[]

  if (isAuthLoading) {
    return (
      <>
        <AppHeader />
        <main className="p-4"><LoadingSkeleton /></main>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <AppHeader />
        <main className="p-4">
          <EmptyState title="Login required" description="Please login to view notifications" />
        </main>
      </>
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return <UserPlus className="w-2.5 h-2.5 text-white" />
      case 'friend_accepted': return <UserCheck className="w-2.5 h-2.5 text-white" />
      case 'friend_rated': return <Star className="w-2.5 h-2.5 text-white" />
      case 'friend_favorited': return <Heart className="w-2.5 h-2.5 text-white" />
      case 'follow': return <UserPlus className="w-2.5 h-2.5 text-white" />
      default: return <Bell className="w-2.5 h-2.5 text-white" />
    }
  }

  const getNotificationText = (notif: any) => {
    switch (notif.type) {
      case 'friend_request': return <><span className="font-semibold">{notif.actorId?.displayName}</span> sent you a friend request</>
      case 'friend_accepted': return <><span className="font-semibold">{notif.actorId?.displayName}</span> accepted your friend request</>
      case 'friend_rated': return <><span className="font-semibold">{notif.actorId?.displayName}</span> rated <span className="text-accent">{notif.entityMeta?.score}/10</span></>
      case 'friend_favorited': return <><span className="font-semibold">{notif.actorId?.displayName}</span> favorited a theme</>
      case 'follow': return <><span className="font-semibold">{notif.actorId?.displayName}</span> started following you</>
      default: return <><span className="font-semibold">{notif.actorId?.displayName}</span> interacted with you</>
    }
  }

  return (
    <>
      <AppHeader />
      <main className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={() => markAsRead({ markAll: true })}
              disabled={isPending}
              className="text-sm text-accent font-semibold hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {isLoading ? (
          <LoadingSkeleton count={6} />
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif: any) => (
              <div
                key={notif._id}
                className={cn(
                  'bg-bg-surface rounded-[16px] border border-border-subtle p-4 shadow-card',
                  !notif.read && 'bg-accent-container/30'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-elevated">
                      {notif.actorId?.avatarUrl ? (
                        <img src={notif.actorId.avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ktext-tertiary">
                          {notif.actorId?.displayName?.[0] ?? '?'}
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-bg-surface',
                      notif.type === 'friend_request' ? 'bg-accent' : 'bg-accent-mint'
                    )}>
                      {getNotificationIcon(notif.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body text-ktext-primary leading-relaxed">
                      {getNotificationText(notif)}
                    </p>
                    <p className="text-xs text-ktext-tertiary mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>

                  {notif.type === 'friend_rated' && notif.entityMeta?.themeSlug && (
                    <Link href={`/theme/${notif.entityMeta.themeSlug}`} className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-bg-elevated">
                      {notif.entityMeta.animeCoverImage && (
                        <img src={notif.entityMeta.animeCoverImage} className="w-full h-full object-cover" />
                      )}
                    </Link>
                  )}

                  {notif.type === 'friend_favorited' && notif.entityMeta?.themeSlug && (
                    <Link href={`/theme/${notif.entityMeta.themeSlug}`} className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-bg-elevated">
                      {notif.entityMeta.animeCoverImage && (
                        <img src={notif.entityMeta.animeCoverImage} className="w-full h-full object-cover" />
                      )}
                    </Link>
                  )}

                  {notif.type === 'follow' && (
                    <Link href={`/user/${notif.actorId?.username}`} className="text-accent text-sm font-semibold">
                      View
                    </Link>
                  )}

                  {!notif.read && (
                    <button
                      onClick={() => markAsRead({ notificationIds: [notif._id] })}
                      className="text-xs text-ktext-tertiary hover:text-accent"
                    >
                      ✓
                    </button>
                  )}
                </div>

                {notif.type === 'friend_request' && !notif.read && (
                  <div className="flex gap-2 mt-3 ml-15">
                    <button className="flex-1 h-10 bg-accent text-white rounded-full font-body font-semibold text-sm">
                      Accept
                    </button>
                    <button className="flex-1 h-10 bg-bg-elevated border border-border-default text-ktext-secondary rounded-full font-body font-semibold text-sm">
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No notifications"
            description="You're all caught up!"
          />
        )}
      </main>
    </>
  )
}