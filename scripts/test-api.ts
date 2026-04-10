import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { connectDB } from '../lib/db'
import { ThemeCache, ArtistCache, AnimeCache } from '../lib/models'

const BASE_URL = 'https://api.animethemes.moe'

async function testFetchPage1() {
  console.log('🔌 Connecting to MongoDB...')
  await connectDB()
  console.log('✅ Connected!\n')
  
  console.log('🌐 Fetching page 1 from AnimeThemes API...')
  
  const url = new URL(`${BASE_URL}/animetheme`)
  url.searchParams.set('page[size]', '5') // Just 5 for quick test
  url.searchParams.set('page[number]', '1')
  url.searchParams.set('include', 'animethemeentries.videos,song.artists,anime.images')
  
  console.log('URL:', url.toString())
  
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'Kaikansen-Test/1.0' }
  })
  
  console.log('Status:', res.status)
  
  if (!res.ok) {
    console.log('Error:', await res.text())
    return
  }
  
  const data = await res.json()
  const themes = data.animethemes || []
  
  console.log(`\n✅ Got ${themes.length} themes\n`)
  
  for (const atTheme of themes) {
    const anime = atTheme.anime
    const entry = atTheme.animethemeentries?.[0]
    const videos = entry?.videos || []
    const artists = atTheme.song?.artists || []
    
    if (!anime || !entry || videos.length === 0) {
      console.log('  ❌ Skipped - missing data')
      continue
    }
    
    console.log(`🎵 ${atTheme.song?.title || 'Unknown'}`)
    console.log(`   Anime: ${anime.name || anime.romajiName}`)
    console.log(`   Videos: ${videos.length}`)
    
    // Try to save
    try {
      const slug = atTheme.slug || atTheme.song?.title?.toLowerCase().replace(/\s+/g, '-')
      
      await ThemeCache.findOneAndUpdate(
        { slug },
        {
          $set: {
            slug,
            animethemesId: atTheme.id,
            songTitle: atTheme.song?.title || 'Unknown',
            artistName: artists[0]?.name || null,
            allArtists: artists.map((a: any) => a.name),
            artistSlugs: artists.map((a: any) => a.slug),
            animeTitle: anime.name || anime.romajiName || 'Unknown',
            type: atTheme.type || 'OP',
            sequence: 1,
            videoUrl: videos[0]?.link || '',
            videoSources: videos.map((v: any) => ({ resolution: v.resolution, url: v.link })),
            syncedAt: new Date(),
          }
        },
        { upsert: true }
      )
      console.log('   ✅ SAVED to MongoDB!')
    } catch (err) {
      console.log('   ❌ Save failed:', err.message)
    }
  }
  
  // Check total now
  const total = await ThemeCache.countDocuments()
  console.log(`\n📊 Total themes in DB: ${total}`)
}

testFetchPage1().catch(e => console.error('Error:', e))