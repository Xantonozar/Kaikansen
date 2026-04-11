import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

console.log('ENV CHECK - MONGODB_URI:', process.env.MONGODB_URI ? 'loaded' : 'NOT loaded')

import path from 'path'
import fs from 'fs'
import { connectDB } from '../lib/db'
import { ThemeCache, ArtistCache } from '../lib/models'

const BASE_URL = 'https://api.animethemes.moe'
const ANILIST_API = 'https://graphql.anilist.co'
const KITSU_API = 'https://kitsu.io/api/edge'
const DELAY_ANIMETHEMES = 700
const DELAY_ANILIST = 1000
const DELAY_KITSU = 1000

const args = process.argv.slice(2)
const startArg = args.find(a => a.startsWith('--start='))
const endArg = args.find(a => a.startsWith('--end='))
const START_PAGE = startArg ? parseInt(startArg.split('=')[1]) : 150
const END_PAGE = endArg ? parseInt(endArg.split('=')[1]) : 1
const REVERSE = true  // Search from high pages to low pages (newer anime first)
const PROGRESS_FILE = `seed-progress-${Math.max(START_PAGE, END_PAGE)}-${Math.min(START_PAGE, END_PAGE)}.json`

interface SeedProgress {
  lastPage: number
  totalProcessed: number
  failedThemes: number
  lastUpdated: string
  failedSlugs: string[]
}

function loadProgress(): SeedProgress {
  const progressPath = path.join(process.cwd(), 'scripts', PROGRESS_FILE)
  if (fs.existsSync(progressPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(progressPath, 'utf-8'))
      return { ...data, failedSlugs: data.failedSlugs || [] }
    } catch {
      return { lastPage: START_PAGE, totalProcessed: 0, failedThemes: 0, lastUpdated: new Date().toISOString(), failedSlugs: [] }
    }
  }
  return { lastPage: START_PAGE, totalProcessed: 0, failedThemes: 0, lastUpdated: new Date().toISOString(), failedSlugs: [] }
}

function saveProgress(progress: SeedProgress): void {
  const progressPath = path.join(process.cwd(), 'scripts', PROGRESS_FILE)
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
  // For reverse mode, start from high page number to find actual max
  return START_PAGE
}

async function fetchThemePage(page: number): Promise<any[]> {
  const fullIncludes = 'anime,anime.images,song,animethemeentries,animethemeentries.videos,song.artists'
  const fallbackIncludes = 'anime,song,animethemeentries,animethemeentries.videos'
  const minimalIncludes = 'anime,song'
  
  const url = new URL(`${BASE_URL}/animetheme`)
  url.searchParams.set('page[size]', '100')
  url.searchParams.set('page[number]', String(page))
  url.searchParams.set('include', fullIncludes)
  
  console.log(`  🔗 URL: ${url.toString().substring(0, 60)}...`)
  
  let res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'Kaikansen/1.0' }
  })
  
  if (res.status === 422) {
    console.log(`  ⚠️  Full includes not supported, retrying with fallback...`)
    url.searchParams.set('include', fallbackIncludes)
    res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Kaikansen/1.0' }
    })
  }
  
  if (res.status === 422) {
    console.log(`  ⚠️  Fallback includes not supported, trying minimal...`)
    url.searchParams.set('include', minimalIncludes)
    res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Kaikansen/1.0' }
    })
  }
  
  if (res.status === 422) {
    console.log(`  ⚠️  Minimal includes not supported, trying bare query...`)
    url.searchParams.delete('include')
    res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Kaikansen/1.0' }
    })
  }
  
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
  animeMediaFormat: string | null
  animeSynonyms: string[]
  animeStudios: string[]
}

