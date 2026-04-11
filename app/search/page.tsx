'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Search as SearchIcon, X, User } from 'lucide-react'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { queryKeys } from '@/lib/queryKeys'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'song' | 'singer' | 'anime'
type TabType = 'themes' | 'artists'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const initialFilter = (searchParams.get('by') as FilterType) || 'all'
  
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [filter, setFilter] = useState<FilterType>(initialFilter)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<TabType>('themes')

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Reset tab when filter changes
  useEffect(() => {
    setActiveTab('themes')
  }, [debouncedQuery, filter])

  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: queryKeys.search.results(debouncedQuery, filter),
    queryFn: async ({ pageParam = 1 }) => {
      const by = filter === 'all' ? undefined : filter
      const params = new URLSearchParams()
      params.set('q', debouncedQuery)
      params.set('page', String(pageParam))
      if (by) params.set('by', by)
      
      const res = await fetch(`/api/search?${params.toString()}`)
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

  const themes = data?.pages?.flatMap((page: any) => page.data?.themes || []) || []
  const artists = data?.pages?.flatMap((page: any) => page.data?.artists || []) || []
  const results = activeTab === 'themes' ? themes : artists
  const showTabs = filter === 'all' && (themes.length > 0 || artists.length > 0)

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
      <main className="px-3 py-4 md:px-4">
        <form onSubmit={handleSearch} className="mb-3">
          <div className="flex items-center gap-2 md:gap-3 h-10 md:h-12 bg-bg-elevated rounded-full px-3 md:px-4 border border-border-default focus-within:border-border-accent focus-within:ring-2 focus-within:ring-accent/20">
            <SearchIcon className="w-4 h-4 text-ktext-tertiary flex-shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search songs, artists, anime…"
              className="flex-1 bg-transparent outline-none text-sm font-body text-ktext-primary placeholder:text-ktext-tertiary min-w-0"
            />
            {searchInput && (
              <button 
                type="button"
                onClick={() => setSearchInput('')} 
                className="interactive rounded-full p-1 flex-shrink-0"
              >
                <X className="w-4 h-4 text-ktext-tertiary" />
              </button>
            )}
          </div>
        </form>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-3 px-3 md:mx-0 md:px-0">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={cn(
                'flex-shrink-0 h-8 md:h-9 px-3 md:px-4 rounded-full text-xs md:text-sm font-body font-medium transition-colors duration-150 interactive whitespace-nowrap',
                filter === f.value
                  ? 'bg-accent text-white'
                  : 'bg-bg-surface border border-border-default text-ktext-secondary'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tabs for All filter */}
        {showTabs && (
          <div className="flex gap-1 p-1 bg-bg-elevated rounded-full mb-3 w-fit">
            <button
              onClick={() => setActiveTab('themes')}
              className={cn(
                'px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-body font-semibold transition-colors duration-150 interactive whitespace-nowrap',
                activeTab === 'themes'
                  ? 'bg-accent text-white'
                  : 'text-ktext-secondary'
              )}
            >
              Themes ({themes.length})
            </button>
            <button
              onClick={() => setActiveTab('artists')}
              className={cn(
                'px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-body font-semibold transition-colors duration-150 interactive whitespace-nowrap',
                activeTab === 'artists'
                  ? 'bg-accent text-white'
                  : 'text-ktext-secondary'
              )}
            >
              Artists ({artists.length})
            </button>
          </div>
        )}

        {isLoading ? (
          <LoadingSkeleton count={6} />
        ) : results.length > 0 ? (
          <div className="space-y-2">
            {activeTab === 'themes' ? (
              results.map((theme: any) => (
                <ThemeListRow key={theme.slug} theme={theme} />
              ))
            ) : (
              results.map((artist: any) => (
                <ArtistRow key={artist.slug} artist={artist} />
              ))
            )}
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
            description={`No ${activeTab} found matching "${debouncedQuery}"`}
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

function ArtistRow({ artist }: { artist: any }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-bg-surface rounded-[16px] border border-border-subtle shadow-card">
      <div className="w-16 h-16 flex-shrink-0 rounded-[12px] overflow-hidden bg-bg-elevated">
        {artist.imageUrl ? (
          <img 
            src={artist.imageUrl} 
            alt={artist.name}
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-8 h-8 text-ktext-tertiary" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body font-semibold text-ktext-primary truncate">{artist.name}</p>
        <p className="text-xs font-body text-ktext-secondary">{artist.totalThemes || 0} themes</p>
      </div>
    </div>
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