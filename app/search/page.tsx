'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSearch } from '@/lib/api/themes'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(query)
  const { data, isLoading } = useSearch(searchInput)

  const themes = data?.data?.themes || []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            // Would normally navigate with updated query
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

      {searchInput ? (
        <>
          {isLoading ? (
            <LoadingSkeleton />
          ) : themes.length > 0 ? (
            <div className="space-y-2">
              {themes.map((theme: any) => (
                <ThemeListRow key={theme.slug} theme={theme} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No results found"
              description={`We couldn't find any themes matching "${searchInput}"`}
            />
          )}
        </>
      ) : (
        <EmptyState
          title="Start searching"
          description="Enter a theme name, artist, or anime title to begin"
        />
      )}
    </div>
  )
}
