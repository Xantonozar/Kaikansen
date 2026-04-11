import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import path from 'path'
import fs from 'fs'
import { connectDB } from '../lib/db'
import { ThemeCache, ArtistCache } from '../lib/models'

// ─────────────────────────────────────────────
// CLI ARGS
// Each parallel instance MUST have unique start/end
// Usage:
//   npx ts-node seed.ts --start=1   --end=30
//   npx ts-node seed.ts --start=31  --end=60
//   npx ts-node seed.ts --start=61  --end=90
//   npx ts-node seed.ts --start=91  --end=120
//   npx ts-node seed.ts --start=121 --end=142
// Retry failed:
//   npx ts-node seed.ts --start=1 --end=30 --retry-failed
// ─────────────────────────────────────────────

const cliArgs = process.argv.slice(2)
const startArg = cliArgs.find(a => a.startsWith('--start='))
const endArg   = cliArgs.find(a => a.startsWith('--end='))
const retryArg = cliArgs.includes('--retry-failed')

if (!startArg || !endArg) {
  console.error('❌ Missing args. Usage: npx ts-node seed.ts --start=1 --end=30')
  process.exit(1)
}

const START_PAGE = parseInt(startArg.split('=')[1])
const END_PAGE   = parseInt(endArg.split('=')[1])

