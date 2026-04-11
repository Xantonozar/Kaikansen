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
  
  // Check for duplicate animethemesId in 2025 and 2026
  console.log('\n🔍 CHECKING FOR DUPLICATE animethemesId...')
  let totalDuplicates = 0
  
  for (const year of [2025, 2026]) {
    const duplicates = await ThemeCache.aggregate([
      { $match: { animeSeasonYear: year } },
      { $group: { 
          _id: "$animethemesId", 
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gt: 1 }, _id: { $ne: null } } }
    ])
    
    if (duplicates.length > 0) {
      console.log(`  📅 ${year}: ${duplicates.length} duplicate animethemesId(s)`)
      totalDuplicates += duplicates.reduce((sum, d) => sum + (d.count - 1), 0)
    } else {
      console.log(`  📅 ${year}: No duplicates found`)
    }
  }
  
  console.log(`\n📊 TOTAL DUPLICATES: ${totalDuplicates}`)
   
  console.log('\n✅ Done!')
}

check().catch(e => { console.error('Error:', e.message); process.exit(1); })