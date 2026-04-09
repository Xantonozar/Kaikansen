import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env
let MONGODB_URI;
try {
  const envLocal = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
  const mongoMatch = envLocal.match(/MONGODB_URI=(.*)/);
  MONGODB_URI = mongoMatch ? mongoMatch[1] : null;
} catch (error) {
  console.error('❌ Failed to load .env.local:', error.message);
  process.exit(1);
}

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

async function fetchThemesPage(page, retries = 3) {
  const url = new URL(`${ANIMETHEMES_API}/api/v4/themes`);
  url.searchParams.set('page[number]', page.toString());
  url.searchParams.set('page[size]', '100');
  url.searchParams.set('include', 'anime,songs.artists');
  url.searchParams.set('fields[anime]', 'mal_id,anilist_id,name,year,season');
  url.searchParams.set('fields[songs]', 'title');
  url.searchParams.set('fields[artists]', 'name');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`AnimeThemes API HTTP ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      if (!data.data) {
        throw new Error('No data field in AnimeThemes API response');
      }
      return data.data || [];
    } catch (error) {
      if (attempt < retries) {
        console.warn(`⚠️  Fetch attempt ${attempt}/${retries} failed for page ${page}: ${error.message}`);
        await sleep(1000);
      } else {
        throw new Error(`Failed to fetch page ${page} after ${retries} attempts: ${error.message}`);
      }
    }
  }
}

async function fetchAniListData(title, retries = 2) {
  const query = `
    query {
      Media(search: "${title.replace(/"/g, '\\"')}", type: ANIME) {
        description
        coverImage { medium }
      }
    }
  `;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(ANILIST_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        if (attempt < retries) {
          await sleep(500);
          continue;
        }
        console.warn(`⚠️  AniList HTTP ${res.status} for "${title}"`);
        return { description: '', coverImage: '' };
      }

      const data = await res.json();
      if (data.errors) {
        console.warn(`⚠️  AniList GraphQL error for "${title}": ${data.errors[0]?.message || 'unknown'}`);
        return { description: '', coverImage: '' };
      }

      const media = data.data?.Media;
      return {
        description: media?.description || '',
        coverImage: media?.coverImage?.medium || '',
      };
    } catch (error) {
      if (attempt < retries) {
        console.warn(`⚠️  AniList fetch attempt ${attempt}/${retries} failed for "${title}": ${error.message}`);
        await sleep(500);
      } else {
        console.warn(`⚠️  AniList failed for "${title}": ${error.message}`);
        return { description: '', coverImage: '' };
      }
    }
  }

  return { description: '', coverImage: '' };
}

async function main() {
  const errorLog = {
    startTime: new Date().toISOString(),
    errors: [],
    warnings: [],
    summary: {},
  };

  try {
    console.log('🌱 Starting seed script...');
    
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      console.error('   Details:', error.code || error.name);
      errorLog.errors.push({
        type: 'MONGODB_CONNECTION',
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }

    const progressPath = path.join(__dirname, 'seed-progress.json');
    let progress = { lastPage: 1, totalProcessed: 0, failedThemes: 0, lastUpdated: new Date().toISOString() };
    
    if (fs.existsSync(progressPath)) {
      try {
        progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
        console.log(`📋 Progress restored: Page ${progress.lastPage}, Processed: ${progress.totalProcessed}, Failed: ${progress.failedThemes || 0}`);
      } catch (error) {
        console.warn(`⚠️  Could not load progress file: ${error.message}`);
        errorLog.warnings.push({
          type: 'PROGRESS_LOAD',
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }

    console.log(`📊 Resuming from page ${progress.lastPage}`);
    console.log(`⏱️  Processing started...`);
    console.log('   AnimeThemes: 700ms delay');
    console.log('   AniList: 1000ms delay\n');

    let page = progress.lastPage;
    const maxPages = 150;

    while (page <= maxPages) {
      console.log(`📄 Fetching page ${page}/${maxPages}...`);
      
      let themes;
      try {
        await sleep(700);
        themes = await fetchThemesPage(page);
      } catch (error) {
        console.error(`❌ Failed to fetch page ${page}: ${error.message}`);
        errorLog.errors.push({
          type: 'PAGE_FETCH',
          page,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
        break;
      }

      if (!themes.length) {
        console.log('✅ No more themes found!');
        break;
      }

      let pageSuccessCount = 0;
      let pageFailCount = 0;

      for (const theme of themes) {
        try {
          if (!theme.anime?.anilist_id) {
            console.warn(`⚠️  Skipped theme ${theme.slug}: missing anilist_id`);
            pageFailCount++;
            continue;
          }

          if (!theme.slug) {
            console.warn(`⚠️  Skipped theme: missing slug`);
            pageFailCount++;
            continue;
          }

          await sleep(1000);
          const anilistData = await fetchAniListData(theme.anime.name);

          const songTitle = theme.songs?.[0]?.title || theme.name || '';
          if (!songTitle) {
            console.warn(`⚠️  Theme ${theme.slug}: missing song title`);
          }

          await ThemeCache.updateOne(
            { slug: theme.slug },
            {
              $set: {
                slug: theme.slug,
                songTitle,
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
              );
            } catch (artistError) {
              console.warn(`⚠️  Failed to upsert artist for theme ${theme.slug}: ${artistError.message}`);
              errorLog.warnings.push({
                type: 'ARTIST_UPSERT',
                theme: theme.slug,
                artist: theme.songs[0].artists[0].name,
                message: artistError.message,
                timestamp: new Date().toISOString(),
              });
            }
          }

          progress.totalProcessed++;
          pageSuccessCount++;
        } catch (err) {
          pageFailCount++;
          progress.failedThemes = (progress.failedThemes || 0) + 1;
          console.error(`❌ Error processing theme ${theme.slug}:`, err.message);
          errorLog.errors.push({
            type: 'THEME_PROCESS',
            theme: theme.slug,
            anime: theme.anime?.name,
            message: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString(),
          });
        }
      }

      progress.lastPage = page;
      progress.lastUpdated = new Date().toISOString();
      
      try {
        fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
      } catch (saveError) {
        console.error(`❌ Failed to save progress: ${saveError.message}`);
        errorLog.errors.push({
          type: 'PROGRESS_SAVE',
          message: saveError.message,
          timestamp: new Date().toISOString(),
        });
      }

      console.log(`✅ Page ${page} processed: ${pageSuccessCount} themes, ${pageFailCount} failed. Total: ${progress.totalProcessed}`);
      page++;
    }

    console.log(`\n🎉 Seed complete!`);
    console.log(`   Processed: ${progress.totalProcessed} themes`);
    console.log(`   Failed: ${progress.failedThemes || 0} themes`);
    
    try {
      const themeCount = await ThemeCache.countDocuments();
      const artistCount = await ArtistCache.countDocuments();
      console.log(`📦 Database: ${themeCount} themes, ${artistCount} artists`);
    } catch (countError) {
      console.error(`❌ Failed to get document counts: ${countError.message}`);
      errorLog.errors.push({
        type: 'COUNT_DOCUMENTS',
        message: countError.message,
        timestamp: new Date().toISOString(),
      });
    }
    
    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Critical error:', error.message);
    console.error('   Stack:', error.stack);
    errorLog.errors.push({
      type: 'CRITICAL',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    errorLog.summary = {
      totalErrors: errorLog.errors.length,
      totalWarnings: errorLog.warnings.length,
      status: 'FAILED',
    };
    
    try {
      const errorPath = path.join(__dirname, `seed-error-${Date.now()}.json`);
      fs.writeFileSync(errorPath, JSON.stringify(errorLog, null, 2));
      console.log(`📋 Error log saved to: ${errorPath}`);
    } catch (logError) {
      console.error(`Failed to save error log: ${logError.message}`);
    }
    
    process.exit(1);
  }
  
  errorLog.endTime = new Date().toISOString();
  errorLog.summary = {
    totalErrors: errorLog.errors.length,
    totalWarnings: errorLog.warnings.length,
    status: 'SUCCESS',
  };
  
  try {
    const successPath = path.join(__dirname, `seed-success-${Date.now()}.json`);
    fs.writeFileSync(successPath, JSON.stringify(errorLog, null, 2));
    console.log(`📋 Seed log saved to: ${successPath}`);
  } catch (logError) {
    console.warn(`⚠️  Failed to save seed log: ${logError.message}`);
  }
}

main();
