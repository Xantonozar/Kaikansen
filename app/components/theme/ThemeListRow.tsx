'use client'

import Link from 'next/link'
import { Star, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeListRowProps {
  theme: {
    slug: string
    songTitle: string
    animeTitle: string
    animeTitleEnglish?: string | null
    animeCoverImage: string | null
    type: 'OP' | 'ED'
    sequence?: number
    avgRating: number
    totalRatings: number
    allArtists?: string[]
  }
  friendUsername?: string
  friendScore?: number
  qualityBadges?: string[]
  userRating?: number
}

export function ThemeListRow({ theme, friendUsername, friendScore, qualityBadges, userRating }: ThemeListRowProps) {
  const coverImage = theme.animeCoverImage || '/placeholder.svg'
  const displayTitle = theme.animeTitleEnglish || theme.animeTitle || 'Unknown'
  const displaySong = theme.songTitle || 'Unknown Theme'
  const displayArtist = theme.allArtists?.[0] || 'Unknown Artist'
  
  return (
    <Link href={`/theme/${theme.slug}`}>
      <div className="
        flex items-center gap-3 p-3
        bg-bg-surface rounded-[16px]
        border border-border-subtle
        shadow-card interactive cursor-pointer
        transition-all duration-200 hover:shadow-card-hover hover:border-border-default
      ">
        {/* Cover image — square */}
        <div className="w-16 h-16 flex-shrink-0 rounded-[12px] overflow-hidden bg-bg-elevated">
          <img 
            src={coverImage} 
            alt={displayTitle}
            className="w-full h-full object-cover" 
          />
        </div>
        
        {/* Text content */}
        <div className="flex-1 min-w-0 space-y-0.5">
          {/* OP/ED badge */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className={cn(
              'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full',
              theme.type === 'OP'
                ? 'bg-accent-container text-accent'
                : 'bg-accent-ed-container text-accent-ed'
            )}>
              {theme.type}{theme.sequence && theme.sequence > 1 ? `0${theme.sequence}` : '01'}
            </span>
            {/* Quality badges */}
            {qualityBadges?.map(badge => (
              <span key={badge} className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-bg-elevated text-ktext-tertiary border border-border-subtle">
                {badge}
              </span>
            ))}
          </div>
          
          <p className="text-sm font-body font-semibold text-ktext-primary truncate">{displaySong}</p>
          <p className="text-xs font-body text-ktext-secondary truncate">
            {displayArtist} · {displayTitle}
          </p>
          
          {/* For friends activity: username + score */}
          {friendUsername && (
            <p className="text-xs font-body text-accent truncate">
              @{friendUsername} rated {friendScore}/10
            </p>
          )}
          
          {/* Duration + rating */}
          {!friendUsername && !userRating && (
            <div className="flex items-center gap-2 pt-0.5">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-mono font-bold text-ktext-secondary">
                {theme.avgRating > 0 ? theme.avgRating.toFixed(1) : '—'}
              </span>
              <span className="text-xs text-ktext-tertiary">({theme.totalRatings})</span>
            </div>
          )}
        </div>
        
        {/* Right: play button or favorite */}
        <button className="w-9 h-9 rounded-full bg-accent-container flex items-center justify-center flex-shrink-0 interactive">
          <Play className="w-4 h-4 text-accent" />
        </button>
      </div>
    </Link>
  )
}