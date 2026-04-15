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
      <main className="max-w-2xl mx-auto">
        {/* Hero banner with artist info */}
        {artist.coverImage && (
          <div className="relative h-48 w-full">
            <img
              src={artist.coverImage}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/80 to-transparent" />
          </div>
        )}

        {/* Artist Info Card */}
        <div className="px-4 -mt-12 relative z-10 mb-4">
          <div className="bg-bg-surface rounded-[20px] border border-border-subtle p-4 shadow-card">
            <h1 className="text-2xl font-display font-bold text-ktext-primary">
              {artist.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              {artist.totalThemes && (
                <span className="px-2 py-1 bg-accent-container text-accent rounded-full font-medium">
                  {artist.totalThemes} themes
                </span>
              )}
              {openings.length > 0 && (
                <span className="px-2 py-1 bg-accent/10 text-accent rounded-full font-medium">
                  {openings.length} OP
                </span>
              )}
              {endings.length > 0 && (
                <span className="px-2 py-1 bg-accent-ed/10 text-accent-ed rounded-full font-medium">
                  {endings.length} ED
                </span>
              )}
            </div>
            {artist.genres && artist.genres.length > 0 && (
              <p className="text-xs text-ktext-tertiary mt-2">{artist.genres.join(', ')}</p>
            )}
            {artist.description && (
              <p className="text-sm text-ktext-secondary mt-3">{artist.description}</p>
            )}
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Themes with Toggle */}
          {(openings.length > 0 || endings.length > 0) && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-bold text-ktext-primary">
                  🎵 Themes
                </h2>
                <div className="flex gap-1 p-1 bg-bg-elevated rounded-full">
                  {(['OP', 'ED'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(typeFilter === t ? null : t)}
                      className={`h-7 px-3 rounded-full text-xs font-body font-bold transition-colors duration-150
                        ${typeFilter === t
                          ? t === 'OP' ? 'bg-accent text-white' : 'bg-accent-ed text-white'
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