async function enrichFromAniList(anilistId: number): Promise<AniListEnrichment | null> {
  const query = `
    query GetByAnilistId($anilistId: Int) {
      Media(id: $anilistId, type: ANIME) {
        id
        title { romaji english native }
        season
        seasonYear
        format
        coverImage { large }
        synonyms
        studios {
          nodes {
            studio {
              name
            }
          }
        }
      }
    }
  `
  try {
    const res = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { anilistId } }),
    })
    const { data } = await res.json()
    if (!data?.Media) return null
    
    const media = data.Media
    const studios = media.studios?.nodes?.map((n: any) => n.studio?.name).filter(Boolean) ?? []
    return {
      anilistId: media.id,
      animeTitleEnglish: media.title.english ?? null,
      animeTitleAlternative: [media.title.native, media.title.romaji, ...(media.synonyms ?? [])].filter(Boolean),
      animeSeason: media.season?.toUpperCase() ?? null,
      animeSeasonYear: media.seasonYear ?? null,
      animeCoverImage: media.coverImage?.large ?? null,
      animeMediaFormat: media.format ?? null,
      animeSynonyms: media.synonyms ?? [],
      animeStudios: studios,
    }
  } catch (error) {
    console.log(`    ❌ AniList enrichment failed: ${error instanceof Error ? error.message : 'unknown'}`)
    return null
  }
}

async function enrichFromAniListByTitle(title: string): Promise<AniListEnrichment | null> {
  const query = `
    query SearchAnime($title: String) {
      Media(search: $title, type: ANIME, limit: 1) {
        id
        title { romaji english native }
        season
        seasonYear
        format
        coverImage { large }
        synonyms
        studios {
          nodes {
            studio {
              name
            }
          }
        }
      }
    }
  `
  try {
    const res = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { title } }),
    })
    const { data } = await res.json()
    if (!data?.Media || data.Media.length === 0) return null
    
    const media = data.Media[0]
    const studios = media.studios?.nodes?.map((n: any) => n.studio?.name).filter(Boolean) ?? []
    return {
      anilistId: media.id,
      animeTitleEnglish: media.title.english ?? null,
      animeTitleAlternative: [media.title.native, media.title.romaji, ...(media.synonyms ?? [])].filter(Boolean),
      animeSeason: media.season?.toUpperCase() ?? null,
      animeSeasonYear: media.seasonYear ?? null,
      animeCoverImage: media.coverImage?.large ?? null,
      animeMediaFormat: media.format ?? null,
      animeSynonyms: media.synonyms ?? [],
      animeStudios: studios,
    }
  } catch (error) {
    console.log(`    ❌ AniList search failed: ${error instanceof Error ? error.message : 'unknown'}`)
    return null
  }
}

interface KitsuEnrichment {
  kitsuId: string | null
  anilistId: number | null
  animeTitleEnglish: string | null
  animeTitleRomaji: string | null
  animeTitleAlternative: string[]
  animeCoverImage: string | null
}

async function enrichFromKitsu(title: string): Promise<KitsuEnrichment | null> {
  try {
    const res = await fetch(
      `${KITSU_API}/anime?filter[text]=${encodeURIComponent(title)}&page[limit]=5&include=mappings`,
      { headers: { 'Accept': 'application/vnd.api+json' } }
    )
    const data = await res.json()
    if (!data?.data?.length) return null

    const anime = data.data[0].attributes
    const titles = anime.titles || {}
    const altTitles = [
      titles.en_jp,
      titles.ja_jp,
      ...(anime.abbreviatedTitles || [])
    ].filter(Boolean)

    let anilistId: number | null = null
    if (data.included) {
      const mappings = data.included.filter((i: any) => i.type === 'mappings')
      const anilistMapping = mappings.find((m: any) => m.attributes?.externalSite === 'anilist')
      if (anilistMapping) {
        anilistId = parseInt(anilistMapping.attributes.externalId, 10) || null
      }
    }

    return {
      kitsuId: anime.id || null,
      anilistId,
      animeTitleEnglish: titles.en ?? null,
      animeTitleRomaji: titles.en_jp ?? null,
      animeTitleAlternative: altTitles,
      animeCoverImage: anime.posterImage?.large ?? null,
    }
  } catch (error) {
    console.log(`    ❌ Kitsu enrichment failed: ${error instanceof Error ? error.message : 'unknown'}`)
    return null
  }
}

