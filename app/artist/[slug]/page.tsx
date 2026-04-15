'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { useArtist, useArtistThemes } from '@/lib/api/artist'

export default function ArtistPage() {
  const params = useParams()
  const slug = params.slug as string
  const [typeFilter, setTypeFilter] = useState<'OP' | 'ED' | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { data: artistData, isLoading: artistLoading } = useArtist(slug)
  const { 
    data: themesData, 
    isLoading: themesLoading, 
    fetchNextPage, 
    hasNextPage,
    isFetchingNextPage 
  } = useArtistThemes(slug)
  
  const artist = artistData?.data as any
  const allThemes = (themesData?.pages?.flatMap((page: any) => page.data || []) ?? []) as any[]
  const hasMorePage = themesData?.pageParams?.length ?? 0
  
  const filteredThemes = typeFilter 
    ? allThemes.filter((t: any) => t.type === typeFilter)
    : allThemes

  const openings = allThemes.filter((t: any) => t.type === 'OP')
  const endings = allThemes.filter((t: any) => t.type === 'ED')
  const isLoading = artistLoading || themesLoading

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage()
      },
      { threshold: 0.1 }
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <>
        <AppHeader />
        <main className="p-4">
          <LoadingSkeleton count={12} />
        </main>
      </>
    )
  }

  if (!artist || !slug) {
    return (
      <>
        <AppHeader />
        <main className="p-4">
          <EmptyState
            title="Artist not found"
            description="This artist doesn't exist or has been removed."
          />
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="max-w-2xl mx-auto pt-2">
        {/* Artist Info Card - below header */}
        <div className="px-4 mb-4">
          <div className="bg-bg-surface rounded-[24px] border border-border-subtle p-5 shadow-lg">
            <h1 className="text-2xl font-display font-bold text-ktext-primary">
              {artist.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {artist.totalThemes && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-container text-accent rounded-full text-sm font-semibold">
                  <span className="text-base">🎵</span> {artist.totalThemes} themes
                </span>
              )}
              {openings.length > 0 && (
                <span className="px-3 py-1.5 bg-accent/15 text-accent rounded-full text-sm font-semibold">
                  {openings.length} OP
                </span>
              )}
              {endings.length > 0 && (
                <span className="px-3 py-1.5 bg-accent-ed/15 text-accent-ed rounded-full text-sm font-semibold">
                  {endings.length} ED
                </span>
              )}
            </div>
            {artist.genres && artist.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {artist.genres.map((genre: string) => (
                  <span key={genre} className="text-xs px-2 py-1 bg-bg-elevated text-ktext-tertiary rounded-full">
                    {genre}
                  </span>
                ))}
              </div>
            )}
            {artist.description && (
              <p className="text-sm text-ktext-secondary mt-3 leading-relaxed">{artist.description}</p>
            )}
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Themes with Toggle - Home page style */}
          {(openings.length > 0 || endings.length > 0) && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-display font-bold text-ktext-primary">🎵 Themes</h2>
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
                {filteredThemes.map((theme: any) => (
                  <ThemeListRow key={theme.slug} theme={theme} />
                ))}
              </div>
              
              {filteredThemes.length === 0 && (
                <p className="text-center text-ktext-tertiary py-8">
                  No {typeFilter} themes found
                </p>
              )}
            </section>
          )}

          {/* No themes */}
          {allThemes.length === 0 && !themesLoading && (
            <EmptyState
              title="No themes"
              description="This artist hasn't sung any themes yet."
            />
          )}

          <div ref={loadMoreRef} className="py-4 text-center">
            {isFetchingNextPage && (
              <p className="text-sm text-ktext-tertiary">Loading more...</p>
            )}
          </div>
        </div>
      </main>
    </>
  )
}