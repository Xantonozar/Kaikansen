import { connectDB } from '../lib/db'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const ANIMETHEMES_API = 'https://api.animethemes.moe/api/v2'
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

    // TODO: Implement seeding logic here
    console.log('🚀 Seed script stub - full implementation coming next')

    progress.lastUpdated = new Date().toISOString()
    saveProgress(progress)
  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }
}

main()
