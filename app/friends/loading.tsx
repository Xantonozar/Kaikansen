'use client'

import { ProfileHeaderSkeleton } from '@/app/components/shared/LoadingSkeleton'

export default function FriendsLoading() {
  return (
    <div className="p-4 space-y-4">
      <div className="w-40 h-8 bg-bg-elevated rounded animate-pulse" />
      <div className="flex gap-2">
        <div className="w-20 h-8 bg-bg-elevated rounded-full animate-pulse" />
        <div className="w-20 h-8 bg-bg-elevated rounded-full animate-pulse" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-bg-surface rounded-[16px] border border-border-subtle p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-bg-elevated animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-4 bg-bg-elevated rounded animate-pulse" />
              <div className="w-1/4 h-3 bg-bg-elevated rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}