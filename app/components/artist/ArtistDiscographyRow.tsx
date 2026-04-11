'use client'

import Link from 'next/link'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ArtistDiscographyRowProps {
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
    animeSeasonYear?: number | null
  }
}

export function ArtistDiscographyRow({ theme }: ArtistDiscographyRowProps) {
  const coverImage = theme.animeCoverImage || '/placeholder.svg'
  const displayTitle = theme.animeTitleEnglish || theme.animeTitle || 'Unknown'
  
  return (
    <Link href={`/theme/${theme.slug}`}>
      <div className="
        flex items-center gap-3 p-3
        bg-bg-surface rounded-[16px]
        border border-border-subtle
        shadow-card interactive cursor-pointer
        transition-all duration-200 hover:shadow-card-hover hover:border-border-default
      ">
        <div className="w-12 h-12 flex-shrink-0 rounded-[12px] overflow-hidden bg-bg-elevated">
          <img 
            src={coverImage} 
            alt={displayTitle}
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full',
              theme.type === 'OP'
                ? 'bg-accent-container text-accent'
                : 'bg-accent-ed-container text-accent-ed'
            )}>
              {theme.type}{theme.sequence && theme.sequence > 1 ? `0${theme.sequence}` : '01'}
            </span>
            {theme.animeSeasonYear && (
              <span className="text-[10px] text-ktext-tertiary">{theme.animeSeasonYear}</span>
            )}
          </div>
          <p className="text-sm font-body font-semibold text-ktext-primary truncate mt-0.5">
            {theme.songTitle}
          </p>
          <p className="text-xs font-body text-ktext-secondary truncate">
            {displayTitle}
          </p>
        </div>
        
        <button className="w-9 h-9 rounded-full bg-accent-container flex items-center justify-center flex-shrink-0 interactive">
          <Play className="w-4 h-4 text-accent" />
        </button>
      </div>
    </Link>
  )
}