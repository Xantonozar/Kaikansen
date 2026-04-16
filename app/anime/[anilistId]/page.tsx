'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Star, ChevronDown, ChevronUp, ListMusic } from 'lucide-react'
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
    <section className="border-t border-border-subtle">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 group"
      >
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-accent" />
          <h2 className="text-base font-display font-semibold text-ktext-primary">
            {title}
          </h2>
          <span className="text-xs font-mono text-ktext-tertiary bg-bg-elevated px-2 py-0.5 rounded-full">
            {themes.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-ktext-secondary group-hover:text-accent transition-colors" />
        ) : (
          <ChevronDown className="w-5 h-5 text-ktext-secondary group-hover:text-accent transition-colors" />
        )}
      </button>
      
      {isOpen && (
        <div className="space-y-1 pb-3">
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

  const { data, isLoading, error } = useAnimeThemes(anilistId)
  const animeData = data?.data as any
  const anime = animeData?.anime
  const themes = animeData?.themes ?? []
  
  const openings = themes.filter((t: any) => t.type === 'OP')
  const endings = themes.filter((t: any) => t.type === 'ED')

  if (isLoading || !anime || error) {
    return (
      <>
        <AppHeader />
        <main className="p-4">
          {isLoading ? (
            <LoadingSkeleton count={8} />
          ) : (
            <EmptyState
              title="Anime not found"
              description="This anime doesn't exist or has no themes."
            />
          )}
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Header Card */}
        <div className="bg-bg-surface rounded-2xl border border-border-subtle p-5 shadow-card">
          <div className="flex gap-4">
            {/* Cover */}
            <div className="flex-shrink-0 w-24 h-34 rounded-xl overflow-hidden shadow-card-hover">
              <img
                src={anime.coverImage || anime.animeGrillImage || '/placeholder.svg'}
                alt={anime.titleRomaji}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-display font-bold text-ktext-primary leading-tight">
                {anime.titleRomaji}
              </h1>
              {anime.titleEnglish && anime.titleEnglish !== anime.titleRomaji && (
                <p className="text-sm text-ktext-secondary mt-1 line-clamp-2">
                  {anime.titleEnglish}
                </p>
              )}
              
              <div className="flex items-center gap-3 mt-3 text-xs text-ktext-tertiary">
                {anime.format && (
                  <span className="bg-bg-elevated px-2 py-1 rounded-md">
                    {anime.format}
                  </span>
                )}
                <span className="bg-bg-elevated px-2 py-1 rounded-md">
                  {themes.length} themes
                </span>
              </div>
              
              {/* Synopsis Preview */}
              {anime.synopsis && (
                <p className="text-xs text-ktext-secondary mt-3 line-clamp-3 leading-relaxed">
                  {anime.synopsis}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Themes Sections */}
        <div className="bg-bg-surface rounded-2xl border border-border-subtle p-2 mt-4 shadow-card">
          <ToggleSection title="Openings" themes={openings} defaultOpen={true} />
          <ToggleSection title="Endings" themes={endings} defaultOpen={false} />
          
          {themes.length === 0 && (
            <div className="p-8">
              <EmptyState
                title="No themes"
                description="This anime has no opening or ending themes."
              />
            </div>
          )}
        </div>
      </main>
    </>
  )
}