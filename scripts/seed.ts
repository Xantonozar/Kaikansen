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
  failedThemes: number
  lastUpdated: string
}

interface ErrorLog {
  startTime: string
  endTime?: string
  errors: Array<{
    type: string
    [key: string]: any
  }>
  warnings: Array<{
    type: string
    [key: string]: any
  }>
  summary: {
    totalErrors: number
    totalWarnings: number
    status: string
  }
}

function loadProgress(): SeedProgress {
  const progressPath = path.join(process.cwd(), 'scripts', 'seed-progress.json')
  if (fs.existsSync(progressPath)) {
    try {
      return JSON.parse(fs.readFileSync(progressPath, 'utf-8'))
    } catch (error) {
      console.warn(`⚠️  Failed to load progress file: ${error instanceof Error ? error.message : 'unknown error'}`)
      return { lastPage: 1, totalProcessed: 0, failedThemes: 0, lastUpdated: new Date().toISOString() }
    }
  }
  return { lastPage: 1, totalProcessed: 0, failedThemes: 0, lastUpdated: new Date().toISOString() }
}

function saveProgress(progress: SeedProgress): void {
  const progressPath = path.join(process.cwd(), 'scripts', 'seed-progress.json')
  try {
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2))
  } catch (error) {
    console.error(`❌ Failed to save progress: ${error instanceof Error ? error.message : 'unknown error'}`)
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchThemesPage(page: number, retries = 3): Promise<any[]> {
  const url = new URL(`${ANIMETHEMES_API}/api/v4/themes`)
  url.searchParams.set('page[number]', page.toString())
  url.searchParams.set('page[size]', '100')
  url.searchParams.set('include', 'anime,songs.artists')
  url.searchParams.set('fields[anime]', 'mal_id,anilist_id,name,year,season')
  url.searchParams.set('fields[songs]', 'title')
  url.searchParams.set('fields[artists]', 'name')

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString())
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      if (!data.data) {
        throw new Error('No data field in API response')
      }
      return data.data || []
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      if (attempt < retries) {
        console.warn(`⚠️  Fetch attempt ${attempt}/${retries} failed for page ${page}: ${message}`)
        await sleep(1000)
      } else {
        throw new Error(`Failed to fetch page ${page} after ${retries} attempts: ${message}`)
      }
    }
  }
  return []
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

  try {
    const res = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })

    if (!res.ok) {
      console.warn(`⚠️  AniList HTTP ${res.status} for "${title}"`)
      return { description: '', coverImage: '' }
    }

    const data = await res.json()
    if (data.errors) {
      console.warn(`⚠️  AniList GraphQL error for "${title}": ${data.errors[0]?.message || 'unknown'}`)
      return { description: '', coverImage: '' }
    }

    const media = data.data?.Media

    return {
      description: media?.description || '',
      coverImage: media?.coverImage?.medium || '',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.warn(`⚠️  AniList fetch failed for "${title}": ${message}`)
    return { description: '', coverImage: '' }
  }
}

