import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { connectDB } from '../lib/db'
import { User } from '../lib/models'

const PLACEHOLDER_AVATARS = [
  '/avatars/1.svg',
  '/avatars/2.svg',
  '/avatars/3.svg',
  '/avatars/4.svg',
  '/avatars/5.svg',
]

function getRandomAvatar(): string {
  return PLACEHOLDER_AVATARS[Math.floor(Math.random() * PLACEHOLDER_AVATARS.length)]
}

async function main() {
  await connectDB()

  const users = await User.find({ avatarUrl: null })

  console.log(`Found ${users.length} users without avatars`)

  for (const user of users) {
    const avatar = getRandomAvatar()
    await User.updateOne({ _id: user._id }, { avatarUrl: avatar })
    console.log(`  Updated ${user.username} -> ${avatar}`)
  }

  console.log('Done!')
  process.exit(0)
}

main()