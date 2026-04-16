'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Share2, Plus, AlertCircle, Music, Headphones } from 'lucide-react'
import { VideoPlayer } from '@/app/components/theme/VideoPlayer'
import { WatchListenToggle } from '@/app/components/theme/WatchListenToggle'
import { RatingWidget } from '@/app/components/theme/RatingWidget'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { useAuth } from '@/providers/AuthProvider'
import { useTheme } from '@/lib/api/themes'
import { useMyRating, useSetRating } from '@/lib/api/ratings'
import { useAddToHistory } from '@/lib/api/history'
import { getScoreColor, formatCount } from '@/lib/utils'

interface ThemePageClientProps {
  slug: string
}

export function ThemePageClient({ slug }: ThemePageClientProps) {
  const { user } = useAuth()
  const { data: themeData, isLoading, error } = useTheme(slug)
  const { data: ratingData } = user ? useMyRating(slug) : { data: undefined }
  const { mutate: setRating, isPending: isRatingPending } = useSetRating()
  const { mutate: addToHistory } = useAddToHistory()
  
  const [mode, setMode] = useState<'watch' | 'listen'>('watch')
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const theme = themeData?.data as any
  const userRating = (ratingData?.data as any)?.score

  if (isLoading) return <LoadingSkeleton />
  if (error || !theme) return <EmptyState title="Theme not found" />

  console.log('Theme data:', { slug, hasEntries: !!theme.entries, entriesLength: theme.entries?.length })
  console.log('Theme entries:', theme.entries)

  const videoSources = theme.entries?.flatMap((e: any) => 
    e.videos?.map((v: any) => ({
      resolution: v.resolution,
      url: v.url,
      tags: [v.source, v.nc ? 'NC' : null, v.lyrics ? 'Lyrics' : null].filter(Boolean)
    })) || []
  ) || []

  console.log('Video sources from entries:', videoSources)

  const fallbackVideoSources = theme.videoUrl ? [{
    resolution: theme.videoResolution || 1080,
    url: theme.videoUrl,
    tags: []
  }] : []

  console.log('Fallback video sources:', fallbackVideoSources)

  const finalVideoSources = videoSources.length > 0 ? videoSources : fallbackVideoSources
  console.log('Final video sources:', finalVideoSources)

  const handleRate = (score: number) => {
    setSelectedRating(score)
    setShowConfirm(true)
  }

  const handleConfirmRating = () => {
    if (!user || !selectedRating) return
    setRating({ themeSlug: slug, score: selectedRating, mode }, {
      onSuccess: () => {
        setShowConfirm(false)
        setSelectedRating(null)
      }
    })
  }

  const handleWatchListen = () => {
    if (!user) return
    addToHistory({ themeSlug: slug, mode })
  }

  const handleModeChange = (newMode: 'watch' | 'listen') => {
    setMode(newMode)
  }

  const typeLabel = theme.type === 'OP' ? 'Opening Theme' : 'Ending Theme'
  const sequenceLabel = theme.sequence > 1 ? `0${theme.sequence}` : '01'
  const seasonLabel = theme.animeSeason ? theme.animeSeason.toLowerCase() : ''

  return (
    <div className="pb-8">
      {/* Video player — full width */}
      <div className="-mx-4 md:-mx-6">
        <VideoPlayer
          videoSources={finalVideoSources}
          audioUrl={null}
          poster={theme.animeCoverImage}
          mode={mode}
          onEnded={handleWatchListen}
        />
      </div>

      {/* Watch/Listen toggle */}
      <div className="flex gap-2 mt-4 px-4">
        <WatchListenToggle mode={mode} onModeChange={handleModeChange} />
      </div>

      {/* Song info */}
      <div className="px-4 mt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-body font-semibold text-ktext-tertiary uppercase tracking-wide">
                {typeLabel} {sequenceLabel}{seasonLabel && ` · ${seasonLabel}`}{theme.animeSeasonYear && ` ${theme.animeSeasonYear}`}
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-ktext-primary leading-tight">{theme.songTitle}</h1>
            <p className="text-sm font-body text-accent font-semibold mt-1">
              {theme.artistName}
            </p>
            <Link 
              href={`/anime/${theme.anilistId}`}
              className="text-xs font-body text-ktext-tertiary mt-0.5 hover:text-accent transition-colors"
            >
              {theme.animeTitleEnglish || theme.animeTitle}
            </Link>
          </div>
          {/* Share button */}
          <button className="w-9 h-9 rounded-full bg-bg-elevated border border-border-default flex items-center justify-center interactive flex-shrink-0">
            <Share2 className="w-4 h-4 text-ktext-secondary" />
          </button>
        </div>
      </div>

      {/* Community stats */}
      <div className="flex gap-3 mx-4 mt-4">
        <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
          <p className="text-xl font-mono font-bold" style={{ color: getScoreColor(Math.round(theme.avgRating || 0)) }}>
            {theme.avgRating?.toFixed(1) ?? '—'}
          </p>
          <p className="text-[10px] font-body text-ktext-tertiary tracking-wide">AVG RATING</p>
        </div>
        <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
          <p className="text-xl font-mono font-bold text-ktext-primary">{formatCount(theme.totalRatings || 0)}</p>
          <p className="text-[10px] font-body text-ktext-tertiary tracking-wide">RATINGS</p>
        </div>
        <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
          <p className="text-xl font-mono font-bold text-ktext-primary">{formatCount(theme.totalWatches || 0)}</p>
          <p className="text-[10px] font-body text-ktext-tertiary tracking-wide">
            {mode === 'watch' ? 'WATCHES' : 'LISTENS'}
          </p>
        </div>
      </div>

      {/* Rating widget - only for logged in users */}
      {user && (
        <div className="mx-4 mt-4 bg-bg-surface rounded-[20px] border border-border-subtle p-4 shadow-card">
          <RatingWidget
            currentRating={userRating}
            onRate={handleRate}
            isLoading={isRatingPending}
          />
          {showConfirm && selectedRating && (
            <button
              onClick={handleConfirmRating}
              className="w-full h-12 bg-accent text-white rounded-full font-body font-semibold interactive mt-4"
            >
              Confirm Rating
            </button>
          )}
        </div>
      )}

      {/* Artists/Credits */}
      {theme.allArtists && theme.allArtists.length > 0 && (
        <div className="mx-4 mt-4 space-y-2">
          <h3 className="text-sm font-body font-semibold text-ktext-secondary uppercase tracking-wide">Production</h3>
          {theme.allArtists.map((artist: string, i: number) => (
            <div key={i} className="flex items-center gap-3 bg-bg-surface rounded-[12px] p-3 border border-border-subtle">
              <div className="w-8 h-8 rounded-full bg-accent-container flex items-center justify-center">
                <Music className="w-3.5 h-3.5 text-accent" />
              </div>
              <div>
                <p className="text-[10px] font-body text-ktext-tertiary uppercase tracking-wide">
                  {theme.artistRoles?.[i] || 'Artist'}
                </p>
                <Link 
                  href={`/artist/${theme.artistSlugs?.[i] || artist.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm font-body font-semibold text-ktext-primary hover:text-accent"
                >
                  {artist}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="mx-4 mt-4 space-y-1">
        <button className="w-full flex items-center gap-3 p-4 rounded-[12px] interactive text-ktext-secondary hover:text-ktext-primary transition-colors bg-bg-surface">
          <Plus className="w-5 h-5" />
          <span className="text-sm font-body font-medium">Add to Library</span>
        </button>
        {user && (
          <button 
            onClick={handleWatchListen}
            className="w-full flex items-center gap-3 p-4 rounded-[12px] interactive text-ktext-secondary hover:text-ktext-primary transition-colors bg-bg-surface"
          >
            {mode === 'watch' ? (
              <Eye className="w-5 h-5" />
            ) : (
              <Headphones className="w-5 h-5" />
            )}
            <span className="text-sm font-body font-medium">Mark as {mode === 'watch' ? 'Watched' : 'Listened'}</span>
          </button>
        )}
        <button className="w-full flex items-center gap-3 p-4 rounded-[12px] interactive text-ktext-secondary hover:text-ktext-primary transition-colors bg-bg-surface">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-body font-medium">Report Issues</span>
        </button>
      </div>
    </div>
  )
}