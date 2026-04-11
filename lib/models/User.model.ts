import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    bio: { type: String, default: '', maxlength: 200 },
    totalRatings: { type: Number, default: 0 },
    totalFollowers: { type: Number, default: 0 },
    totalFollowing: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model('User', userSchema)