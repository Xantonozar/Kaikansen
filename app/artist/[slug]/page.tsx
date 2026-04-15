'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { ThemeFeaturedCard } from '@/app/components/theme/ThemeFeaturedCard'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { useArtist } from '@/lib/api/artist'
import { useArtistThemes } from '@/lib/api/themes'

export default function ArtistPage() {
  const params = useParams()
  const slug = params.slug as string
  const [page, setPage] = useState(1)

  const { data: artistData, isLoading: artistLoading } = useArtist(slug)
  const { data: themesData, isLoading: themesLoading } = useArtistThemes(slug, page)
  const artist = artistData?.data as any
  const themes = (themesData?.data ?? []) as any[]
  
  const openings = themes.filter((t: any) => t.type === 'OP')
  const endings = themes.filter((t: any) => t.type === 'ED')
  const hasMore = themesData?.meta?.hasMore ?? false
  const isLoading = artistLoading || themesLoading

  const handleLoadMore = () => {
    setPage((p) => p + 1)
  }

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

        <div className="p-4 space-y-8">
          {/* OPENINGS section */}
          {openings.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-display font-bold text-ktext-primary">
                  OPENINGS <span className="text-ktext-tertiary text-base">({openings.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {openings.map((theme: any) => (
                  <ThemeFeaturedCard key={theme.slug} theme={theme} />
                ))}
              </div>
            </section>
          )}

          {/* ENDINGS section */}
          {endings.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-display font-bold text-ktext-primary">
                  ENDINGS <span className="text-ktext-tertiary text-base">({endings.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {endings.map((theme: any) => (
                  <ThemeFeaturedCard key={theme.slug} theme={theme} />
                ))}
              </div>
            </section>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={themesLoading}
                className="px-6 py-2 bg-bg-surface border border-border-subtle rounded-full text-sm font-semibold text-ktext-secondary hover:text-ktext-primary hover:border-accent transition-colors disabled:opacity-50"
              >
                {themesLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}

          {/* No themes */}
          {themes.length === 0 && (
            <EmptyState
              title="No themes"
              description="This artist hasn't sung any themes yet."
            />
          )}
        </div>
      </main>
    </>
  )
}