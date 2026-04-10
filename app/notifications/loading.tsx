'use client'

import { NotificationSkeleton } from '@/app/components/shared/LoadingSkeleton'

export default function NotificationsLoading() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-40 h-8 bg-bg-elevated rounded animate-pulse" />
        <div className="w-24 h-5 bg-bg-elevated rounded animate-pulse" />
      </div>
      {[...Array(6)].map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  )
}