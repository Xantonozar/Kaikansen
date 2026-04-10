'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn, getScoreColor } from '@/lib/utils'

interface RatingWidgetProps {
  currentRating?: number
  onRate: (rating: number) => void
  isLoading?: boolean
}

export function RatingWidget({ currentRating, onRate, isLoading }: RatingWidgetProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-body font-semibold text-ktext-secondary uppercase tracking-wide">Your Rating</p>
        {currentRating && (
          <p className="text-xs font-body text-ktext-tertiary">Tap to score</p>
        )}
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            onClick={() => onRate(score)}
            disabled={isLoading}
            className={cn(
              'flex-1 h-11 rounded-full font-mono font-bold text-sm transition-all duration-150',
              currentRating === score
                ? 'text-white scale-110 shadow-accent-glow'
                : 'bg-bg-elevated text-ktext-tertiary border border-border-default hover:border-border-strong',
              isLoading && 'opacity-50'
            )}
            style={currentRating === score ? { backgroundColor: getScoreColor(score) } : {}}
            aria-label={`Rate ${score} out of 10`}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {[6, 7, 8, 9, 10].map((score) => (
          <button
            key={score}
            onClick={() => onRate(score)}
            disabled={isLoading}
            className={cn(
              'flex-1 h-11 rounded-full font-mono font-bold text-sm transition-all duration-150',
              currentRating === score
                ? 'text-white scale-110 shadow-accent-glow'
                : 'bg-bg-elevated text-ktext-tertiary border border-border-default hover:border-border-strong',
              isLoading && 'opacity-50'
            )}
            style={currentRating === score ? { backgroundColor: getScoreColor(score) } : {}}
            aria-label={`Rate ${score} out of 10`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  )
}