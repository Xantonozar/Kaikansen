'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Search as SearchIcon, X, Loader2 } from 'lucide-react'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { BottomNav } from '@/app/components/layout/BottomNav'
import { queryKeys } from '@/lib/queryKeys'
import { cn } from '@/lib/utils'

type SearchFilter = 'all' | 'song' | 'artist' | 'anime'

const FILTERS: { value: SearchFilter; label: string }[] = [
  { value: 'all', label: 'All Results' },
  { value: 'song', label: 'Song' },
  { value: 'artist', label: 'Singer' },
  { value: 'anime', label: 'Anime' },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const initialBy = (searchParams.get('by') as SearchFilter) || 'all'
  const loadMoreRef = useRef<HTMLDivElement>(null)
  
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [filterBy, setFilterBy] = useState<SearchFilter>(initialBy)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: queryKeys.search.results(debouncedQuery, filterBy),
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams()
      params.set('q', debouncedQuery)
      params.set('by', filterBy)
      params.set('page', String(pageParam))
      
      const res = await fetch(`/api/search?${params.toString()}`)
      return res.json()
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage?.meta?.hasMore) return allPages.length + 1
      return undefined
    },
    initialPageParam: 1,
    enabled: debouncedQuery.length >= 1,
  })

  const themes = data?.pages?.flatMap((page: any) => page.data?.themes || []) || []

  useEffect(() => {
    if (!hasNextPage || isLoading) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }
    
    return () => observer.disconnect()
  }, [hasNextPage, isLoading, fetchNextPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}&by=${filterBy}`)
    }
  }

  useEffect(() => {
    if (searchInput.trim()) {
      router.replace(`/search?q=${encodeURIComponent(searchInput.trim())}&by=${filterBy}`)
    }
  }, [filterBy, searchInput, router])

  return (
    <div className="min-h-screen bg-bg-base flex w-full">
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 lg:w-60 bg-bg-surface border-r border-border-subtle z-40 py-4">
        <div className="flex items-center gap-3 px-4 mb-8">
          <span className="text-accent text-2xl">≋</span>
          <span className="hidden lg:block font-display font-bold text-lg text-ktext-primary">Kaikansen</span>
        </div>
      </nav>
      
      <main className="flex-1 min-w-0 pb-20 md:pb-0 md:pl-20 lg:pl-60 w-full">
        <AppHeader />
        <div className="px-3 py-4 md:px-4">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="flex items-center gap-2 md:h-12 bg-bg-elevated rounded-full px-4 border border-border-default focus-within:border-border-accent focus-within:ring-2 focus-within:ring-accent/20">
              <SearchIcon className="w-5 h-5 text-ktext-tertiary flex-shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search anime, song, artist..."
                className="flex-1 bg-transparent outline-none text-base font-body text-ktext-primary placeholder:text-ktext-tertiary min-w-0"
              />
              {searchInput && (
                <button 
                  type="button"
                  onClick={() => setSearchInput('')} 
                  className="interactive rounded-full p-1 flex-shrink-0"
                >
                  <X className="w-5 h-5 text-ktext-tertiary" />
                </button>
              )}
            </div>
          </form>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterBy(filter.value)}
                className={cn(
                  'flex-shrink-0 h-9 px-4 rounded-full text-sm font-body font-medium transition-colors duration-150 interactive',
                  filterBy === filter.value
                    ? 'bg-accent text-white'
                    : 'bg-bg-surface border border-border-default text-ktext-secondary'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <LoadingSkeleton count={8} />
            </div>
          ) : themes.length > 0 ? (
            <>
              <div className="space-y-2">
                {themes.map((theme: any) => (
                  <ThemeListRow key={theme.slug} theme={theme} />
                ))}
              </div>
              {hasNextPage && (
                <div ref={loadMoreRef} className="py-4 text-center">
                  <Loader2 className="w-5 h-5 text-ktext-tertiary animate-spin mx-auto" />
                </div>
              )}
            </>
          ) : debouncedQuery.length >= 1 ? (
            <EmptyState
              title="No results"
              description={`No themes found matching "${debouncedQuery}"`}
            />
          ) : (
            <EmptyState
              title="Search for your favourite anime themes"
              description="Search by anime title, song title, artist name, OP/ED, or sequence number"
            />
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  )
}