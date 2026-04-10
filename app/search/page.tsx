'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Search as SearchIcon, Heart } from 'lucide-react'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { queryKeys } from '@/lib/queryKeys'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'song' | 'singer' | 'anime'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const initialFilter = (searchParams.get('by') as FilterType) || 'all'
  
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [filter, setFilter] = useState<FilterType>(initialFilter)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: queryKeys.search.results(debouncedQuery, filter),
    queryFn: async ({ pageParam = 1 }) => {
      const by = filter === 'all' ? undefined : filter
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(debouncedQuery)}&by=${by || ''}&page=${pageParam}`
      )
      const json = await res.json()
      return json
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage?.meta?.hasMore) return allPages.length + 1
      return undefined
    },
    initialPageParam: 1,
    enabled: debouncedQuery.length >= 2,
  })

  const results = data?.pages?.flatMap((page: any) => page.data || []) || []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}&by=${filter}`)
    }
  }

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}&by=${newFilter}`)
    }
  }

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'song', label: 'Song' },
    { value: 'singer', label: 'Singer' },
    { value: 'anime', label: 'Anime' },
  ]

  return (
    <>
      <AppHeader />
      <main className="p-4 max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex items-center gap-3 h-12 bg-bg-elevated rounded-full px-4 border border-border-default focus-within:border-border-accent">
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

        {/* Filter chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-body font-semibold transition-colors duration-150 interactive whitespace-nowrap',
                filter === f.value
                  ? 'bg-accent text-white'
                  : 'bg-bg-elevated text-ktext-secondary border border-border-default'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingSkeleton count={6} />
        ) : results.length > 0 ? (
          <div className="space-y-3">
            {results.map((theme: any) => (
              <ThemeListRow key={theme.slug} theme={theme} />
            ))}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                className="w-full py-3 text-center text-sm text-ktext-secondary interactive"
              >
                Load more
              </button>
            )}
          </div>
        ) : debouncedQuery.length >= 2 ? (
          <EmptyState
            title="No results"
            description={`No themes found matching "${debouncedQuery}"`}
          />
        ) : debouncedQuery.length > 0 ? (
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