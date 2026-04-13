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
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  { timestamps: true }
)

userSchema.index({ friends: 1 })
userSchema.index({ pendingRequests: 1 })
userSchema.index({ sentRequests: 1 })

export default mongoose.models.User || mongoose.model('User', userSchema)