if (isNaN(START_PAGE) || isNaN(END_PAGE) || START_PAGE < 1 || END_PAGE < START_PAGE) {
  console.error(`❌ Invalid range: start=${START_PAGE} end=${END_PAGE}`)
  process.exit(1)
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const BASE_URL    = 'https://api.animethemes.moe'
const ANILIST_API = 'https://graphql.anilist.co'
const KITSU_API   = 'https://kitsu.io/api/edge'
const DELAY_AT    = 700
const DELAY_AL    = 1000
const DELAY_KT    = 1000
const PAGE_SIZE   = 100

// ─────────────────────────────────────────────
// FILE PATHS — unique per run tag so parallel
// instances NEVER share or overwrite each other
// e.g. start=1 end=30 → tag = p1-p30
//      start=31 end=60 → tag = p31-p60
// ─────────────────────────────────────────────

const SCRIPTS_DIR   = path.join(process.cwd(), 'scripts')
const RUN_TAG       = `p${START_PAGE}-p${END_PAGE}`
const SLUG_FILE     = path.join(SCRIPTS_DIR, `slugs-${RUN_TAG}.json`)
const PROGRESS_FILE = path.join(SCRIPTS_DIR, `progress-${RUN_TAG}.json`)
const LOG_FILE      = path.join(SCRIPTS_DIR, `seed-${RUN_TAG}.log`)

// ─────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────

interface SlugFile {
  runTag: string
  startPage: number
  endPage: number
  totalSlugs: number
  collectedAt: string
  slugs: string[]       // all slugs collected
  processed: string[]   // successfully saved to DB
  failed: string[]      // failed after all retries
}

interface ProgressFile {
  runTag: string
  startPage: number
  endPage: number
  totalProcessed: number
  totalFailed: number
  lastSlug: string
  lastUpdated: string
  phase: 'collecting' | 'processing' | 'retrying' | 'done'
}

interface SourcesFetched {
  at_level  : 'full' | 'basic' | 'bare' | 'none'
  anilist   : 'by_id' | 'by_malid' | 'by_title' | 'none'
  kitsu     : 'by_malid' | 'by_title' | 'none'
}

interface VideoSource {
  resolution : number | null
  url        : string | null
  audioUrl   : string | null
  audioSize  : number | null
  source     : string | null
  nc         : boolean
  lyrics     : boolean
  subbed     : boolean
  uncen      : boolean
  overlap    : string | null
  size       : number | null
  tags       : string | null
  basename   : string | null
}

interface Entry {
  version  : number
  episodes : string | null
  isNsfw   : boolean
  isSpoiler: boolean
  notes    : string | null
  videos   : VideoSource[]
}

interface ParsedTheme {
  animethemesThemeId : number
  slug               : string
  type               : 'OP' | 'ED' | 'IN'
  sequence           : number
  songTitle          : string
  allArtists         : string[]
  artistSlugs        : string[]
  artistRoles        : string[]
  entries            : Entry[]
  overlapNote        : string | null
}

interface ParsedAnime {
  animeSlug              : string
  animethemesId          : number
  animeTitle             : string
  animeTitleEnglish      : string | null
  animeTitleRomaji       : string | null
  animeTitleNative       : string | null
  animeTitleAlternative  : string[]
  animeSeason            : string | null
  animeSeasonYear        : number | null
  animeCoverImage        : string | null
  animeSmallCoverImage   : string | null
  animeBannerImage       : string | null
  animeGrillImage        : string | null
  animeSynopsis          : string | null
  animeMediaFormat       : string | null
  animeSeries            : { id: number; name: string; slug: string }[]
  animeStudios           : string[]
  animeSynonyms          : string[]
  malId                  : number | null
  anilistId              : number | null
  kitsuId                : string | null
  themes                 : ParsedTheme[]
  sourcesFetched         : SourcesFetched
  syncedAt               : Date
}

interface AniListData {
  anilistId            : number | null
  animeTitleEnglish    : string | null
  animeTitleRomaji     : string | null
  animeTitleNative     : string | null
  animeTitleAlternative: string[]
  animeSeason          : string | null
  animeSeasonYear      : number | null
  animeCoverImage      : string | null
  animeMediaFormat     : string | null
  animeSynonyms        : string[]
  animeStudios         : string[]
}

interface KitsuData {
  kitsuId              : string | null
  anilistId            : number | null
  malId                : number | null
  animeTitleEnglish    : string | null
  animeTitleRomaji     : string | null
  animeTitleNative     : string | null
  animeTitleAlternative: string[]
  animeCoverImage      : string | null
  animeBannerImage     : string | null
}

// ─────────────────────────────────────────────
// LOGGING — simple messages for non-tech users
// ─────────────────────────────────────────────

let logStream: fs.WriteStream

function initLog() {
  logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' })
}

function log(msg: string) {
  const ts   = new Date().toISOString().replace('T', ' ').substring(0, 19)
  const line = `[${ts}] [${RUN_TAG}] ${msg}`
  console.log(line)
  logStream?.write(line + '\n')
}

function div(char = '─', len = 65) {
  const line = char.repeat(len)
  console.log(line)
  logStream?.write(line + '\n')
}

function logPhase(label: string) {
  div('═')
  log(`🚀 ${label}`)
  div('═')
}

function logPageBanner(page: number) {
  const done  = page - START_PAGE + 1
  const total = END_PAGE - START_PAGE + 1
  div()
  log(`📄 Page ${page}/${END_PAGE} [${done} of ${total}]`)
  div()
}

function logAnimeStart(index: number, total: number, slug: string) {
  log(`\n🎌 [${index}/${total}] ${slug}`)
}

function logAnimeEnd(success: boolean, processed: number, failed: number) {
  const icon = success ? '✅' : '❌'
  log(`   ${icon} Total: ${processed} done, ${failed} failed`)
}

function logATFetch(level: string) {
  log(`   📡 Got anime info from AnimeThemes (${level} mode)`)
}

function logAnilistFetch(method: string) {
  log(`   🔍 Found extra info via AniList (${method})`)
}

function logKitsuFetch(method: string) {
  log(`   🔄 ${method}`)
}

function logNoEnrichment() {
  log(`   ⚠️  No extra info found from AniList or Kitsu`)
}

function logAnimeBasicInfo(a: ParsedAnime) {
  log(`   📝 ${a.animeTitle} | ${a.animeTitleEnglish ?? '—'} | ${a.animeSeason ?? ''} ${a.animeSeasonYear ?? ''}`)
}

function logIds(a: ParsedAnime) {
  const mal = a.malId ?? '—'
  const al = a.anilistId ?? '—'
  log(`   🆔 MAL: ${mal} | AniList: ${al}`)
}

function logThemesCount(themes: ParsedTheme[]) {
  log(`   🎬 Found ${themes.length} theme(s):`)
  for (const t of themes) {
    const artists = t.allArtists.join(', ') || '—'
    const videos = t.entries.reduce((n, e) => n + e.videos.length, 0)
    log(`      ${t.type}${t.sequence}: "${t.songTitle}" — ${artists} (${videos} videos)`)
  }
}

// ─────────────────────────────────────────────
// FILE HELPERS
// ─────────────────────────────────────────────

function ensureDir() {
  if (!fs.existsSync(SCRIPTS_DIR)) fs.mkdirSync(SCRIPTS_DIR, { recursive: true })
}

function readSlugFile(): SlugFile | null {
  try {
    if (!fs.existsSync(SLUG_FILE)) return null
    return JSON.parse(fs.readFileSync(SLUG_FILE, 'utf-8'))
  } catch { return null }
}

function writeSlugFile(data: SlugFile) {
  fs.writeFileSync(SLUG_FILE, JSON.stringify(data, null, 2))
}

function readProgress(): ProgressFile | null {
  try {
    if (!fs.existsSync(PROGRESS_FILE)) return null
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
  } catch { return null }
}

function writeProgress(data: ProgressFile) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2))
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

