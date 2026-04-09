'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface RatingWidgetProps {
  currentRating?: number
  onRate: (rating: number) => Promise<void>
  isLoading?: boolean
}

export function RatingWidget({ currentRating, onRate, isLoading }: RatingWidgetProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <button
            key={rating}
            onClick={() => onRate(rating)}
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(null)}
            disabled={isLoading}
            className="transition-transform hover:scale-110 disabled:opacity-50"
            title={`Rate ${rating}/10`}
          >
            <Star
              className={`h-5 w-5 ${
                (hoveredRating && rating <= hoveredRating) ||
                (currentRating && rating <= currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
      {currentRating && (
        <span className="text-sm font-medium">Your rating: {currentRating}/10</span>
      )}
    </div>
  )
}
