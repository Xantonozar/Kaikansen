'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'

interface ThemeFeaturedCardProps {
  theme: {
    slug: string
    songTitle: string
    artistName?: string | null
    animeTitle: string
    animeTitleEnglish?: string | null
    animeCoverImage: string | null
    animeGrillImage?: string | null
    type: 'OP' | 'ED'
    sequence?: number
    avgRating: number
    totalRatings: number
    anilistId?: number | null
  }
}

const anilistImageUrls = (id: number) => [
  `https://s4.anilist.co/Media/${id}/cover/extraLarge.jpg`,
  `https://s4.anilist.co/Media/${id}/cover/large.jpg`,
]

const fetchWithRetry = async (url: string, retries = 2): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { method: 'HEAD' })
      if (res.ok) return true
    } catch {
      // Continue to next retry
    }
  }
  return false
}

export function ThemeFeaturedCard({ theme }: ThemeFeaturedCardProps) {
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const fallbackImage = theme.animeCoverImage || theme.animeGrillImage || '/placeholder.svg'
  const displayTitle = theme.animeTitleEnglish || theme.animeTitle || 'Unknown'
  const displayArtist = theme.artistName || theme.songTitle || 'Unknown'

  useEffect(() => {
    const fetchHighResImage = async () => {
      if (!theme.anilistId) {
        setCoverImage(fallbackImage)
        setIsLoading(false)
        return
      }

      const urls = anilistImageUrls(theme.anilistId)
      
      for (const url of urls) {
        const exists = await fetchWithRetry(url, 2)
        if (exists) {
          setCoverImage(url)
          setIsLoading(false)
          return
        }
      }

      setCoverImage(fallbackImage)
      setIsLoading(false)
    }

    fetchHighResImage()
  }, [theme.anilistId, fallbackImage])

  return (
    <Link href={`/theme/${theme.slug}`}>
      <div className="
        flex-shrink-0 relative overflow-hidden rounded-[20px]
        w-[75vw] md:w-72 aspect-video
        interactive cursor-pointer
        bg-bg-surface shadow-card
      ">
        {isLoading ? (
          <div className="w-full h-full bg-bg-elevated animate-pulse" />
        ) : (
          <img 
            src={coverImage || fallbackImage} 
            alt={displayTitle}
            className="w-full h-full object-cover" 
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Score badge — top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-mono font-bold text-white">
            {theme.avgRating > 0 ? theme.avgRating.toFixed(1) : '—'}
          </span>
        </div>
        
        {/* Type badge — top right */}
        <div className={`absolute top-3 right-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full
          ${theme.type === 'OP' ? 'bg-accent text-white' : 'bg-accent-ed text-white'}`}>
          {theme.type}{theme.sequence && theme.sequence > 1 ? `0${theme.sequence}` : '01'}
        </div>
        
        {/* Info — bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-display font-bold text-white truncate">{displayTitle}</p>
          <p className="text-xs font-body text-white/70 truncate">{displayArtist}</p>
        </div>
      </div>
    </Link>
  )
}