'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/api/themes'
import { useMyRating, useSetRating } from '@/lib/api/ratings'
import { useAddFavorite, useRemoveFavorite } from '@/lib/api/favorites'
import { useAddToHistory } from '@/lib/api/history'
import { RatingWidget } from '@/app/components/shared/RatingWidget'
import { WatchListenToggle } from '@/app/components/shared/WatchListenToggle'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { useAuth } from '@/providers/AuthProvider'
import Link from 'next/link'
import { cn, getScoreColor } from '@/lib/utils'

export default function ThemePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return <ThemePageContent params={params} />
}

async function ThemePageContent({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { user } = useAuth()
  
  const { data: themeData, isLoading } = useTheme(slug)
  const { data: ratingData } = useMyRating(user ? slug : '')
  const { mutate: setRating, isPending: isRatingPending } = useSetRating()
  const { mutate: addFavorite } = useAddFavorite()
  const { mutate: removeFavorite } = useRemoveFavorite()
  const { mutate: addToHistory } = useAddToHistory()

  const [mode, setMode] = useState<'watch' | 'listen'>('watch')

  const theme = themeData?.data as any
  const userRating = (ratingData?.data as any)?.score

  if (isLoading) return <LoadingSkeleton />
  if (!theme) return <EmptyState title="Theme not found" />

  const handleRate = (score: number) => {
    if (!user) return
    setRating({ themeSlug: slug, score, mode })
  }

  const handleToggleFavorite = () => {
    if (!user) return
    addToHistory({ themeSlug: slug, mode })
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          {theme.animeCoverImage && (
            <div className="aspect-video relative rounded-[20px] overflow-hidden">
              <img
                src={theme.animeCoverImage}
                alt={theme.animeTitle}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`
                text-[10px] font-mono font-bold px-2 py-0.5 rounded-full
                ${theme.type === 'OP' ? 'bg-accent-container text-accent' : 'bg-accent-ed-container text-accent-ed'}
              `}>
                {theme.type}{theme.sequence}
              </span>
              {theme.animeSeason && (
                <span className="text-xs text-ktext-tertiary">
                  {theme.animeSeason} {theme.animeSeasonYear}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-display font-bold text-ktext-primary">
              {theme.songTitle}
            </h1>
            <p className="text-sm text-ktext-secondary">{theme.animeTitle}</p>
          </div>

          <div className="flex gap-2">
            {theme.videoSources?.map((source: any, i: number) => (
              <a
                key={i}
                href={source.url}
                className="px-3 py-1.5 text-sm rounded-full bg-bg-elevated border border-border-default text-ktext-secondary hover:text-ktext-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.resolution}p
              </a>
            ))}
          </div>

          {theme.allArtists && theme.allArtists.length > 0 && (
            <div>
              <p className="text-xs font-body font-semibold text-ktext-tertiary uppercase tracking-wide mb-2">Artists</p>
              <div className="flex flex-wrap gap-2">
                {theme.allArtists.map((artist: string, i: number) => (
                  <Link
                    key={i}
                    href={`/artist/${theme.artistSlugs?.[i] ?? artist.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-accent hover:underline"
                  >
                    {artist}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
              <p className="text-xl font-mono font-bold" style={{ color: getScoreColor(Math.round(theme.avgRating)) }}>
                {theme.avgRating?.toFixed(1) ?? '—'}
              </p>
              <p className="text-[10px] font-body text-ktext-tertiary tracking-wide">AVG RATING</p>
            </div>
            <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
              <p className="text-xl font-mono font-bold text-ktext-primary">{theme.totalRatings ?? 0}</p>
              <p className="text-[10px] font-body text-ktext-tertiary tracking-wide">RATINGS</p>
            </div>
            <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
              <p className="text-xl font-mono font-bold text-ktext-primary">{theme.totalWatches ?? 0}</p>
              <p className="text-[10px] font-body text-ktext-tertiary tracking-wide">WATCHES</p>
            </div>
          </div>

          {user && (
            <div className="bg-bg-surface rounded-[20px] border border-border-subtle p-4 shadow-card space-y-4">
              <WatchListenToggle mode={mode} onModeChange={setMode} />
              
              <RatingWidget
                currentRating={userRating}
                onRate={handleRate}
                isLoading={isRatingPending}
              />

              <button
                onClick={handleToggleFavorite}
                className="w-full h-12 rounded-full bg-accent text-white font-body font-semibold"
              >
                Add to History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}