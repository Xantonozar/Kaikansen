import mongoose from 'mongoose'

const artistCacheSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    animethemesId: { type: Number, required: true },
    name: { type: String, required: true },
    aliases: [String],
    imageUrl: { type: String, default: null },
    totalThemes: { type: Number, default: 0 },
    syncedAt: { type: Date, required: true },
  },
  { timestamps: true }
)

artistCacheSchema.index({ name: 'text', aliases: 'text' })

export default mongoose.models.ArtistCache || mongoose.model('ArtistCache', artistCacheSchema)