'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Search as SearchIcon, X, Loader2 } from 'lucide-react'
import { ThemeFeaturedCard } from '@/app/components/theme/ThemeFeaturedCard'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { queryKeys } from '@/lib/queryKeys'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const loadMoreRef = useRef<HTMLDivElement>(null)
  
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: queryKeys.search.results(debouncedQuery, 'all'),
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams()
      params.set('q', debouncedQuery)
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
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  return (
    <>
      <AppHeader />
      <main className="px-3 py-4 md:px-4">
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
      </main>
    </>
  )
}