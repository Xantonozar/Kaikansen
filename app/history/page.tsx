'use client'

import { useHistory } from '@/lib/api/history'
import { useAuth } from '@/providers/AuthProvider'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { HistoryCard } from '@/app/components/theme/HistoryCard'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function HistoryPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [modeFilter, setModeFilter] = useState<'all' | 'watch' | 'listen'>('all')

  const { data, isLoading } = useHistory(user?.id ?? '', modeFilter === 'all' ? undefined : modeFilter, 1)
  const history = (data?.data ?? []) as any[]

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
          <EmptyState title="Login required" description="Please login to view your history" />
        </main>
      </>
    )
  }

  const groupedByDate = history.reduce((acc, item) => {
    const date = new Date(item.viewedAt).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {} as Record<string, typeof history>)

  const getDateLabel = (dateStr: string) => {
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    if (dateStr === today) return 'TODAY'
    if (dateStr === yesterday) return 'YESTERDAY'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <>
      <AppHeader />
      <main className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-display font-bold mb-6">Watch History</h1>

        <div className="flex gap-2 mb-6">
          {(['all', 'watch', 'listen'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                modeFilter === m
                  ? 'bg-accent text-white'
                  : 'bg-bg-elevated text-ktext-secondary border border-border-default'
              )}
            >
              {m === 'all' ? 'All' : m === 'watch' ? 'Watched' : 'Listened'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingSkeleton count={8} />
        ) : history.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-border-subtle" />
                  <span className="text-xs font-body font-semibold tracking-[0.1em] uppercase text-ktext-tertiary">
                    {getDateLabel(date)}
                  </span>
                  <div className="flex-1 h-px bg-border-subtle" />
                </div>
                <div className="space-y-2">
                  {(items as any[]).map((item: any) => (
                    <HistoryCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No history yet"
            description="Your watch and listen history will appear here"
          />
        )}
      </main>
    </>
  )
}