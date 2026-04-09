import { Theme } from '@/types/app.types'
import Link from 'next/link'
import { Star } from 'lucide-react'

interface ThemeListRowProps {
  theme: Theme
  userRating?: number
}

export function ThemeListRow({ theme, userRating }: ThemeListRowProps) {
  return (
    <Link href={`/theme/${theme.slug}`}>
      <div className="card flex items-center gap-4 p-4 hover:shadow-md transition-shadow">
        {theme.animeCoverImage && (
          <img
            src={theme.animeCoverImage}
            alt={theme.animeTitle}
            className="h-16 w-12 rounded-md object-cover"
          />
        )}

        <div className="flex-1">
          <h3 className="font-semibold">{theme.songTitle}</h3>
          <p className="text-sm text-muted-foreground">{theme.animeTitle}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2 py-0.5">{theme.type}</span>
            {theme.allArtists[0] && (
              <span>{theme.allArtists.slice(0, 2).join(', ')}</span>
            )}
          </div>
        </div>

        {userRating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">{userRating}/10</span>
          </div>
        )}
      </div>
    </Link>
  )
}
