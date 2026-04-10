'use client'

import { ThemeListRowSkeleton } from '@/app/components/shared/LoadingSkeleton'

export default function HomeLoading() {
  return (
    <div className="max-w-2xl mx-auto md:max-w-7xl space-y-6 pt-4 px-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-32 h-8 bg-bg-elevated rounded animate-pulse" />
          <div className="w-16 h-5 bg-bg-elevated rounded animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[...Array(4)].map((_, i) => (
            <ThemeListRowSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="w-40 h-6 bg-bg-elevated rounded animate-pulse" />
        {[...Array(6)].map((_, i) => (
          <ThemeListRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}