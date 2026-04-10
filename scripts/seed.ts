import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Debug: verify env is loaded
console.log('ENV CHECK - MONGODB_URI:', process.env.MONGODB_URI ? 'loaded' : 'NOT loaded')

import path from 'path'
import fs from 'fs'
import { connectDB } from '../lib/db'
import { ThemeCache, ArtistCache } from '../lib/models'

const BASE_URL = 'https://api.animethemes.moe'
const ANILIST_API = 'https://graphql.anilist.co'
const DELAY_ANIMETHEMES = 700
const DELAY_ANILIST = 1000

interface SeedProgress {
  lastPage: number
  totalProcessed: number
  failedThemes: number
  lastUpdated: string
}

function loadProgress(): SeedProgress {
  const progressPath = path.join(process.cwd(), 'scripts', 'seed-progress.json')
  if (fs.existsSync(progressPath)) {
    try {
      return JSON.parse(fs.readFileSync(progressPath, 'utf-8'))
    } catch {
      return { lastPage: 1, totalProcessed: 0, failedThemes: 0, lastUpdated: new Date().toISOString() }
    }
  }
  return { lastPage: 1, totalProcessed: 0, failedThemes: 0, lastUpdated: new Date().toISOString() }
}

function saveProgress(progress: SeedProgress): void {
  const progressPath = path.join(process.cwd(), 'scripts', 'seed-progress.json')
  try {
    const json = JSON.stringify(progress, null, 2)
    fs.writeFileSync(progressPath, json)
    console.log(`  💾 Progress saved: Page ${progress.lastPage}, Processed ${progress.totalProcessed}, Failed ${progress.failedThemes}`)
  } catch (error) {
    console.error(`💾 Failed to save progress: ${error instanceof Error ? error.message : 'unknown'}`)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getTotalThemePages(): Promise<number> {
  // Try to find total by checking a high page number
  // The API doesn't return total count, so we estimate from last valid page
  const url = new URL(`${BASE_URL}/animetheme`)
  url.searchParams.set('page[size]', '100')
  url.searchParams.set('page[number]', '1')
  
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'Kaikansen/1.0' }
  })
  if (!res.ok) throw new Error(`AT API error: ${res.status}`)
  const data = await res.json()
  const themes = data.animethemes || []
  
  // Estimate: API has around 150 pages based on docs
  return 150
}

async function fetchThemePage(page: number): Promise<any[]> {
  const url = new URL(`${BASE_URL}/animetheme`)
  url.searchParams.set('page[size]', '100')
  url.searchParams.set('page[number]', String(page))
  url.searchParams.set('include', 'animethemeentries.videos,song.artists,anime.images')
  
  console.log(`  🔗 URL: ${url.toString().substring(0, 60)}...`)
  
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'Kaikansen/1.0' }
  })
  
  if (!res.ok) {
    const errText = await res.text()
    console.log(`  ❌ API Error ${res.status}: ${errText.substring(0, 200)}`)
    throw new Error(`AT API error: ${res.status}`)
  }
  
  const data = await res.json()
  const themes = data.animethemes || []
  console.log(`  ✅ Got ${themes.length} themes from page ${page}`)
  return themes
}

interface AniListEnrichment {
  anilistId: number | null
  animeTitleEnglish: string | null
  animeTitleAlternative: string[]
  animeSeason: string | null
  animeSeasonYear: number | null
  animeCoverImage: string | null
  genres: string[]
}

async function enrichFromAniList(malId: number): Promise<AniListEnrichment | null> {
  const query = `
    query GetByMalId($malId: Int) {
      Media(idMal: $malId, type: ANIME) {
        id
        title { romaji english native }
        season
        seasonYear
        genres
        coverImage { large }
        bannerImage
      }
    }
  `
  try {
    const res = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { malId } }),
    })
    const { data } = await res.json()
    if (!data?.Media) return null
    
    const media = data.Media
    return {
      anilistId: media.id,
      animeTitleEnglish: media.title.english ?? null,
      animeTitleAlternative: [media.title.native, media.title.romaji, ...(media.synonyms ?? [])].filter(Boolean),
      animeSeason: media.season?.toUpperCase() ?? null,
      animeSeasonYear: media.seasonYear ?? null,
      animeCoverImage: media.coverImage?.large ?? null,
      genres: media.genres ?? [],
    }
  } catch {
    return null
  }
}

