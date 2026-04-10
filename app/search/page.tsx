'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSearch } from '@/lib/api/themes'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { Search as SearchIcon } from 'lucide-react'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(initialQuery)

  const { data, isLoading } = useSearch(searchInput, undefined, 1)
  const results = (data?.data ?? []) as any[]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  return (
    <>
      <AppHeader />
      <main className="p-4 max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex items-center gap-3 h-12 bg-bg-elevated rounded-[12px] px-4 border border-border-default focus-within:border-border-accent">
            <SearchIcon className="w-4 h-4 text-ktext-tertiary flex-shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search themes, artists, anime..."
              className="flex-1 bg-transparent outline-none text-sm font-body text-ktext-primary placeholder:text-ktext-disabled"
            />
          </div>
        </form>

        {isLoading ? (
          <LoadingSkeleton count={6} />
        ) : results.length > 0 ? (
          <div className="space-y-3">
            {results.map((theme: any) => (
              <ThemeListRow key={theme.slug} theme={theme} />
            ))}
          </div>
        ) : searchInput.length > 1 ? (
          <EmptyState
            title="No results"
            description={`No themes found matching "${searchInput}"`}
          />
        ) : searchInput.length > 0 ? (
          <EmptyState
            title="Query too short"
            description="Please enter at least 2 characters to search"
          />
        ) : (
          <EmptyState
            title="Search for your favourite opening or ending"
            description="Search by song title, artist name, or anime title"
          />
        )}
      </main>
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <>
        <AppHeader />
        <main className="p-4"><LoadingSkeleton count={6} /></main>
      </>
    }>
      <SearchContent />
    </Suspense>
  )
}