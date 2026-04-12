'use client'

import Link from 'next/link'
import { Eye, Headphones, Play } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

interface HistoryCardProps {
  item: {
    _id: string
    themeSlug: string
    mode: 'watch' | 'listen'
    viewedAt: string
    themeId?: {
      songTitle?: string
      artistName?: string
      type?: 'OP' | 'ED'
      animeCoverImage?: string
    }
  }
}

export function HistoryCard({ item }: HistoryCardProps) {
  const { themeSlug, mode, viewedAt, themeId } = item

  return (
    <Link
      href={`/theme/${themeSlug}`}
      className="flex items-center gap-3 bg-bg-surface rounded-[16px] border border-border-subtle p-4 shadow-card interactive cursor-pointer"
    >
      <div className="w-16 h-16 flex-shrink-0 rounded-[12px] overflow-hidden bg-bg-elevated">
        {themeId?.animeCoverImage && (
          <img src={themeId.animeCoverImage} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-body font-semibold tracking-wide uppercase text-accent flex items-center gap-1 mb-1">
          {mode === 'watch' ? <Eye className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
          {themeId?.type === 'OP' ? 'Opening Theme' : 'Ending Theme'}
        </p>
        <p className="text-sm font-body font-bold text-ktext-primary truncate">{themeId?.songTitle}</p>
        <p className="text-xs font-body text-ktext-secondary italic truncate">{themeId?.artistName}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-ktext-tertiary">
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            {timeAgo(viewedAt)}
          </span>
        </div>
      </div>

      <button className="w-9 h-9 rounded-full bg-accent-container flex items-center justify-center flex-shrink-0 interactive">
        <Play className="w-4 h-4 text-accent" />
      </button>
    </Link>
  )
}