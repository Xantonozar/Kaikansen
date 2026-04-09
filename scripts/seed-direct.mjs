import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env
const envLocal = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const mongoMatch = envLocal.match(/MONGODB_URI=(.*)/);
const MONGODB_URI = mongoMatch ? mongoMatch[1] : null;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

const ANIMETHEMES_API = 'https://api.animethemes.me';
const ANILIST_API = 'https://graphql.anilist.co';

// Models
const themeSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true, index: true },
  songTitle: { type: String, index: true },
  artistName: String,
  allArtists: [String],
  animeTitle: { type: String, index: true },
  animeTitleAlternative: String,
  animeAniListId: { type: Number, index: true },
  animeMalId: Number,
  type: { type: String, enum: ['OP', 'ED', 'IN'], index: true },
  season: { type: String, index: true },
  year: { type: Number, index: true },
  coverImage: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

themeSchema.index({ songTitle: 'text', artistName: 'text', allArtists: 'text', animeTitle: 'text' });

const artistSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true, index: true },
  name: { type: String, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ThemeCache = mongoose.model('ThemeCache', themeSchema);
const ArtistCache = mongoose.model('ArtistCache', artistSchema);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchThemesPage(page) {
  const url = new URL(`${ANIMETHEMES_API}/api/v4/themes`);
  url.searchParams.set('page[number]', page.toString());
  url.searchParams.set('page[size]', '100');
  url.searchParams.set('include', 'anime,songs.artists');
  url.searchParams.set('fields[anime]', 'mal_id,anilist_id,name,year,season');
  url.searchParams.set('fields[songs]', 'title');
  url.searchParams.set('fields[artists]', 'name');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`AnimeThemes API error: ${res.status}`);

  const data = await res.json();
  return data.data || [];
}

async function fetchAniListData(title) {
  const query = `
    query {
      Media(search: "${title.replace(/"/g, '\\"')}", type: ANIME) {
        description
        coverImage { medium }
      }
    }
  `;

  const res = await fetch(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) return { description: '', coverImage: '' };

  const data = await res.json();
  const media = data.data?.Media;

  return {
    description: media?.description || '',
    coverImage: media?.coverImage?.medium || '',
  };
}

async function main() {
  try {
    console.log('🌱 Starting seed script...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const progressPath = path.join(__dirname, 'seed-progress.json');
    let progress = { lastPage: 1, totalProcessed: 0, lastUpdated: new Date().toISOString() };
    
    if (fs.existsSync(progressPath)) {
      progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    }

    console.log(`📊 Resuming from page ${progress.lastPage}`);
    console.log(`⏱️  Processing started...`);
    console.log('   AnimeThemes: 700ms delay');
    console.log('   AniList: 1000ms delay\n');

    let page = progress.lastPage;
    const maxPages = 150;

    while (page <= maxPages) {
      console.log(`📄 Fetching page ${page}/${maxPages}...`);
      await sleep(700);

      const themes = await fetchThemesPage(page);
      if (!themes.length) {
        console.log('✅ No more themes found!');
        break;
      }

      for (const theme of themes) {
        try {
          if (!theme.anime?.anilist_id) continue;

          await sleep(1000);
          const anilistData = await fetchAniListData(theme.anime.name);

          await ThemeCache.updateOne(
            { slug: theme.slug },
            {
              $set: {
                slug: theme.slug,
                songTitle: theme.songs?.[0]?.title || theme.name || '',
                artistName: theme.songs?.[0]?.artists?.[0]?.name || '',
                allArtists: theme.songs?.[0]?.artists?.map((a) => a.name) || [],
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
          );

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
            );
          }

          progress.totalProcessed++;
        } catch (err) {
          // silently skip
        }
      }

      progress.lastPage = page;
      progress.lastUpdated = new Date().toISOString();
      fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));

      console.log(`✅ Page ${page} processed. Total: ${progress.totalProcessed}`);
      page++;
    }

    console.log(`\n🎉 Seed complete! Processed ${progress.totalProcessed} themes`);
    const themeCount = await ThemeCache.countDocuments();
    const artistCount = await ArtistCache.countDocuments();
    console.log(`📦 Database: ${themeCount} themes, ${artistCount} artists`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
