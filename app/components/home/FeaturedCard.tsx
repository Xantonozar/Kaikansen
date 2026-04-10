'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { getScoreColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface FeaturedCardProps {
  theme: {
    slug: string
    songTitle: string
    animeTitle: string
    animeCoverImage: string | null
    type: string
    sequence: number
    avgRating: number
    totalRatings: number
  }
}

export function FeaturedCard({ theme }: FeaturedCardProps) {
  const coverImage = theme.animeCoverImage || '/placeholder.svg'
  const displayTitle = theme.animeTitle || 'Unknown'
  const displayArtist = theme.songTitle || 'Unknown Theme'
  
  return (
    <Link href={`/theme/${theme.slug}`}>
      <div className="
        flex-shrink-0 relative overflow-hidden rounded-[20px]
        w-[75vw] md:w-72 aspect-video
        interactive cursor-pointer
        bg-bg-surface shadow-card
      ">
        <img 
          src={coverImage} 
          alt={displayTitle}
          className="w-full h-full object-cover" 
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-mono font-bold text-white">
            {theme.avgRating > 0 ? theme.avgRating.toFixed(1) : '—'}
          </span>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-display font-bold text-white truncate">{displayArtist}</p>
          <p className="text-xs font-body text-white/70 truncate">{displayTitle}</p>
        </div>
      </div>
    </Link>
  )
}