// ─────────────────────────────────────────────
// PHASE 1 — COLLECT SLUGS
// Fetches only slug field — very lightweight
// Saves after every page so crash-safe
// ─────────────────────────────────────────────

async function collectSlugs(): Promise<SlugFile> {
  logPhase('Phase 1: Collecting anime list')

  // Resume if slug file already exists
  const existing = readSlugFile()
  if (existing && existing.slugs.length > 0) {
    log(`✅ Already collected ${existing.slugs.length} anime — skipping`)
    return existing
  }

  log(`📥 Starting from page ${START_PAGE} to ${END_PAGE}...`)

  const slugFile: SlugFile = {
    runTag    : RUN_TAG,
    startPage : START_PAGE,
    endPage   : END_PAGE,
    totalSlugs: 0,
    collectedAt: new Date().toISOString(),
    slugs     : [],
    processed : [],
    failed    : [],
  }

  const totalPages = END_PAGE - START_PAGE + 1

  for (let page = START_PAGE; page <= END_PAGE; page++) {
    const done = page - START_PAGE + 1
    logPageBanner(page)

    try {
      await sleep(DELAY_AT)

      // Only fetch slug field — minimal payload
      const url = `${BASE_URL}/anime?page[size]=${PAGE_SIZE}&page[number]=${page}&fields[anime]=slug`
      const res = await fetch(url, { headers: { 'User-Agent': 'AnimeSeeder/1.0' } })

      if (!res.ok) {
        log(`⚠️  Page ${page} returned ${res.status} — skipping`)
        continue
      }

      const data   = await res.json()
      const slugs  = (data.anime ?? []).map((a: any) => a.slug).filter(Boolean) as string[]
      const isLast = !data.links?.next

      slugFile.slugs.push(...slugs)
      slugFile.totalSlugs = slugFile.slugs.length

      // ← Save after EVERY page (crash protection)
      writeSlugFile(slugFile)

      log(`✅ Page ${done}/${totalPages}: got ${slugs.length} anime (total: ${slugFile.slugs.length})`)

      if (isLast) {
        log(`📌 Reached last page — stopping collection`)
        break
      }

    } catch (err) {
      log(`❌ Page ${page} failed: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  slugFile.collectedAt = new Date().toISOString()
  writeSlugFile(slugFile)

  div('═')
  log(`✅ Collection complete: ${slugFile.slugs.length} anime collected`)
  div('═')

  return slugFile
}

// ─────────────────────────────────────────────
// ANIMETHEMES — fetch with fallback chain
// ─────────────────────────────────────────────

const AT_INCLUDES = [
  {
    level  : 'full' as const,
    include: 'animethemes.animethemeentries.videos.audio,animethemes.song.artists,animethemes.group,animesynonyms,images,resources,series,studios',
  },
  {
    level  : 'basic' as const,
    include: 'animethemes.animethemeentries.videos,animethemes.song.artists,images,series,studios',
  },
  {
    level  : 'bare' as const,
    include: 'animethemes.animethemeentries.videos,animethemes.song.artists',
  },
]

async function fetchFromAT(slug: string): Promise<{ data: any; level: 'full' | 'basic' | 'bare' } | null> {
  for (const { level, include } of AT_INCLUDES) {
    try {
      const url = `${BASE_URL}/anime/${slug}?include=${encodeURIComponent(include)}`
      const res = await fetch(url, { headers: { 'User-Agent': 'AnimeSeeder/1.0' } })

      if (res.status === 404) { log(`   ⚠️  Not found in database`); return null }
      if (res.status === 422) { log(`   ⚠️  Trying simpler mode...`); continue }
      if (!res.ok)            { log(`   ⚠️  API error ${res.status} — trying next mode`); continue }

      const data = await res.json()
      if (!data?.anime)       { log(`   ⚠️  Empty data — trying next mode`); continue }

      return { data: data.anime, level }

    } catch (err) {
      log(`   ⚠️  Error: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  log(`   ❌ Failed to get data from AnimeThemes`)
  return null
}

// ─────────────────────────────────────────────
// ANILIST
// ─────────────────────────────────────────────

const AL_QUERY = `
  query ($id: Int, $malId: Int, $search: String) {
    Media(id: $id, idMal: $malId, search: $search, type: ANIME) {
      id
      title { romaji english native }
      season seasonYear format
      coverImage { large }
      synonyms
      studios(isMain: true) { nodes { name } }
    }
  }
`

async function fetchAniList(vars: Record<string, any>, label: string): Promise<AniListData | null> {
  try {
    const res  = await fetch(ANILIST_API, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ query: AL_QUERY, variables: vars }),
    })
    const json = await res.json()

    if (json.errors) {
      log(`   ⚠️  AniList error: ${json.errors[0]?.message}`)
      return null
    }

    const m = json.data?.Media
    if (!m) return null

    const studios = m.studios?.nodes?.map((n: any) => n.name).filter(Boolean) ?? []

    return {
      anilistId            : m.id,
      animeTitleEnglish    : m.title?.english ?? null,
      animeTitleRomaji     : m.title?.romaji  ?? null,
      animeTitleNative     : m.title?.native  ?? null,
      animeTitleAlternative: [m.title?.native, m.title?.romaji, ...(m.synonyms ?? [])].filter(Boolean),
      animeSeason          : m.season?.toUpperCase() ?? null,
      animeSeasonYear      : m.seasonYear ?? null,
      animeCoverImage      : m.coverImage?.large ?? null,
      animeMediaFormat     : m.format ?? null,
      animeSynonyms        : m.synonyms ?? [],
      animeStudios         : studios,
    }
  } catch (err) {
    log(`   ❌ AniList error: ${err instanceof Error ? err.message : 'unknown'}`)
    return null
  }
}