interface ParsedTheme {
  slug: string
  animethemesId: number
  songTitle: string
  artistName: string | null
  allArtists: string[]
  artistSlugs: string[]
  artistRoles: string[]
  anilistId: number | null
  animeTitle: string
  animeTitleEnglish: string | null
  animeTitleAlternative: string[]
  animeSeason: string | null
  animeSeasonYear: number | null
  animeCoverImage: string | null
  animeGrillImage: string | null
  type: 'OP' | 'ED'
  sequence: number
  episodesCovered: string | null
  videoSources: Array<{ resolution: number; url: string; tags: string[] }>
  videoUrl: string
  videoResolution: number | null
  syncedAt: Date
}

function parseATTheme(atTheme: any): ParsedTheme | null {
  const anime = atTheme.anime
  if (!anime) return null

  const entry = atTheme.animethemeentries?.[0]
  if (!entry) return null

  const videos = entry.videos ?? []
  const sortedVideos = [...videos].sort((a: any, b: any) => b.resolution - a.resolution)
  if (sortedVideos.length === 0) return null

  const artists = atTheme.song?.artists ?? []
  const allArtists = artists.map((a: any) => a.name)
  const artistSlugs = artists.map((a: any) => a.slug)
  const artistRoles = artists.map((a: any) => a.as ?? 'performer')

  const images = anime.images ?? []
  const atCoverImage = images.find((i: any) => i.facet === 'Large Cover')?.link ?? images.find((i: any) => i.facet === 'Small Cover')?.link ?? null
  const atGrillImage = images.find((i: any) => i.facet === 'Grill')?.link ?? null

  const videoSources = sortedVideos.map((v: any) => ({
    resolution: v.resolution,
    url: v.link,
    tags: [v.source, v.nc ? 'NC' : null].filter(Boolean) as string[],
  }))

  const animeName = anime.name ?? 'Unknown'
  const animeSlug = anime.slug ?? animeName.toLowerCase().replace(/\s+/g, '-')
  const themeType = atTheme.type?.toUpperCase() ?? 'OP'
  const themeSequence = atTheme.sequence ?? 1

  return {
    slug: `${animeSlug}-${themeType.toLowerCase()}${themeSequence}`,
    animethemesId: atTheme.id,
    songTitle: atTheme.song?.title ?? 'Unknown',
    artistName: artists[0]?.name ?? null,
    allArtists,
    artistSlugs,
    artistRoles,
    anilistId: anime.anilist_id ?? null,
    animeTitle: animeName,
    animeTitleEnglish: null,
    animeTitleAlternative: [],
    animeSeason: anime.season?.toUpperCase() ?? null,
    animeSeasonYear: anime.year ?? null,
    animeCoverImage: atCoverImage,
    animeGrillImage: atGrillImage,
    type: themeType as 'OP' | 'ED',
    sequence: themeSequence,
    episodesCovered: entry.episodes ?? null,
    videoSources,
    videoUrl: sortedVideos[0].link,
    videoResolution: sortedVideos[0].resolution,
    syncedAt: new Date(),
  }
}

async function upsertTheme(theme: ParsedTheme): Promise<void> {
  try {
    const result = await ThemeCache.findOneAndUpdate(
      { slug: theme.slug },
      { $set: theme },
      { upsert: true }
    )
    console.log(`  ✅ Saved: ${theme.songTitle} (${theme.animeTitle}) [${theme.type}]`)
  } catch (err) {
    console.log(`  ❌ Failed: ${theme.songTitle} - ${err instanceof Error ? err.message : 'unknown'}`)
    throw err
  }
}

async function upsertArtist(artistName: string, artistSlug: string, animethemesId: number): Promise<void> {
  try {
    await ArtistCache.findOneAndUpdate(
      { slug: artistSlug },
      {
        $set: {
          slug: artistSlug,
          animethemesId,
          name: artistName,
          syncedAt: new Date(),
        },
      },
      { upsert: true }
    )
    console.log(`    🎤 Artist: ${artistName}`)
  } catch (err) {
    console.log(`    ❌ Artist failed: ${artistName}`)
  }
}

