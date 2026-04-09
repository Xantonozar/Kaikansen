'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSearch } from '@/lib/api/themes'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(query)
  const { data, isLoading } = useSearch(searchInput)

  const themes = (data?.data?.themes || []) as any[]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search themes, artists, anime..."
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : themes.length > 0 ? (
        <div className="space-y-2">
          {themes.map((theme: any) => (
            <ThemeListRow key={theme.slug} theme={theme} />
          ))}
        </div>
      ) : searchInput.length > 0 ? (
        <EmptyState
          title="No results"
          description={`No themes found matching "${searchInput}"`}
        />
      ) : (
        <EmptyState
          title="Enter a search query"
          description="Search for themes, artists, or anime titles"
        />
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSkeleton count={5} />}>
      <SearchContent />
    </Suspense>
  )
}
