import { connectDB } from '../lib/db'
import { ThemeCache, ArtistCache } from '../lib/models'
import fs from 'fs'
import path from 'path'

const ANIMETHEMES_API = 'https://api.animethemes.me'
const ANILIST_API = 'https://graphql.anilist.co'
const RATE_LIMIT_ANIMETHEMES = 700
const RATE_LIMIT_ANILIST = 1000

interface SeedProgress {
  lastPage: number
  totalProcessed: number
  lastUpdated: string
}

function loadProgress(): SeedProgress {
  const progressPath = path.join(process.cwd(), 'scripts', 'seed-progress.json')
  if (fs.existsSync(progressPath)) {
    return JSON.parse(fs.readFileSync(progressPath, 'utf-8'))
  }
  return { lastPage: 1, totalProcessed: 0, lastUpdated: new Date().toISOString() }
}

function saveProgress(progress: SeedProgress): void {
  const progressPath = path.join(process.cwd(), 'scripts', 'seed-progress.json')
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2))
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchThemesPage(page: number): Promise<any[]> {
  const url = new URL(`${ANIMETHEMES_API}/api/v4/themes`)
  url.searchParams.set('page[number]', page.toString())
  url.searchParams.set('page[size]', '100')
  url.searchParams.set('include', 'anime,songs.artists')
  url.searchParams.set('fields[anime]', 'mal_id,anilist_id,name,year,season')
  url.searchParams.set('fields[songs]', 'title')
  url.searchParams.set('fields[artists]', 'name')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`AnimeThemes API error: ${res.status}`)

  const data = await res.json()
  return data.data || []
}

async function fetchAniListData(
  title: string
): Promise<{ description: string; coverImage: string }> {
  const query = `
    query {
      Media(search: "${title.replace(/"/g, '\\"')}", type: ANIME) {
        description
        coverImage { medium }
      }
    }
  `

  const res = await fetch(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) return { description: '', coverImage: '' }

  const data = await res.json()
  const media = data.data?.Media

  return {
    description: media?.description || '',
    coverImage: media?.coverImage?.medium || '',
  }
}

async function main() {
  try {
    console.log('🌱 Starting seed script...')
    await connectDB()
    console.log('✅ Connected to MongoDB')

    const progress = loadProgress()
    console.log(`📊 Resuming from page ${progress.lastPage}`)
    console.log(`⏱️  Processing started. This will take a while...`)
    console.log('   AnimeThemes queries: 700ms delay')
    console.log('   AniList queries: 1000ms delay')
    console.log('')

    let page = progress.lastPage
    const maxPages = 150

    while (page <= maxPages) {
      console.log(`📄 Fetching page ${page}/${maxPages}...`)
      await sleep(RATE_LIMIT_ANIMETHEMES)

      const themes = await fetchThemesPage(page)
      if (!themes.length) {
        console.log('✅ No more themes found, seeding complete!')
        break
      }

      for (const theme of themes) {
        try {
          if (!theme.anime?.anilist_id) continue

          await sleep(RATE_LIMIT_ANILIST)
          const anilistData = await fetchAniListData(theme.anime.name)

          await ThemeCache.updateOne(
            { slug: theme.slug },
            {
              $set: {
                slug: theme.slug,
                songTitle: theme.songs?.[0]?.title || theme.name || '',
                artistName: theme.songs?.[0]?.artists?.[0]?.name || '',
                allArtists: theme.songs?.[0]?.artists?.map((a: any) => a.name) || [],
                animeTitle: theme.anime.name,
                animeTitleAlternative: '',
                animeAniListId: theme.anime.anilist_id,
                animeMalId: theme.anime.mal_id || 0,
                type: theme.type || 'OP',
                season: theme.anime.season || '',
                year: theme.anime.year || new Date().getFullYear(),
                coverImage: anilistData.coverImage,
                description: anilistData.description,
                updatedAt: new Date(),
              },
            },
            { upsert: true }
          )

          // Upsert artist
          if (theme.songs?.[0]?.artists?.[0]?.name) {
            await ArtistCache.updateOne(
              { slug: theme.songs[0].artists[0].name.toLowerCase().replace(/\s+/g, '-') },
              {
                $set: {
                  slug: theme.songs[0].artists[0].name.toLowerCase().replace(/\s+/g, '-'),
                  name: theme.songs[0].artists[0].name,
                  updatedAt: new Date(),
                },
              },
              { upsert: true }
            )
          }

          progress.totalProcessed++
        } catch (err) {
          console.warn(`⚠️  Skipped theme ${theme.slug}:`, err)
        }
      }

      progress.lastPage = page
      progress.lastUpdated = new Date().toISOString()
      saveProgress(progress)

      console.log(`✅ Page ${page} processed. Total: ${progress.totalProcessed}`)
      page++
    }

    console.log(`🎉 Seed complete! Processed ${progress.totalProcessed} themes`)
  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }
}

main()