async function main() {
  const errorLog: ErrorLog = {
    startTime: new Date().toISOString(),
    errors: [],
    warnings: [],
    summary: { totalErrors: 0, totalWarnings: 0, status: 'PENDING' },
  }

  try {
    console.log('🌱 Starting seed script (TypeScript)...')
    
    try {
      await connectDB()
      console.log('✅ Connected to MongoDB')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      console.error('❌ MongoDB connection failed:', message)
      errorLog.errors.push({
        type: 'MONGODB_CONNECTION',
        message,
        timestamp: new Date().toISOString(),
      })
      throw error
    }

    const progress = loadProgress()
    console.log(`📋 Progress restored: Page ${progress.lastPage}, Processed: ${progress.totalProcessed}, Failed: ${progress.failedThemes}`)
    console.log(`📊 Resuming from page ${progress.lastPage}`)
    console.log(`⏱️  Processing started. This will take a while...`)
    console.log('   AnimeThemes queries: 700ms delay')
    console.log('   AniList queries: 1000ms delay')
    console.log('')

    let page = progress.lastPage
    const maxPages = 150

    while (page <= maxPages) {
      console.log(`📄 Fetching page ${page}/${maxPages}...`)
      
      let themes: any[]
      try {
        await sleep(RATE_LIMIT_ANIMETHEMES)
        themes = await fetchThemesPage(page)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error'
        console.error(`❌ Failed to fetch page ${page}: ${message}`)
        errorLog.errors.push({
          type: 'PAGE_FETCH',
          page,
          message,
          timestamp: new Date().toISOString(),
        })
        break
      }

      if (!themes.length) {
        console.log('✅ No more themes found, seeding complete!')
        break
      }

      let pageSuccessCount = 0
      let pageFailCount = 0

      for (const theme of themes) {
        try {
          if (!theme.anime?.anilist_id) {
            console.warn(`⚠️  Skipped theme ${theme.slug}: missing anilist_id`)
            pageFailCount++
            continue
          }

          if (!theme.slug) {
            console.warn(`⚠️  Skipped theme: missing slug`)
            pageFailCount++
            continue
          }

          await sleep(RATE_LIMIT_ANILIST)
          const anilistData = await fetchAniListData(theme.anime.name)

          const songTitle = theme.songs?.[0]?.title || theme.name || ''
          if (!songTitle) {
            console.warn(`⚠️  Theme ${theme.slug}: missing song title`)
          }

          await ThemeCache.updateOne(
            { slug: theme.slug },
            {
              $set: {
                slug: theme.slug,
                songTitle,
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
            try {
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
            } catch (artistError) {
              const message = artistError instanceof Error ? artistError.message : 'unknown error'
              console.warn(`⚠️  Failed to upsert artist for theme ${theme.slug}: ${message}`)
              errorLog.warnings.push({
                type: 'ARTIST_UPSERT',
                theme: theme.slug,
                artist: theme.songs[0].artists[0].name,
                message,
                timestamp: new Date().toISOString(),
              })
            }
          }

          progress.totalProcessed++
          pageSuccessCount++
        } catch (err) {
          pageFailCount++
          progress.failedThemes++
          const message = err instanceof Error ? err.message : 'unknown error'
          console.error(`❌ Error processing theme ${theme.slug}: ${message}`)
          errorLog.errors.push({
            type: 'THEME_PROCESS',
            theme: theme.slug,
            anime: theme.anime?.name,
            message,
            timestamp: new Date().toISOString(),
          })
        }
      }

      progress.lastPage = page
      progress.lastUpdated = new Date().toISOString()
      saveProgress(progress)

      console.log(`✅ Page ${page} processed: ${pageSuccessCount} themes, ${pageFailCount} failed. Total: ${progress.totalProcessed}`)
      page++
    }

    console.log(`🎉 Seed complete!`)
    console.log(`   Processed: ${progress.totalProcessed} themes`)
    console.log(`   Failed: ${progress.failedThemes} themes`)

    errorLog.endTime = new Date().toISOString()
    errorLog.summary = {
      totalErrors: errorLog.errors.length,
      totalWarnings: errorLog.warnings.length,
      status: 'SUCCESS',
    }

    try {
      const successPath = path.join(process.cwd(), 'scripts', `seed-success-${Date.now()}.json`)
      fs.writeFileSync(successPath, JSON.stringify(errorLog, null, 2))
      console.log(`📋 Seed log saved to: ${successPath}`)
    } catch (logError) {
      console.warn(`⚠️  Failed to save seed log: ${logError instanceof Error ? logError.message : 'unknown error'}`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error('❌ Seed error:', message)
    if (error instanceof Error && error.stack) {
      console.error('   Stack:', error.stack)
    }
    
    errorLog.endTime = new Date().toISOString()
    errorLog.errors.push({
      type: 'CRITICAL',
      message,
      timestamp: new Date().toISOString(),
    })
    errorLog.summary = {
      totalErrors: errorLog.errors.length,
      totalWarnings: errorLog.warnings.length,
      status: 'FAILED',
    }

    try {
      const errorPath = path.join(process.cwd(), 'scripts', `seed-error-${Date.now()}.json`)
      fs.writeFileSync(errorPath, JSON.stringify(errorLog, null, 2))
      console.log(`📋 Error log saved to: ${errorPath}`)
    } catch (logError) {
      console.error(`Failed to save error log: ${logError instanceof Error ? logError.message : 'unknown error'}`)
    }

    process.exit(1)
  }
}
