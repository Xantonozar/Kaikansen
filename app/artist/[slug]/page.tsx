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
      <main className="max-w-4xl mx-auto">
        {/* Hero banner */}
        {artist.coverImage && (
          <div className="relative h-56 w-full">
            <img
              src={artist.coverImage}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/50 to-transparent" />
          </div>
        )}

        {/* Artist name + stats */}
        <div className="px-4 -mt-8 relative z-10">
          <h1 className="text-3xl font-display font-bold text-ktext-primary">
            {artist.name}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-ktext-secondary">
            {artist.totalThemes && (
              <span>{artist.totalThemes} themes</span>
            )}
            {artist.genres && artist.genres.length > 0 && (
              <span className="text-ktext-tertiary">{artist.genres.join(', ')}</span>
            )}
          </div>
          {artist.description && (
            <p className="text-ktext-secondary mt-3 text-sm">{artist.description}</p>
          )}
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