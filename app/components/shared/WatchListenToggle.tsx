'use client'

import { Heart } from 'lucide-react'

interface WatchListenToggleProps {
  isFavorite?: boolean
  onToggle: () => Promise<void>
  isLoading?: boolean
}

export function WatchListenToggle({
  isFavorite,
  onToggle,
  isLoading,
}: WatchListenToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
        isFavorite
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
      }`}
    >
      <Heart
        className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
      />
      {isFavorite ? 'Favorited' : 'Add to Favorites'}
    </button>
  )
}
