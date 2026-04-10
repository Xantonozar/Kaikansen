'use client'

import { ProfileHeaderSkeleton, ThemeListRowSkeleton } from '@/app/components/shared/LoadingSkeleton'

export default function UserLoading() {
  return (
    <div className="p-4 space-y-6">
      <ProfileHeaderSkeleton />
      <div className="space-y-3">
        <div className="w-32 h-6 bg-bg-elevated rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <ThemeListRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}