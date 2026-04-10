import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function check() {
  const uri = process.env.MONGODB_URI!
  console.log('Connecting to MongoDB...')
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  console.log('Connected!')
  
  const ThemeCache = mongoose.model('ThemeCache')
  const ArtistCache = mongoose.model('ArtistCache')
  const AnimeCache = mongoose.model('AnimeCache')
  
  const themeCount = await ThemeCache.countDocuments()
  const artistCount = await ArtistCache.countDocuments()  
  const animeCount = await AnimeCache.countDocuments()
  
  console.log('='.repeat(40))
  console.log('DATABASE CONTENTS:')
  console.log('  Themes:', themeCount)
  console.log('  Artists:', artistCount)
  console.log('  Anime:', animeCount)
  console.log('='.repeat(40))
  
  if (themeCount > 0) {
    const sample = await ThemeCache.findOne().lean()
    console.log('\nSample theme:')
    console.log('  Song:', sample?.songTitle)
    console.log('  Anime:', sample?.animeTitle)
    console.log('  Type:', sample?.type)
    console.log('  Artist:', sample?.artistName)
  }
  
  await mongoose.disconnect()
  process.exit(0)
}

check().catch(e => { console.error('Error:', e.message); process.exit(1); })