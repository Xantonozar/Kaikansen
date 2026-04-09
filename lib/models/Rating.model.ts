import mongoose from 'mongoose'

const ratingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    themeSlug: { type: String, required: true },
    rating: { type: Number, min: 1, max: 10, required: true },
  },
  { timestamps: true }
)

ratingSchema.index({ userId: 1, themeSlug: 1 }, { unique: true })

export default mongoose.models.Rating || mongoose.model('Rating', ratingSchema)
