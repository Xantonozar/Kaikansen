import mongoose from 'mongoose'

const artistCacheSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    image: String,
    members: [String],
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

artistCacheSchema.index({ name: 'text' })

export default mongoose.models.ArtistCache || mongoose.model('ArtistCache', artistCacheSchema)
