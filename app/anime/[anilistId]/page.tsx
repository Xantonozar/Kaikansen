'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Star, ChevronDown, ChevronUp, Play } from 'lucide-react'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { useAnimeThemes } from '@/lib/api/themes'

interface ToggleSectionProps {
  title: string
  themes: any[]
  defaultOpen?: boolean
}

function ToggleSection({ title, themes, defaultOpen = true }: ToggleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (themes.length === 0) return null

  return (
    <section className="border-t border-border-default pt-4 mt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2"
      >
        <h2 className="text-lg font-display font-bold text-ktext-primary">
          {title} ({themes.length})
        </h2>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-ktext-secondary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-ktext-secondary" />
        )}
      </button>
      
      {isOpen && (
        <div className="space-y-2 mt-3">
          {themes.map((theme: any) => (
            <ThemeListRow key={theme.slug} theme={theme} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function AnimePage() {
  const params = useParams()
  const anilistId = parseInt(params.anilistId as string)

  const { data, isLoading } = useAnimeThemes(anilistId)
  const anime = data?.data as any
  const themes = anime?.themes ?? []
  
  const openings = themes.filter((t: any) => t.type === 'OP')
  const endings = themes.filter((t: any) => t.type === 'ED')

  if (isLoading) {
    return (
      <>
        <AppHeader />
        <main className="p-4">
          <LoadingSkeleton count={12} />
        </main>
      </>
    )
  }

  if (!anime) {
    return (
      <>
        <AppHeader />
        <main className="p-4">
          <EmptyState
            title="Anime not found"
            description="This anime doesn't exist or has no themes."
          />
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="max-w-4xl mx-auto">
        {/* Hero Banner Image */}
        <div className="relative h-64 w-full">
          <img
            src={anime.bannerImage || anime.animeGrillImage || '/placeholder.svg'}
            alt={`${anime.titleRomaji} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent" />
        </div>

        {/* Cover Image + Title Section */}
        <div className="px-4 -mt-16 relative z-10">
          <div className="flex gap-4">
            {/* Cover Image */}
            <div className="flex-shrink-0 w-28 h-40 rounded-lg overflow-hidden shadow-modal mt-2">
              <img
                src={anime.coverImage || anime.animeGrillImage || '/placeholder.svg'}
                alt={`${anime.titleRomaji} cover`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Title + Meta */}
            <div className="flex-1 min-w-0 pt-12">
              <h1 className="text-2xl font-display font-bold text-ktext-primary truncate">
                {anime.titleRomaji}
              </h1>
              {anime.titleEnglish && anime.titleEnglish !== anime.titleRomaji && (
                <p className="text-sm text-ktext-secondary truncate mt-1">
                  {anime.titleEnglish}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-ktext-secondary">
                {anime.averageScore && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{anime.averageScore}</span>
                  </div>
                )}
                {anime.totalEpisodes && (
                  <span>{anime.totalEpisodes} episodes</span>
                )}
                {anime.status && (
                  <span>{anime.status}</span>
                )}
                {anime.format && (
                  <span>{anime.format}</span>
                )}
              </div>
              
              {/* Genre tags */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {anime.genres.map((genre: string) => (
                    <span key={genre} className="text-[10px] font-mono font-semibold px-2 py-1 rounded-full bg-accent/20 text-accent">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Synopsis */}
        {anime.synopsis && (
          <div className="px-4 mt-6">
            <h3 className="text-sm font-semibold text-ktext-secondary uppercase tracking-wider mb-2">
              Synopsis
            </h3>
            <p className="text-sm text-ktext-primary leading-relaxed whitespace-pre-wrap">
              {anime.synopsis}
            </p>
          </div>
        )}

        {/* Openings & Endings */}
        <div className="px-4 mt-6 pb-8">
          <ToggleSection title="Openings" themes={openings} defaultOpen={true} />
          <ToggleSection title="Endings" themes={endings} defaultOpen={false} />
          
          {themes.length === 0 && (
            <EmptyState
              title="No themes"
              description="This anime has no opening or ending themes."
            />
          )}
        </div>
      </main>
    </>
  )
}