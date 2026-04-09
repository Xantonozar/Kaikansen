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

async function fetchAniListAnime(page = 1) {
  const query = `
    query {
      Page(page: ${page}, perPage: 50) {
        pageInfo {
          hasNextPage
          lastPage
          currentPage
          perPage
        }
        media(type: ANIME, sort: POPULARITY_DESC) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            medium
            large
          }
          description
          season
          seasonYear
        }
      }
    }
  `;

  try {
    const res = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      console.warn(`⚠️  AniList HTTP ${res.status} ${res.statusText} for page ${page}`);
      return { media: [], pageInfo: {} };
    }

    const data = await res.json();
    if (data.errors) {
      console.warn(`⚠️  AniList GraphQL error for page ${page}: ${data.errors[0]?.message || 'unknown'}`);
      return { media: [], pageInfo: {} };
    }

    return data.data?.Page || { media: [], pageInfo: {} };
  } catch (error) {
    console.warn(`⚠️  AniList fetch error for page ${page}: ${error.message}`);
    return { media: [], pageInfo: {} };
  }
}

async function main() {
  const errorLog = {
    startTime: new Date().toISOString(),
    errors: [],
    warnings: [],
    summary: {},
  };

  try {
    console.log('🌱 Starting AniList-based seed script...');
    
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB\n');
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

    let totalProcessed = 0;
    let page = 1;
    const maxPages = 50; // Fetch up to 2500 anime

    while (page <= maxPages) {
      console.log(`📄 Fetching AniList page ${page}/${maxPages}...`);
      
      const { media, pageInfo } = await fetchAniListAnime(page);
      
      if (!media || media.length === 0) {
        console.log('✅ No more anime found!');
        break;
      }

      let pageSuccessCount = 0;
      let pageFailCount = 0;

      for (const anime of media) {
        try {
          if (!anime.id) {
            console.warn(`⚠️  Skipped anime: missing ID`);
            pageFailCount++;
            continue;
          }

          if (!anime.title?.romaji) {
            console.warn(`⚠️  Skipped anime ID ${anime.id}: missing romaji title`);
            pageFailCount++;
            continue;
          }

          // Create OP theme
          const opSlug = `op-${anime.id}-${anime.title.romaji?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`;
          try {
            await ThemeCache.updateOne(
              { slug: opSlug },
              {
                $set: {
                  slug: opSlug,
                  songTitle: `${anime.title.romaji} Opening`,
                  artistName: 'Unknown',
                  allArtists: ['Unknown'],
                  animeTitle: anime.title.romaji || anime.title.english || 'Unknown',
                  animeTitleAlternative: anime.title.english || '',
                  animeAniListId: anime.id,
                  animeMalId: anime.idMal || 0,
                  type: 'OP',
                  season: anime.season?.toLowerCase() || '',
                  year: anime.seasonYear || new Date().getFullYear(),
                  coverImage: anime.coverImage?.large || '',
                  description: anime.description?.substring(0, 500) || '',
                  updatedAt: new Date(),
                },
              },
              { upsert: true }
            );
          } catch (opError) {
            console.error(`❌ Failed to upsert OP for ${anime.title.romaji}: ${opError.message}`);
            errorLog.errors.push({
              type: 'THEME_UPSERT',
              anime: anime.title.romaji,
              type_: 'OP',
              message: opError.message,
              timestamp: new Date().toISOString(),
            });
            pageFailCount++;
            continue;
          }

          // Create ED theme
          const edSlug = `ed-${anime.id}-${anime.title.romaji?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`;
          try {
            await ThemeCache.updateOne(
              { slug: edSlug },
              {
                $set: {
                  slug: edSlug,
                  songTitle: `${anime.title.romaji} Ending`,
                  artistName: 'Unknown',
                  allArtists: ['Unknown'],
                  animeTitle: anime.title.romaji || anime.title.english || 'Unknown',
                  animeTitleAlternative: anime.title.english || '',
                  animeAniListId: anime.id,
                  animeMalId: anime.idMal || 0,
                  type: 'ED',
                  season: anime.season?.toLowerCase() || '',
                  year: anime.seasonYear || new Date().getFullYear(),
                  coverImage: anime.coverImage?.large || '',
                  description: anime.description?.substring(0, 500) || '',
                  updatedAt: new Date(),
                },
              },
              { upsert: true }
            );
          } catch (edError) {
            console.error(`❌ Failed to upsert ED for ${anime.title.romaji}: ${edError.message}`);
            errorLog.errors.push({
              type: 'THEME_UPSERT',
              anime: anime.title.romaji,
              type_: 'ED',
              message: edError.message,
              timestamp: new Date().toISOString(),
            });
            pageFailCount++;
            continue;
          }

          totalProcessed += 2;
          pageSuccessCount++;
        } catch (err) {
          pageFailCount++;
          console.error(`❌ Error processing ${anime.title?.romaji}: ${err.message}`);
          errorLog.errors.push({
            type: 'ANIME_PROCESS',
            anime: anime.title?.romaji || 'unknown',
            message: err.message,
            timestamp: new Date().toISOString(),
          });
        }
      }

      console.log(`✅ Page ${page} processed: ${pageSuccessCount} anime pairs, ${pageFailCount} failed. Total: ${totalProcessed} themes`);
      await sleep(1000); // Rate limit
      page++;
    }

    console.log(`\n🎉 Seed complete!`);
    console.log(`   Processed: ${totalProcessed} themes`);
    
    try {
      const themeCount = await ThemeCache.countDocuments();
      const artistCount = await ArtistCache.countDocuments();
      console.log(`📦 Database: ${themeCount} themes, ${artistCount} artists\n`);
    } catch (countError) {
      console.error(`❌ Failed to get document counts: ${countError.message}`);
      errorLog.errors.push({
        type: 'COUNT_DOCUMENTS',
        message: countError.message,
        timestamp: new Date().toISOString(),
      });
    }

    // Show sample data
    try {
      const themes = await ThemeCache.find({}).limit(5);
      if (themes.length > 0) {
        console.log('Sample themes in database:');
        themes.forEach(t => {
          console.log(`  • ${t.animeTitle} - ${t.type}: "${t.songTitle}"`);
        });
      }
    } catch (sampleError) {
      console.warn(`⚠️  Failed to fetch sample themes: ${sampleError.message}`);
    }

    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');

    errorLog.endTime = new Date().toISOString();
    errorLog.summary = {
      totalErrors: errorLog.errors.length,
      totalWarnings: errorLog.warnings.length,
      status: 'SUCCESS',
    };

    try {
      const successPath = path.join(__dirname, `seed-anilist-success-${Date.now()}.json`);
      fs.writeFileSync(successPath, JSON.stringify(errorLog, null, 2));
      console.log(`📋 Seed log saved to: ${successPath}`);
    } catch (logError) {
      console.warn(`⚠️  Failed to save seed log: ${logError.message}`);
    }
  } catch (error) {
    console.error('❌ Critical error:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }

    errorLog.endTime = new Date().toISOString();
    errorLog.errors.push({
      type: 'CRITICAL',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
    errorLog.summary = {
      totalErrors: errorLog.errors.length,
      totalWarnings: errorLog.warnings.length,
      status: 'FAILED',
    };

    try {
      const errorPath = path.join(__dirname, `seed-anilist-error-${Date.now()}.json`);
      fs.writeFileSync(errorPath, JSON.stringify(errorLog, null, 2));
      console.log(`📋 Error log saved to: ${errorPath}`);
    } catch (logError) {
      console.error(`Failed to save error log: ${logError.message}`);
    }

    process.exit(1);
  }
}

main();
