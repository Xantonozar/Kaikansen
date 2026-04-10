'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { useAnimeThemes } from '@/lib/api/themes'
import { Star, Play } from 'lucide-react'

export default function AnimePage() {
  const params = useParams()
  const anilistId = parseInt(params.anilistId as string)

  const { data, isLoading } = useAnimeThemes(anilistId)
  const anime = data?.data as any
  const themes = anime?.themes ?? []
  
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

  if (!anime) {
    return (
      <>
        <AppHeader />
        <main className="p-4">
          <EmptyState
            title="Anime not found"
            description="This anime doesn't exist or has no themes."
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
        <div className="relative h-56 w-full">
          <img
            src={anime.bannerImage || anime.animeGrillImage || '/placeholder.svg'}
            alt={anime.titleRomaji}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/50 to-transparent" />
          
          {/* Genre tags overlay bottom-left */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
              {anime.genres.slice(0, 3).map((genre: string) => (
                <span key={genre} className="text-[10px] font-mono font-semibold px-2 py-1 rounded-full bg-black/60 text-white">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Title + AniList score + episodes */}
        <div className="px-4 -mt-8 relative z-10">
          <h1 className="text-3xl font-display font-bold text-ktext-primary">
            {anime.titleRomaji}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-ktext-secondary">
            {anime.averageScore && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{anime.averageScore}</span>
              </div>
            )}
            {anime.totalEpisodes && (
              <span>{anime.totalEpisodes} episodes</span>
            )}
            {anime.status && (
              <span className="text-ktext-tertiary">{anime.status}</span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* OPENINGS section */}
          {openings.length > 0 && (
            <section>
              <h2 className="text-xl font-display font-bold text-ktext-primary mb-3">
                OPENINGS
              </h2>
              <div className="space-y-2">
                {openings.map((theme: any) => (
                  <ThemeListRow key={theme.slug} theme={theme} />
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
              <div className="space-y-2">
                {endings.map((theme: any) => (
                  <ThemeListRow key={theme.slug} theme={theme} />
                ))}
              </div>
            </section>
          )}

          {/* No themes */}
          {themes.length === 0 && (
            <EmptyState
              title="No themes"
              description="This anime has no opening or ending themes."
            />
          )}
        </div>
      </main>
    </>
  )
}