async function main() {
  console.log('🌱 Starting seed script...')
  console.log('')

  try {
    await connectDB()
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error instanceof Error ? error.message : 'unknown')
    process.exit(1)
  }

  let progress = loadProgress()
  
  // If progress is empty or invalid, start fresh
  if (!progress || !progress.lastPage || progress.lastPage < 1) {
    progress = { lastPage: 1, totalProcessed: 0, failedThemes: 0, lastUpdated: new Date().toISOString() }
    console.log('🔄 Starting FRESH (no valid progress found)')
    saveProgress(progress)
  } else {
    console.log(`📋 Resuming: Page ${progress.lastPage}, Processed: ${progress.totalProcessed}, Failed: ${progress.failedThemes}`)
  }
  
  let totalPages: number
  try {
    totalPages = await getTotalThemePages()
    console.log(`📊 Total pages to process: ${totalPages}`)
  } catch (error) {
    console.error('❌ Failed to get total pages:', error instanceof Error ? error.message : 'unknown')
    process.exit(1)
  }

  console.log(`⏱️  Delays: ${DELAY_ANIMETHEMES}ms (AnimeThemes), ${DELAY_ANILIST}ms (AniList)`)
  console.log('')

  let page = progress.lastPage

  let totalProcessedInThisRun = 0

  while (page <= totalPages) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📄 PAGE ${page}/${totalPages} - Fetching from AnimeThemes API...`)

    let themes: any[]
    try {
      await sleep(DELAY_ANIMETHEMES)
      themes = await fetchThemePage(page)
      console.log(`  📥 Got ${themes.length} themes from API`)
    } catch (error) {
      console.error(`❌ Failed to fetch page ${page}: ${error instanceof Error ? error.message : 'unknown'}`)
      break
    }

    if (themes.length === 0) {
      console.log('✅ No more themes found - SEED COMPLETE!')
      break
    }

    let pageSuccessCount = 0
    let pageFailCount = 0

    console.log(`\n📝 Processing ${themes.length} themes from page ${page}...`)

    let themeIndex = 0
    for (const atTheme of themes) {
      themeIndex++
      try {
        const theme = parseATTheme(atTheme)
        if (!theme) {
          pageFailCount++
          console.log(`  ${themeIndex}. ❌ Parse failed`)
          continue
        }
        
        console.log(`  ${themeIndex}. 🎵 ${theme.songTitle} - ${theme.animeTitle} [${theme.type}]`)

        let enrichment: AniListEnrichment | null = null
        if (!theme.animeSeason) {
          if (atTheme.anime?.mal_id) {
            await sleep(DELAY_ANILIST)
            enrichment = await enrichFromAniList(atTheme.anime.mal_id)
          }
        }

        const finalTheme: ParsedTheme = {
          ...theme,
          anilistId: enrichment?.anilistId ?? theme.anilistId,
          animeTitleEnglish: enrichment?.animeTitleEnglish ?? theme.animeTitleEnglish,
          animeTitleAlternative: enrichment?.animeTitleAlternative ?? theme.animeTitleAlternative,
          animeSeason: enrichment?.animeSeason ?? theme.animeSeason,
          animeSeasonYear: enrichment?.animeSeasonYear ?? theme.animeSeasonYear,
          animeCoverImage: enrichment?.animeCoverImage ?? theme.animeCoverImage,
        }

        await upsertTheme(finalTheme)

        for (let i = 0; i < theme.allArtists.length; i++) {
          const artistName = theme.allArtists[i]
          const artistSlug = theme.artistSlugs[i] ?? artistName.toLowerCase().replace(/\s+/g, '-')
          await upsertArtist(artistName, artistSlug, theme.animethemesId)
        }

        progress.totalProcessed++
        pageSuccessCount++
      } catch (err) {
        pageFailCount++
        progress.failedThemes++
        console.error(`❌ Error processing theme ${atTheme.slug}: ${err instanceof Error ? err.message : 'unknown'}`)
      }
    }

    progress.lastPage = page
    progress.lastUpdated = new Date().toISOString()
    saveProgress(progress)

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 PAGE ${page} COMPLETE: ${pageSuccessCount} ✅ saved, ${pageFailCount} ❌ failed`)
    console.log(`   Total processed so far: ${progress.totalProcessed}`)
    console.log(`${'='.repeat(60)}\n`)
    
    progress.lastPage = page
    progress.lastUpdated = new Date().toISOString()
    saveProgress(progress)

    page++
  }

  console.log('')
  console.log('🎉🎉🎉 SEED COMPLETE! 🎉🎉🎉')
  console.log(`   ✅ Total saved: ${progress.totalProcessed} themes`)
  console.log(`   ❌ Total failed: ${progress.failedThemes} themes`)
}

main().catch((error) => {
  console.error('❌ Seed failed:', error instanceof Error ? error.message : 'unknown')
  process.exit(1)
})