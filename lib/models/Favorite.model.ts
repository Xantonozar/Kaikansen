import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    themeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ThemeCache', required: true },
    themeSlug: { type: String, required: true },
  },
  { timestamps: true }
)

favoriteSchema.index({ userId: 1, themeId: 1 }, { unique: true })

export default mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema)