'use client'

import { ThemeFeaturedCardSkeleton } from '@/app/components/shared/LoadingSkeleton'

export default function ThemeLoading() {
  return (
    <div className="space-y-6">
      <ThemeFeaturedCardSkeleton />
      <div className="px-4 space-y-4">
        <div className="space-y-2">
          <div className="w-16 h-5 bg-bg-elevated rounded-full animate-pulse" />
          <div className="w-3/4 h-8 bg-bg-elevated rounded animate-pulse" />
          <div className="w-1/2 h-4 bg-bg-elevated rounded animate-pulse" />
        </div>
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-20 h-10 bg-bg-elevated rounded-full animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-bg-elevated rounded-[16px] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}