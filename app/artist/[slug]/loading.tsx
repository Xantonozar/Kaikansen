'use client'

import { ArtistHeaderSkeleton, ThemeListRowSkeleton } from '@/app/components/shared/LoadingSkeleton'

export default function ArtistLoading() {
  return (
    <div className="p-4 space-y-6">
      <ArtistHeaderSkeleton />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <ThemeListRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}