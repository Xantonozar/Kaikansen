'use client'

import { Eye, Headphones } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WatchListenToggleProps {
  mode: 'watch' | 'listen'
  onModeChange: (mode: 'watch' | 'listen') => void
}

export function WatchListenToggle({ mode, onModeChange }: WatchListenToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onModeChange('watch')}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-semibold transition-colors',
          mode === 'watch'
            ? 'bg-accent text-white'
            : 'bg-bg-elevated text-ktext-secondary border border-border-default'
        )}
      >
        <Eye className="w-4 h-4" />
        Watch
      </button>
      <button
        onClick={() => onModeChange('listen')}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-semibold transition-colors',
          mode === 'listen'
            ? 'bg-accent text-white'
            : 'bg-bg-elevated text-ktext-secondary border border-border-default'
        )}
      >
        <Headphones className="w-4 h-4" />
        Listen
      </button>
    </div>
  )
}