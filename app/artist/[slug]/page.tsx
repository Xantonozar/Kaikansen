'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { ThemeFeaturedCard } from '@/app/components/theme/ThemeFeaturedCard'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { useArtist } from '@/lib/api/artist'

export default function ArtistPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data, isLoading } = useArtist(slug)
  const artist = data?.data as any
  const themes = artist?.themes ?? []
  
  const openings = themes.filter((t: any) => t.type === 'OP')
  const endings = themes.filter((t: any) => t.type === 'ED')

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

  if (!artist) {
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
          {/* OPENINGS section */}
          {openings.length > 0 && (
            <section>
              <h2 className="text-xl font-display font-bold text-ktext-primary mb-3">
                OPENINGS
              </h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                {openings.map((theme: any) => (
                  <ThemeFeaturedCard key={theme.slug} theme={theme} />
                ))}
              </div>
            </section>
          )}

          {/* ENDINGS section */}
          {endings.length > 0 && (
            <section>
              <h2 className="text-xl font-display font-bold text-ktext-primary mb-3">
                ENDINGS
              </h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                {endings.map((theme: any) => (
                  <ThemeFeaturedCard key={theme.slug} theme={theme} />
                ))}
              </div>
            </section>
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