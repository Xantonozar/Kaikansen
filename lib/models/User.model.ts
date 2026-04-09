import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: String,
    bio: String,
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model('User', userSchema)
