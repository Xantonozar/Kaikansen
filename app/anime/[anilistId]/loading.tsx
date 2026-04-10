'use client'

import { ThemeCardSkeleton } from '@/app/components/shared/LoadingSkeleton'

export default function AnimeLoading() {
  return (
    <div className="space-y-6">
      <div className="h-56 bg-bg-elevated animate-pulse" />
      <div className="px-4 space-y-4">
        <div className="space-y-2">
          <div className="w-3/4 h-8 bg-bg-elevated rounded animate-pulse" />
          <div className="w-1/2 h-4 bg-bg-elevated rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <ThemeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}