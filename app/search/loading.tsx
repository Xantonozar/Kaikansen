'use client'

import { ThemeListRowSkeleton } from '@/app/components/shared/LoadingSkeleton'

export default function SearchLoading() {
  return (
    <div className="p-4 space-y-4">
      <div className="w-full h-12 bg-bg-elevated rounded-full animate-pulse" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-16 h-8 bg-bg-elevated rounded-full animate-pulse" />
        ))}
      </div>
      {[...Array(6)].map((_, i) => (
        <ThemeListRowSkeleton key={i} />
      ))}
    </div>
  )
}