'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ThemeFeaturedCard } from '@/app/components/theme/ThemeFeaturedCard'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { useAuth } from '@/providers/AuthProvider'

interface Theme {
  slug: string
  songTitle: string
  artistName?: string | null
  animeTitle: string
  animeCoverImage: string | null
  animeGrillImage?: string | null
  type: 'OP' | 'ED'
  sequence?: number
  avgRating: number
  totalRatings: number
}

interface HomeClientProps {
  popularThemes: Theme[]
  featuredThemes: Theme[]
  currentSeason: { season: string; year: number }
  stats: { activeUsers: number; listeningNow: number; avatars: string[] }
}

export function HomeClient({ popularThemes, featuredThemes, currentSeason, stats }: HomeClientProps) {
  const { user } = useAuth()
  const [typeFilter, setTypeFilter] = useState<'OP' | 'ED' | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const {
    data: paginatedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['popular-themes', typeFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/themes/popular?page=${pageParam}`)
      const json = await res.json()
      return json.success ? json : { success: false, data: [], meta: { hasMore: false } }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.meta?.hasMore) return pages.length + 1
      return undefined
    },
    initialData: {
      pages: [{ data: popularThemes, meta: { hasMore: true, page: 1, total: popularThemes.length } }],
      pageParams: [1],
    },
  })

  const allThemes = paginatedData.pages.flatMap((page: any) => page.data || [])
  const filteredThemes = typeFilter 
    ? allThemes.filter(t => t.type === typeFilter)
    : allThemes

  const featuredOPs = featuredThemes.filter(t => t.type === 'OP').slice(0, 10)
  const featuredEDs = featuredThemes.filter(t => t.type === 'ED').slice(0, 10)

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const { data: friendActivity } = useInfiniteQuery({
    queryKey: ['friends-activity', user?.id],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/friends/activity?page=${pageParam}`)
      const json = await res.json()
      return json.success ? json.data : []
    },
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    enabled: !!user,
  })

  return (
    <div className="max-w-2xl mx-auto md:max-w-7xl space-y-6 pt-4">
      {/* Section: Current Season Openings */}
      {featuredOPs.length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-body font-semibold text-accent uppercase tracking-wide">Current Season</p>
              <h2 className="text-2xl font-display font-bold text-ktext-primary">
                {currentSeason.season} {currentSeason.year} Openings
              </h2>
            </div>
            <Link 
              href={`/season/${currentSeason.season.toLowerCase()}/${currentSeason.year}`}
              className="text-sm font-body text-accent font-semibold interactive"
            >
              View All
            </Link>
          </div>
          
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {featuredOPs.map((theme) => (
              <ThemeFeaturedCard key={theme.slug} theme={theme} />
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-body font-semibold text-accent uppercase tracking-wide">Current Season</p>
              <h2 className="text-2xl font-display font-bold text-ktext-primary">
                {currentSeason.season} {currentSeason.year}
              </h2>
            </div>
          </div>
          <div className="bg-bg-surface rounded-[20px] border border-border-subtle p-6 text-center mb-4">
            <p className="text-sm font-body text-ktext-secondary mb-2">
              No themes available for {currentSeason.season} {currentSeason.year}
            </p>
            <p className="text-xs font-body text-ktext-tertiary mb-4">
              Run seed script to fetch latest anime themes
            </p>
          </div>
        </section>
      )}

      {/* Section: Current Season Endings */}
      {featuredEDs.length > 0 && (
        <section>
          <h2 className="text-lg font-display font-bold text-ktext-primary mb-3">
            {currentSeason.season} {currentSeason.year} Endings
          </h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {featuredEDs.map((theme) => (
              <ThemeFeaturedCard key={theme.slug} theme={theme} />
            ))}
          </div>
        </section>
      )}

      {/* Section: Current Season Endings */}
      {featuredEDs.length > 0 && (
        <section>
          <h2 className="text-lg font-display font-bold text-ktext-primary mb-3">
            {currentSeason.season} {currentSeason.year} Endings
          </h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {featuredEDs.map((theme) => (
              <ThemeFeaturedCard key={theme.slug} theme={theme} />
            ))}
          </div>
        </section>
      )}

      {/* Section: Friends Activity (logged in + has friends) */}
      {user && friendActivity && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-bold text-ktext-primary">👥 Friends Activity</h2>
            <Link href="/friends" className="text-sm font-body text-accent font-semibold interactive">
              See all
            </Link>
          </div>
          <div className="space-y-2">
            {friendActivity.pages.flatMap((page: any) => page.slice(0, 5)).map((activity: any, idx: number) => (
              <ThemeListRow 
                key={`${activity.username}-${activity.themeSlug}-${idx}`}
                theme={{
                  slug: activity.themeSlug,
                  songTitle: activity.theme?.songTitle || '',
                  animeTitle: activity.theme?.animeTitle || '',
                  animeCoverImage: activity.theme?.animeCoverImage || null,
                  type: activity.theme?.type || 'OP',
                  sequence: activity.theme?.sequence,
                  avgRating: activity.score || 0,
                  totalRatings: 0,
                }}
                friendUsername={activity.username}
                friendScore={activity.score}
              />
            ))}
          </div>
        </section>
      )}

      {/* Section: Popular Themes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-bold text-ktext-primary">🔥 Popular Themes</h2>
          <div className="flex gap-1 p-1 bg-bg-elevated rounded-full">
            {(['OP', 'ED'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(typeFilter === t ? null : t)}
                className={`h-7 px-3 rounded-full text-xs font-body font-bold transition-colors duration-150 interactive
                  ${typeFilter === t
                    ? 'bg-accent text-white'
                    : 'text-ktext-secondary hover:text-ktext-primary'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          {filteredThemes.map((theme) => (
            <ThemeListRow key={theme.slug} theme={theme} />
          ))}
          <div ref={loadMoreRef} className="py-4 text-center">
            {isFetchingNextPage && (
              <p className="text-sm text-ktext-tertiary">Loading more...</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}