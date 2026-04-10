'use client'

export function LoadingSkeleton({ count = 3 }: { count?: number } = {}) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-bg-elevated rounded-[16px] h-24 animate-pulse" />
      ))}
    </div>
  )
}

export function ThemeListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-bg-surface rounded-[16px] border border-border-subtle">
      <div className="w-16 h-16 rounded-[12px] bg-bg-elevated animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="w-12 h-4 bg-bg-elevated rounded-full animate-pulse" />
        <div className="w-3/4 h-4 bg-bg-elevated rounded animate-pulse" />
        <div className="w-1/2 h-3 bg-bg-elevated rounded animate-pulse" />
      </div>
      <div className="w-9 h-9 rounded-full bg-bg-elevated animate-pulse" />
    </div>
  )
}

export function ThemeFeaturedCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[75vw] md:w-72 aspect-video rounded-[20px] bg-bg-elevated animate-pulse" />
  )
}

export function ThemeCardSkeleton() {
  return (
    <div className="bg-bg-surface rounded-[16px] border border-border-subtle overflow-hidden">
      <div className="aspect-video bg-bg-elevated animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="w-12 h-4 bg-bg-elevated rounded-full animate-pulse" />
        <div className="w-3/4 h-4 bg-bg-elevated rounded animate-pulse" />
        <div className="w-1/2 h-3 bg-bg-elevated rounded animate-pulse" />
      </div>
    </div>
  )
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="w-24 h-24 rounded-full bg-bg-elevated animate-pulse" />
      <div className="space-y-2">
        <div className="w-32 h-6 bg-bg-elevated rounded animate-pulse" />
        <div className="w-24 h-4 bg-bg-elevated rounded animate-pulse" />
      </div>
      <div className="flex gap-3">
        <div className="w-20 h-10 bg-bg-elevated rounded-full animate-pulse" />
        <div className="w-20 h-10 bg-bg-elevated rounded-full animate-pulse" />
      </div>
    </div>
  )
}

export function NotificationSkeleton() {
  return (
    <div className="bg-bg-surface rounded-[16px] border border-border-subtle p-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-bg-elevated animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="w-3/4 h-4 bg-bg-elevated rounded animate-pulse" />
          <div className="w-1/4 h-3 bg-bg-elevated rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function ArtistHeaderSkeleton() {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="w-28 h-28 rounded-full bg-bg-elevated animate-pulse" />
      <div className="space-y-2">
        <div className="w-40 h-8 bg-bg-elevated rounded animate-pulse" />
        <div className="w-32 h-4 bg-bg-elevated rounded animate-pulse" />
      </div>
    </div>
  )
}