// ─────────────────────────────────────────────
// KITSU
// ─────────────────────────────────────────────

function parseKitsuResponse(data: any): KitsuData | null {
  const item = Array.isArray(data.data) ? data.data[0] : data.data
  if (!item) return null

  const attrs  = item.attributes ?? {}
  const titles = attrs.titles ?? {}
  const alt    = [titles.en_jp, titles.ja_jp, ...(attrs.abbreviatedTitles ?? [])].filter(Boolean)

  let anilistId: number | null = null
  let malId    : number | null = null

  if (data.included) {
    const maps  = data.included.filter((i: any) => i.type === 'mappings')
    const alMap = maps.find((m: any) => m.attributes?.externalSite === 'anilist/anime')
    const malMap= maps.find((m: any) => m.attributes?.externalSite === 'myanimelist/anime')
    if (alMap)  anilistId = parseInt(alMap.attributes.externalId,  10) || null
    if (malMap) malId     = parseInt(malMap.attributes.externalId, 10) || null
  }

  return {
    kitsuId              : item.id ?? null,
    anilistId,
    malId,
    animeTitleEnglish    : titles.en    ?? null,
    animeTitleRomaji     : titles.en_jp ?? null,
    animeTitleNative     : titles.ja_jp ?? null,
    animeTitleAlternative: alt,
    animeCoverImage      : attrs.posterImage?.large ?? null,
    animeBannerImage     : attrs.coverImage?.large  ?? null,
  }
}

async function fetchKitsu(params: string, label: string): Promise<KitsuData | null> {
  try {
    const url  = `${KITSU_API}/anime?${params}&include=mappings`
    const res  = await fetch(url, { headers: { Accept: 'application/vnd.api+json' } })
    const data = await res.json()

    if (!data?.data?.length && !data?.data?.id) {
      return null
    }

    const parsed = parseKitsuResponse(data)
    return parsed
  } catch (err) {
    log(`   ❌ Kitsu error: ${err instanceof Error ? err.message : 'unknown'}`)
    return null
  }
}

// ─────────────────────────────────────────────
// ENRICH — full fallback chain
// AniList: by_id → by_malid → by_title
// Kitsu  : by_malid → by_title (only if EN title missing)
// ─────────────────────────────────────────────

