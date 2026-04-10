'use client'

import { Check } from 'lucide-react'
import { FollowButton } from '@/app/components/shared/FollowButton'
import { formatCount } from '@/lib/utils'

interface ArtistHeaderProps {
  artist: {
    name: string
    imageUrl?: string | null
    bio?: string | null
    totalThemes: number
  }
  isFollowing?: boolean
}

export function ArtistHeader({ artist, isFollowing }: ArtistHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center pt-6 space-y-4">
      <div className="relative">
        <div className="w-28 h-28 rounded-full overflow-hidden ring-2 ring-accent-mint ring-offset-2 ring-offset-bg-base">
          <img 
            src={artist.imageUrl || '/placeholder.svg'} 
            alt={artist.name}
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-display font-extrabold text-ktext-primary tracking-tight uppercase">
          {artist.name}
        </h1>
        {artist.bio && (
          <p className="text-sm font-body text-ktext-secondary mt-1">{artist.bio}</p>
        )}
      </div>

      <div className="flex gap-3 w-full max-w-xs">
        <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
          <p className="text-xl font-display font-bold text-accent">{formatCount(artist.totalThemes)}</p>
          <p className="text-[10px] font-body text-ktext-tertiary tracking-wide uppercase">Total Themes</p>
        </div>
      </div>

      <FollowButton username={artist.name.toLowerCase().replace(/\s+/g, '-')} />
    </div>
  )
}