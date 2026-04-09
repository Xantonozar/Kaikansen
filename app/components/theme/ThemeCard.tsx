import { Theme } from '@/types/app.types'
import Link from 'next/link'

interface ThemeCardProps {
  theme: Theme
  showArtists?: boolean
}

export function ThemeCard({ theme, showArtists = true }: ThemeCardProps) {
  return (
    <Link href={`/theme/${theme.slug}`}>
      <div className="card group h-full overflow-hidden transition-shadow hover:shadow-lg">
        {theme.animeCoverImage && (
          <div className="relative h-40 w-full overflow-hidden bg-muted">
            <img
              src={theme.animeCoverImage}
              alt={theme.animeTitle || 'Anime cover'}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <span className="absolute top-2 right-2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
              {theme.type}
            </span>
          </div>
        )}

        <div className="p-3">
          <h3 className="font-semibold line-clamp-2 text-sm">{theme.songTitle}</h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
            {theme.animeTitle}
          </p>

          {showArtists && theme.allArtists.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {theme.allArtists.slice(0, 2).map((artist) => (
                <span
                  key={artist}
                  className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {artist}
                </span>
              ))}
              {theme.allArtists.length > 2 && (
                <span className="inline-block text-xs text-muted-foreground">
                  +{theme.allArtists.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