async function enrichAnime(
  anilistId: number | null,
  malId    : number | null,
  title    : string,
): Promise<{ anilist: AniListData | null; kitsu: KitsuData | null; sources: SourcesFetched }> {

  const sources: SourcesFetched = { at_level: 'none', anilist: 'none', kitsu: 'none' }
  let anilist: AniListData | null = null
  let kitsu  : KitsuData   | null = null

  // ── AniList ──
  if (anilistId) {
    await sleep(DELAY_AL)
    anilist = await fetchAniList({ id: anilistId }, 'by_id')
    if (anilist) sources.anilist = 'by_id'
  }

  if (!anilist && malId) {
    await sleep(DELAY_AL)
    anilist = await fetchAniList({ malId }, 'by_malid')
    if (anilist) sources.anilist = 'by_malid'
  }

  if (!anilist) {
    await sleep(DELAY_AL)
    anilist = await fetchAniList({ search: title }, 'by_title')
    if (anilist) sources.anilist = 'by_title'
  }

  // ── Kitsu — only if English title still missing ──
  if (!anilist?.animeTitleEnglish) {
    if (malId) {
      await sleep(DELAY_KT)
      kitsu = await fetchKitsu(`filter[malId]=${malId}`, 'by_malid')
      if (kitsu) sources.kitsu = 'by_malid'
    }

    if (!kitsu) {
      await sleep(DELAY_KT)
      kitsu = await fetchKitsu(
        `filter[text]=${encodeURIComponent(title)}&page[limit]=5`,
        'by_title',
      )
      if (kitsu) sources.kitsu = 'by_title'
    }

    // If Kitsu found AniList ID → try AniList again with it
    if (!anilist && kitsu?.anilistId) {
      await sleep(DELAY_AL)
      anilist = await fetchAniList({ id: kitsu.anilistId }, 'by_id')
      if (anilist) sources.anilist = 'by_id'
    }
  }

  return { anilist, kitsu, sources }
}

// ─────────────────────────────────────────────
// PARSE AT RESPONSE → ParsedAnime
// ─────────────────────────────────────────────

function parseATResponse(atData: any, level: 'full' | 'basic' | 'bare'): ParsedAnime {
  const images    = atData.images    ?? []
  const resources = atData.resources ?? []

  const malId     = resources.find((r: any) => r.site === 'MyAnimeList')?.external_id ?? null
  const anilistId = resources.find((r: any) => r.site === 'AniList')?.external_id     ?? null

  const themes: ParsedTheme[] = (atData.animethemes ?? []).map((t: any) => {
    const artists  = t.song?.artists ?? []
    const type     = (t.type?.toUpperCase() ?? 'OP') as 'OP' | 'ED' | 'IN'
    const sequence = t.sequence ?? 1

    const entries: Entry[] = (t.animethemeentries ?? []).map((e: any) => {
      const videos: VideoSource[] = [...(e.videos ?? [])]
        .sort((a: any, b: any) => (b.resolution ?? 0) - (a.resolution ?? 0))
        .map((v: any) => ({
          resolution : v.resolution  ?? null,
          url        : v.link        ?? null,
          audioUrl   : v.audio?.link ?? null,
          audioSize  : v.audio?.size ?? null,
          source     : v.source      ?? null,
          nc         : v.nc          ?? false,
          lyrics     : v.lyrics      ?? false,
          subbed     : v.subbed      ?? false,
          uncen      : v.uncen       ?? false,
          overlap    : v.overlap     ?? null,
          size       : v.size        ?? null,
          tags       : v.tags        ?? null,
          basename   : v.basename    ?? null,
        }))

      return {
        version  : e.version  ?? 1,
        episodes : e.episodes ?? null,
        isNsfw   : e.nsfw     ?? false,
        isSpoiler: e.spoiler  ?? false,
        notes    : e.notes    ?? null,
        videos,
      }
    })

    const firstOverlap = entries[0]?.videos?.[0]?.overlap
    const overlapNote  =
      firstOverlap === 'Over'       ? 'Plays over episode' :
      firstOverlap === 'Transition' ? 'Transition overlap' : null

    const animeSlug = atData.slug ?? `anime-${t.id}`
    return {
      animethemesThemeId: t.id,
      slug              : `${animeSlug}-${type.toLowerCase()}${sequence}`,
      type,
      sequence,
      songTitle  : t.song?.title ?? 'Unknown',
      allArtists : artists.map((a: any) => a.name),
      artistSlugs: artists.map((a: any) => a.slug),
      artistRoles: artists.map((a: any) => a.as ?? 'performer'),
      entries,
      overlapNote,
    }
  })

  return {
    animeSlug            : atData.slug,
    animethemesId        : atData.id,
    animeTitle           : atData.name ?? 'Unknown',
    animeTitleEnglish    : null,
    animeTitleRomaji     : null,
    animeTitleNative     : null,
    animeTitleAlternative: (atData.animesynonyms ?? []).map((s: any) => s.text).filter(Boolean),
    animeSeason          : atData.season?.toUpperCase() ?? null,
    animeSeasonYear      : atData.year  ?? null,
    animeCoverImage      : images.find((i: any) => i.facet === 'Large Cover')?.link
                        ?? images.find((i: any) => i.facet === 'Small Cover')?.link ?? null,
    animeSmallCoverImage : images.find((i: any) => i.facet === 'Small Cover')?.link ?? null,
    animeBannerImage     : images.find((i: any) => i.facet === 'Banner')?.link       ?? null,
    animeGrillImage      : images.find((i: any) => i.facet === 'Grill')?.link        ?? null,
    animeSynopsis        : atData.synopsis     ?? null,
    animeMediaFormat     : atData.media_format ?? null,
    animeSeries          : (atData.series  ?? []).map((s: any) => s.name).filter(Boolean),
    animeStudios         : (atData.studios ?? []).map((s: any) => s.name).filter(Boolean),
    animeSynonyms        : (atData.animesynonyms ?? []).map((s: any) => s.text).filter(Boolean),
    malId,
    anilistId,
    kitsuId              : null,
    themes,
    sourcesFetched       : { at_level: level, anilist: 'none', kitsu: 'none' },
    syncedAt             : new Date(),
  }
}

