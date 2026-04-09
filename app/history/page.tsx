'use client'

import { useHistory } from '@/lib/api/history'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'

export default function HistoryPage() {
  const { data, isLoading } = useHistory()

  const history = data?.data || []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Watch & Listen History</h1>

      {isLoading ? (
        <LoadingSkeleton />
      ) : history.length > 0 ? (
        <div className="space-y-2">
          {history.map((item: any) => (
            <div key={item._id} className="card p-4">
              <div className="flex items-center justify-between">
                <a href={`/theme/${item.themeSlug}`} className="flex-1 hover:text-primary">
                  <p className="font-medium">{item.themeSlug}</p>
                </a>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Watched {item.watchCount} time{item.watchCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last viewed {new Date(item.lastWatchedAt).toLocaleDateString()}
                  </p>
                </div>
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
    </div>
  )
}
