import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { connectDB } from '../lib/db'
import { ThemeCache, ArtistCache, AnimeCache } from '../lib/models'

async function check() {
  await connectDB()
  
  const themeCount = await ThemeCache.countDocuments()
  const artistCount = await ArtistCache.countDocuments()  
  const animeCount = await AnimeCache.countDocuments()
  
  console.log('📊 DATABASE STATUS:')
  console.log('  Themes:', themeCount)
  console.log('  Artists:', artistCount)
  console.log('  Anime:', animeCount)
  
  if (themeCount > 0) {
    const sample = await ThemeCache.findOne().lean()
    console.log('\nSample theme:', sample?.songTitle, '-', sample?.animeTitle, '[', sample?.type, ']')
    
    const recent = await ThemeCache.find().sort({ createdAt: -1 }).limit(3).lean()
    console.log('\nMost recent:')
    recent.forEach(t => console.log('  -', t.songTitle))
  }
  
  console.log('\n✅ Done!')
}

check().catch(e => { console.error('Error:', e.message); process.exit(1); })