// ─────────────────────────────────────────────
// MERGE ENRICHMENT
// ─────────────────────────────────────────────

function mergeEnrichment(
  anime  : ParsedAnime,
  anilist: AniListData | null,
  kitsu  : KitsuData   | null,
  sources: SourcesFetched,
): ParsedAnime {
  // Dedupe alt titles
  const altTitles = [
    ...(anilist?.animeTitleAlternative ?? []),
    ...(kitsu?.animeTitleAlternative   ?? []),
    ...anime.animeTitleAlternative,
  ].filter((v, i, arr) => v && arr.indexOf(v) === i)

  return {
    ...anime,

    anilistId : anilist?.anilistId  ?? kitsu?.anilistId ?? anime.anilistId,
    kitsuId   : kitsu?.kitsuId      ?? null,
    malId     : anime.malId         ?? kitsu?.malId     ?? null,

    animeTitleEnglish  : anilist?.animeTitleEnglish ?? kitsu?.animeTitleEnglish ?? kitsu?.animeTitleRomaji ?? anime.animeTitleEnglish,
    animeTitleRomaji   : anilist?.animeTitleRomaji  ?? kitsu?.animeTitleRomaji  ?? anime.animeTitleRomaji,
    animeTitleNative   : anilist?.animeTitleNative  ?? kitsu?.animeTitleNative  ?? anime.animeTitleNative,
    animeTitleAlternative: altTitles,

    animeSeason        : anilist?.animeSeason      ?? anime.animeSeason,
    animeSeasonYear    : anilist?.animeSeasonYear   ?? anime.animeSeasonYear,
    animeMediaFormat   : anilist?.animeMediaFormat  ?? anime.animeMediaFormat,

    animeCoverImage    : anilist?.animeCoverImage   ?? kitsu?.animeCoverImage   ?? anime.animeCoverImage,
    animeBannerImage   : kitsu?.animeBannerImage    ?? anime.animeBannerImage,

    animeStudios       : anilist?.animeStudios?.length ? anilist.animeStudios : anime.animeStudios,
    animeSynonyms      : anilist?.animeSynonyms?.length ? anilist.animeSynonyms : anime.animeSynonyms,

    sourcesFetched     : { ...sources, at_level: anime.sourcesFetched.at_level },
    syncedAt           : new Date(),
  }
}

// ─────────────────────────────────────────────
// DB — one document per theme (NOT per anime)
// Each theme gets its own ThemeCache document
// Uses animethemesId as unique key
// ─────────────────────────────────────────────

async function upsertAnime(anime: ParsedAnime): Promise<void> {
  for (const theme of anime.themes) {
    // Check if this specific theme already exists in DB
    const existing = await ThemeCache.findOne({ animethemesId: theme.animethemesThemeId })
    if (existing) {
      log(`   ⏭️  Theme already in DB: "${theme.songTitle}" (${theme.type}${theme.sequence}) [id:${theme.animethemesThemeId}]`)
      continue
    }
    
    const firstEntry = theme.entries[0]
    const bestVideo = firstEntry?.videos[0] ?? null
    
    const themeDoc = {
      slug: theme.slug,
      animethemesId: theme.animethemesThemeId,
      animeSlug: anime.animeSlug,
      animeBannerImage: anime.animeBannerImage,
      
      songTitle: theme.songTitle,
      allArtists: theme.allArtists,
      artistSlugs: theme.artistSlugs,
      artistRoles: theme.artistRoles,
      
      animeTitle: anime.animeTitle,
      animeTitleEnglish: anime.animeTitleEnglish,
      animeTitleAlternative: anime.animeTitleAlternative,
      animeSeason: anime.animeSeason,
      animeSeasonYear: anime.animeSeasonYear,
      animeCoverImage: anime.animeCoverImage,
      animeGrillImage: anime.animeGrillImage,
      animeSynopsis: anime.animeSynopsis,
      animeMediaFormat: anime.animeMediaFormat,
      animeSmallCoverImage: anime.animeSmallCoverImage,
      animeSeries: anime.animeSeries,
      animeStudios: anime.animeStudios,
      animeSynonyms: anime.animeSynonyms,
      
      anilistId: anime.anilistId,
      malId: anime.malId,
      
      type: theme.type,
      sequence: theme.sequence,
      overlapNote: theme.overlapNote,
      
      entries: theme.entries,
      
      videoUrl: bestVideo?.url ?? '',
      videoResolution: bestVideo?.resolution ?? null,
      videoSource: bestVideo?.source ?? null,
      hasLyrics: theme.entries.some(e => e.videos.some(v => v.lyrics)),
      isCreditless: theme.entries.some(e => e.videos.some(v => v.source === 'I')),
      
      syncedAt: new Date(),
    }
    
    await ThemeCache.findOneAndUpdate(
      { animethemesId: theme.animethemesThemeId },
      { $set: themeDoc },
      { upsert: true, returnDocument: 'after' }
    )
    
    log(`   💾 Saved: "${theme.songTitle}" (${theme.type}${theme.sequence})`)
  }
}