interface VideoSource {
  resolution: number
  url: string
  source: string | null
  nc: boolean
  lyrics: boolean
  subbed: boolean
  overlap: string | null
}

interface Entry {
  version: number
  episodes: string | null
  isNsfw: boolean
  isSpoiler: boolean
  notes: string | null
  videos: VideoSource[]
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
  animeSmallCoverImage: string | null
  animeGrillImage: string | null
  animeSynopsis: string | null
  animeMediaFormat: string | null
  animeSeries: string[]
  animeStudios: string[]
  animeSynonyms: string[]
  type: 'OP' | 'ED'
  sequence: number
  entries: Entry[]
  videoUrl: string
  videoResolution: number | null
  videoSource: string | null
  hasLyrics: boolean
  isCreditless: boolean
  overlapNote: string | null
  syncedAt: Date
}

function parseATTheme(atTheme: any): ParsedTheme | null {
  const anime = atTheme.anime
  if (!anime) return null

  const entries = atTheme.animethemeentries ?? []
  if (entries.length === 0) return null

  const artists = atTheme.song?.artists ?? []
  const allArtists = artists.map((a: any) => a.name)
  const artistSlugs = artists.map((a: any) => a.slug)
  const artistRoles = artists.map((a: any) => a.as ?? 'performer')

  const images = anime.images ?? []
  const atCoverImage = images.find((i: any) => i.facet === 'Large Cover')?.link ?? images.find((i: any) => i.facet === 'Small Cover')?.link ?? null
  const atSmallCoverImage = images.find((i: any) => i.facet === 'Small Cover')?.link ?? null
  const atGrillImage = images.find((i: any) => i.facet === 'Grill')?.link ?? null

  const animeSeries: string[] = []
  const animeStudios: string[] = []
  const animeSynonyms: string[] = []

  const anilistIdFromAt = (anime.anilistid as any) ? parseInt(String(anime.anilistid), 10) : null

  const parsedEntries: Entry[] = entries.map((entry: any) => {
    const videos = entry.videos ?? []
    const sortedVideos = [...videos].sort((a: any, b: any) => b.resolution - a.resolution)
    
    const videoSources: VideoSource[] = sortedVideos.map((v: any) => ({
      resolution: v.resolution,
      url: v.link,
      source: v.source ?? null,
      nc: v.nc ?? false,
      lyrics: v.lyrics ?? false,
      subbed: v.subbed ?? false,
      overlap: v.overlap ?? null,
    }))

    return {
      version: entry.version ?? 1,
      episodes: entry.episodes ?? null,
      isNsfw: entry.nsfw ?? false,
      isSpoiler: entry.spoiler ?? false,
      notes: entry.notes ?? null,
      videos: videoSources,
    }
  })

  const firstEntry = parsedEntries[0]
  const firstVideo = firstEntry?.videos?.[0]

  const animeName = anime.name ?? 'Unknown'
  const animeSlug = anime.slug ?? animeName.toLowerCase().replace(/\s+/g, '-')
  const themeType = atTheme.type?.toUpperCase() ?? 'OP'
  const themeSequence = atTheme.sequence ?? 1

  let overlapNote: string | null = null
  if (themeType === 'ED' && firstVideo?.overlap === 'Over') {
    overlapNote = 'Plays over episode'
  }

  const parsedTheme = {
    slug: `${animeSlug}-${themeType.toLowerCase()}${themeSequence}`,
    animethemesId: atTheme.id,
    songTitle: atTheme.song?.title ?? 'Unknown',
    artistName: artists[0]?.name ?? null,
    allArtists,
    artistSlugs,
    artistRoles,
    anilistId: anilistIdFromAt,
    animeTitle: animeName,
    animeTitleEnglish: null,
    animeTitleAlternative: [],
    animeSeason: anime.season?.toUpperCase() ?? null,
    animeSeasonYear: anime.year ?? null,
    animeCoverImage: atCoverImage,
    animeSmallCoverImage: atSmallCoverImage,
    animeGrillImage: atGrillImage,
    animeSynopsis: anime.synopsis ?? null,
    animeMediaFormat: anime.media_format ?? null,
    animeSeries,
    animeStudios,
    animeSynonyms,
    type: themeType as 'OP' | 'ED',
    sequence: themeSequence,
    entries: parsedEntries,
    videoUrl: firstVideo?.url ?? '',
    videoResolution: firstVideo?.resolution ?? null,
    videoSource: firstVideo?.source ?? null,
    hasLyrics: firstVideo?.lyrics ?? false,
    isCreditless: firstVideo?.nc ?? false,
    overlapNote,
    syncedAt: new Date(),
  }

  console.log(`    📋 animeTitle: ${parsedTheme.animeTitle}`)
  console.log(`    📋 animeTitleEnglish: ${parsedTheme.animeTitleEnglish || 'null'}`)
  console.log(`    📋 anilistId: ${parsedTheme.anilistId || 'null'}`)
  console.log(`    📋 animeSeason: ${parsedTheme.animeSeason || 'null'}`)
  console.log(`    📋 animeSeasonYear: ${parsedTheme.animeSeasonYear || 'null'}`)
  console.log(`    📋 animeMediaFormat: ${parsedTheme.animeMediaFormat || 'null'}`)
  console.log(`    📋 animeCoverImage: ${parsedTheme.animeCoverImage ? 'present' : 'null'}`)
  console.log(`    📋 animeSmallCoverImage: ${parsedTheme.animeSmallCoverImage ? 'present' : 'null'}`)
  console.log(`    📋 animeGrillImage: ${parsedTheme.animeGrillImage ? 'present' : 'null'}`)
  console.log(`    📋 animeSynopsis: ${parsedTheme.animeSynopsis ? 'present' : 'null'}`)
  console.log(`    📋 animeSeries: ${parsedTheme.animeSeries.length} items`, parsedTheme.animeSeries.slice(0, 3))
  console.log(`    📋 animeStudios: ${parsedTheme.animeStudios.length} items`, parsedTheme.animeStudios.slice(0, 3))
  console.log(`    📋 animeSynonyms: ${parsedTheme.animeSynonyms.length} items`, parsedTheme.animeSynonyms.slice(0, 3))
  console.log(`    📋 animeTitleAlternative: ${parsedTheme.animeTitleAlternative.length} items`)

  return parsedTheme
}