async function upsertArtists(themes: ParsedTheme[]): Promise<void> {
  const artistThemeIds = new Map<string, { name: string; ids: number[] }>()
  
  for (const theme of themes) {
    for (let i = 0; i < theme.allArtists.length; i++) {
      const name = theme.allArtists[i]
      const slug = theme.artistSlugs[i] ?? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      if (!artistThemeIds.has(slug)) {
        artistThemeIds.set(slug, { name, ids: [] })
      }
      artistThemeIds.get(slug)!.ids.push(theme.animethemesThemeId)
    }
  }
  
  for (const [slug, data] of artistThemeIds) {
    try {
      await ArtistCache.findOneAndUpdate(
        { slug },
        { 
          $set: { name: data.name, syncedAt: new Date() },
          $addToSet: { themeAnimethemesIds: { $each: data.ids } }
        },
        { upsert: true, returnDocument: 'after' }
      )
      log(`   🎤 Artist: ${data.name} (${data.ids.length} themes)`)
    } catch (err) {
      log(`   ⚠️  Artist save failed: ${data.name}`)
    }
  }
}



// ─────────────────────────────────────────────
// PHASE 2 — PROCESS EACH SLUG
// ─────────────────────────────────────────────

async function processSlugs(slugFile: SlugFile): Promise<void> {
  logPhase('Phase 2: Processing anime')

  const processedSet = new Set(slugFile.processed)
  const pending      = slugFile.slugs.filter(s => !processedSet.has(s))
  const total        = pending.length

  log(`📊 Total anime: ${slugFile.slugs.length}`)
  log(`   Already done: ${processedSet.size}`)
  log(`   Previously failed: ${slugFile.failed.length}`)
  log(`   Now processing: ${total}`)
  div()

  let progress = readProgress() ?? {
    runTag        : RUN_TAG,
    startPage     : START_PAGE,
    endPage       : END_PAGE,
    totalProcessed: processedSet.size,
    totalFailed   : slugFile.failed.length,
    lastSlug      : '',
    lastUpdated   : new Date().toISOString(),
    phase         : 'processing' as const,
  }

  let index = 0

  for (const slug of pending) {
    index++
    logAnimeStart(index, total, slug)

    try {
      await sleep(DELAY_AT)

      // ── Step 1: Fetch from AnimeThemes ──
      const atResult = await fetchFromAT(slug)

      if (!atResult) {
        log(`   ❌ Fetch failed — skipping`)
        slugFile.failed.push(slug)
        writeSlugFile(slugFile)
        progress.totalFailed++
        progress.lastSlug    = slug
        progress.lastUpdated = new Date().toISOString()
        writeProgress(progress)
        logAnimeEnd(false, progress.totalProcessed, progress.totalFailed)
        continue
      }

      // ── Step 2: Parse ──
      const anime = parseATResponse(atResult.data, atResult.level)
      logATFetch(atResult.level)

      // ── Step 3: Enrich ──
      const { anilist, kitsu, sources } = await enrichAnime(
        anime.anilistId,
        anime.malId,
        anime.animeTitle,
      )

      // Log enrichment source
      if (sources.anilist !== 'none') {
        logAnilistFetch(sources.anilist)
      } else if (sources.kitsu !== 'none') {
        logKitsuFetch(`Found via Kitsu (${sources.kitsu})`)
      } else {
        logNoEnrichment()
      }

      // ── Step 4: Merge ──
      const merged = mergeEnrichment(anime, anilist, kitsu, sources)

      // ── Step 5: Log results ──
      logAnimeBasicInfo(merged)
      logIds(merged)
      logThemesCount(merged.themes)

      // ── Step 6: Save to MongoDB ──
      await upsertAnime(merged)

      // ── Step 7: Save artists ──
      await upsertArtists(merged.themes)

      // ── Step 8: Mark as processed ──
      slugFile.processed.push(slug)
      writeSlugFile(slugFile)

      progress.totalProcessed++
      progress.lastSlug    = slug
      progress.lastUpdated = new Date().toISOString()
      writeProgress(progress)

      logAnimeEnd(true, progress.totalProcessed, progress.totalFailed)

    } catch (err) {
      log(`   ❌ Error: ${err instanceof Error ? err.message : 'unknown'}`)
      slugFile.failed.push(slug)
      writeSlugFile(slugFile)
      progress.totalFailed++
      progress.lastSlug    = slug
      progress.lastUpdated = new Date().toISOString()
      writeProgress(progress)
      logAnimeEnd(false, progress.totalProcessed, progress.totalFailed)
    }
  }

  progress.phase = 'done'
  writeProgress(progress)

  div('═')
  log(`🎉 Done! Processed: ${progress.totalProcessed} | Failed: ${progress.totalFailed}`)
  div('═')
}