async function upsertTheme(theme: ParsedTheme): Promise<void> {
  try {
    // Use animethemesId as unique key to prevent data loss during parallel seed runs
    await ThemeCache.findOneAndUpdate(
      { animethemesId: theme.animethemesId },
      { $set: theme },
      { upsert: true }
    )
    console.log(`  ✅ Saved: ${theme.songTitle} (${theme.animeTitle}) [${theme.type}]`)
  } catch (err) {
    // Ignore duplicate key errors - theme already exists with same animethemesId
    const errMsg = err instanceof Error ? err.message : ''
    if (errMsg.includes('E11000') || errMsg.includes('duplicate key')) {
      console.log(`  ⏭️  Already exists: ${theme.songTitle} (${theme.animeTitle}) [${theme.type}]`)
      return
    }
    console.log(`  ❌ Failed: ${theme.songTitle} - ${errMsg || 'unknown'}`)
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
  const args = process.argv.slice(2)
  const startArg = args.find(a => a.startsWith('--start='))
  const endArg = args.find(a => a.startsWith('--end='))
  const startPage = startArg ? parseInt(startArg.split('=')[1]) : 1
  const endPage = endArg ? parseInt(endArg.split('=')[1]) : 150

  const progressFileName = `seed-progress-${startPage}-${endPage}.json`
  console.log(`🌱 Starting seed script (Pages ${startPage} to ${endPage})...`)
  console.log(`📁 Progress file: ${progressFileName}`)
  console.log('')

  try {
    await connectDB()
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error instanceof Error ? error.message : 'unknown')
    process.exit(1)
  }

  const progressPath = path.join(process.cwd(), 'scripts', progressFileName)
  let progress: SeedProgress
  
  if (!fs.existsSync(progressPath)) {
    console.log('🗑️  Clearing ThemeCache database for fresh start...')
    await ThemeCache.deleteMany({})
    console.log('🗑️  Cleared ThemeCache')
    progress = { lastPage: startPage, totalProcessed: 0, failedThemes: 0, lastUpdated: new Date().toISOString(), failedSlugs: [] }
    saveProgress(progress)
  } else {
    try {
      const data = JSON.parse(fs.readFileSync(progressPath, 'utf-8'))
      progress = { ...data, failedSlugs: data.failedSlugs || [] }
      console.log(`📋 Resuming: Page ${progress.lastPage}, Processed: ${progress.totalProcessed}, Failed: ${progress.failedThemes}`)
    } catch {
      progress = { lastPage: startPage, totalProcessed: 0, failedThemes: 0, lastUpdated: new Date().toISOString(), failedSlugs: [] }
    }
  }
  
  if (!progress || !progress.lastPage || progress.lastPage < startPage) {
    progress = { lastPage: startPage, totalProcessed: progress?.totalProcessed || 0, failedThemes: progress?.failedThemes || 0, lastUpdated: new Date().toISOString(), failedSlugs: progress?.failedSlugs || [] }
    saveProgress(progress)
  } else {
    if (!progress.failedSlugs) progress.failedSlugs = []
  }
  
  if (!progress || !progress.lastPage || progress.lastPage < 1) {
    progress = { lastPage: 1, totalProcessed: 0, failedThemes: 0, lastUpdated: new Date().toISOString(), failedSlugs: [] }
    console.log('🔄 Starting FRESH (no valid progress found)')
    saveProgress(progress)
  } else {
    if (!progress.failedSlugs) progress.failedSlugs = []
    console.log(`📋 Resuming: Page ${progress.lastPage}, Processed: ${progress.totalProcessed}, Failed: ${progress.failedThemes}`)
  }
  
  const totalPages = REVERSE ? START_PAGE : END_PAGE

  console.log(`⏱️  Delays: ${DELAY_ANIMETHEMES}ms (AnimeThemes), ${DELAY_ANILIST}ms (AniList)`)
  console.log('')

  let page = REVERSE 
    ? Math.max(progress.lastPage > 0 ? progress.lastPage : START_PAGE, END_PAGE)
    : Math.max(progress.lastPage, START_PAGE)
  let totalProcessedInThisRun = 0

  const pageCondition = REVERSE ? (page >= END_PAGE) : (page <= totalPages)
  
  while (pageCondition) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📄 PAGE ${page}/${REVERSE ? 'reverse' : totalPages} - Fetching from AnimeThemes API...`)

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
          progress.failedThemes++
          const parseSlug = atTheme?.slug || atTheme?.anime?.name || `parse-fail-${page}-${themeIndex}`
          progress.failedSlugs.push(parseSlug)
          console.log(`  ${themeIndex}. ❌ Parse failed - keys:`, atTheme ? Object.keys(atTheme).join(',') : 'no data')
          console.log(`      anime keys:`, atTheme?.anime ? Object.keys(atTheme.anime).join(',') : 'no anime')
          continue
        }
        
        console.log(`  ${themeIndex}. 🎵 ${theme.songTitle} - ${theme.animeTitle} [${theme.type}]`)

        let enrichment: AniListEnrichment | null = null
        let kitsuEnrichment: KitsuEnrichment | null = null
        
        // ALWAYS try AniList enrichment to get animeTitleEnglish and other fields
        // Try by anilistId first, then by title search
        if (theme.anilistId) {
          await sleep(DELAY_ANILIST)
          enrichment = await enrichFromAniList(theme.anilistId)
        } else {
          // Try search by anime title to get anilistId
          await sleep(DELAY_ANILIST)
          enrichment = await enrichFromAniListByTitle(theme.animeTitle)
        }

        // If AniList didn't provide English title, try Kitsu as fallback
        if (!enrichment?.animeTitleEnglish) {
          await sleep(DELAY_KITSU)
          kitsuEnrichment = await enrichFromKitsu(theme.animeTitle)
        }

        const finalTheme: ParsedTheme = {
          ...theme,
          // anilistId: from AniList OR from Kitsu mappings
          anilistId: enrichment?.anilistId ?? kitsuEnrichment?.anilistId ?? theme.anilistId,
          // Priority: AniList English → Kitsu English → Kitsu Romaji → AniList Romaji → Original
          animeTitleEnglish: enrichment?.animeTitleEnglish 
            ?? kitsuEnrichment?.animeTitleEnglish 
            ?? kitsuEnrichment?.animeTitleRomaji 
            ?? enrichment?.animeTitleAlternative?.[1] // AniList romaji from alt titles
            ?? theme.animeTitleEnglish,
          // Priority: AniList alternatives → Kitsu alternatives → original
          animeTitleAlternative: enrichment?.animeTitleAlternative?.length
            ? enrichment.animeTitleAlternative
            : kitsuEnrichment?.animeTitleAlternative?.length
              ? kitsuEnrichment.animeTitleAlternative
              : theme.animeTitleAlternative,
          animeSeason: enrichment?.animeSeason ?? theme.animeSeason,
          animeSeasonYear: enrichment?.animeSeasonYear ?? theme.animeSeasonYear,
          // Priority: AniList cover → Kitsu cover → original
          animeCoverImage: enrichment?.animeCoverImage 
            ?? kitsuEnrichment?.animeCoverImage 
            ?? theme.animeCoverImage,
          animeMediaFormat: enrichment?.animeMediaFormat ?? theme.animeMediaFormat,
          animeStudios: enrichment?.animeStudios?.length ? enrichment.animeStudios : theme.animeStudios,
          animeSynonyms: enrichment?.animeSynonyms?.length ? enrichment.animeSynonyms : theme.animeSynonyms,
        }

        if (enrichment) {
          console.log(`    📋 [ANILIST] anilistId: ${enrichment.anilistId || 'null'}`)
          console.log(`    📋 [ANILIST] animeTitleEnglish: ${enrichment.animeTitleEnglish || 'null'}`)
          console.log(`    📋 [ANILIST] animeMediaFormat: ${enrichment.animeMediaFormat || 'null'}`)
          console.log(`    📋 [ANILIST] animeStudios: ${enrichment.animeStudios.length} items`, enrichment.animeStudios.slice(0, 3))
          console.log(`    📋 [ANILIST] animeSynonyms: ${enrichment.animeSynonyms.length} items`, enrichment.animeSynonyms.slice(0, 3))
        }
        if (kitsuEnrichment) {
          console.log(`    📋 [KITSU] anilistId: ${kitsuEnrichment.anilistId || 'null'}`)
          console.log(`    📋 [KITSU] animeTitleEnglish: ${kitsuEnrichment.animeTitleEnglish || 'null'}`)
          console.log(`    📋 [KITSU] animeTitleRomaji: ${kitsuEnrichment.animeTitleRomaji || 'null'}`)
          console.log(`    📋 [KITSU] animeTitleAlternative: ${kitsuEnrichment.animeTitleAlternative.length} items`, kitsuEnrichment.animeTitleAlternative.slice(0, 3))
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
        const errorSlug = atTheme?.slug || atTheme?.anime?.name || `unknown-${page}-${themeIndex}`
        progress.failedSlugs.push(errorSlug)
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

    if (REVERSE) {
      page--
    } else {
      page++
    }
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