// ─────────────────────────────────────────────
// PHASE 3 — RETRY FAILED SLUGS
// Run with: npx ts-node seed.ts --start=X --end=Y --retry-failed
// ─────────────────────────────────────────────

async function retryFailed(): Promise<void> {
  logPhase('Phase 3: Retrying failed anime')

  const slugFile = readSlugFile()
  if (!slugFile || slugFile.failed.length === 0) {
    log('✅ No failed anime to retry')
    return
  }

  const toRetry = [...slugFile.failed]
  slugFile.failed = []
  let ok = 0
  let bad = 0

  log(`🔄 Retrying ${toRetry.length} failed anime...`)

  for (let i = 0; i < toRetry.length; i++) {
    const slug = toRetry[i]
    log(`\n🔄 [${i + 1}/${toRetry.length}] ${slug}`)

    try {
      await sleep(DELAY_AT)
      const atResult = await fetchFromAT(slug)

      if (!atResult) {
        log(`   ❌ Still failing`)
        slugFile.failed.push(slug)
        bad++
      } else {
        const anime  = parseATResponse(atResult.data, atResult.level)
        const { anilist, kitsu, sources } = await enrichAnime(anime.anilistId, anime.malId, anime.animeTitle)
        const merged = mergeEnrichment(anime, anilist, kitsu, sources)
        
        logATFetch(atResult.level)
        if (sources.anilist !== 'none') {
          logAnilistFetch(sources.anilist)
        } else if (sources.kitsu !== 'none') {
          logKitsuFetch(`Found via Kitsu (${sources.kitsu})`)
        } else {
          logNoEnrichment()
        }
        logAnimeBasicInfo(merged)

        await upsertAnime(merged)
        await upsertArtists(merged.themes)

        slugFile.processed.push(slug)
        ok++
        log(`   ✅ Retry success`)
      }
    } catch (err) {
      log(`   ❌ Error: ${err instanceof Error ? err.message : 'unknown'}`)
      slugFile.failed.push(slug)
      bad++
    }

    // Save after every retry
    writeSlugFile(slugFile)
  }

  div('═')
  log(`🔄 RETRY DONE — ✅ ${ok} recovered  ❌ ${bad} still failing`)
  div('═')
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

async function main() {
  ensureDir()
  initLog()

  div('═', 70)
  log(`🌱 ANIME SEED SCRIPT`)
  log(`   Pages: ${START_PAGE} → ${END_PAGE}`)
  log(`   Mode: ${retryArg ? 'Retry Failed' : 'Normal'}`)
  div('═', 70)

  try {
    await connectDB()
    log('✅ Connected to database')
  } catch (err) {
    log(`❌ Database connection failed: ${err instanceof Error ? err.message : 'unknown'}`)
    process.exit(1)
  }

  if (retryArg) {
    await retryFailed()
  } else {
    const slugFile = await collectSlugs()
    await processSlugs(slugFile)
  }

  log('✅ All done!')
  logStream?.end()
}

main().catch(err => {
  log(`❌ Fatal: ${err instanceof Error ? err.message : 'unknown'}`)
  logStream?.end()
  process.exit(1)
})
