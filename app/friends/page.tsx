'use client'

import { useFriends, useFriendRequests } from '@/lib/api/friends'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'

export default function FriendsPage() {
  const { data: friendsData, isLoading: isFriendsLoading } = useFriends()
  const { data: requestsData, isLoading: isRequestsLoading } = useFriendRequests()

  const friends = (friendsData?.data || []) as any[]
  const requests = (requestsData?.data || []) as any[]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">Friends</h1>

      {isRequestsLoading ? (
        <LoadingSkeleton />
      ) : requests.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
          <div className="space-y-2">
            {requests.map((req: any) => (
              <div key={req._id} className="card flex items-center justify-between p-4">
                <span className="font-medium">{req.userId?.username}</span>
                <div className="flex gap-2">
                  <button className="btn btn-primary text-sm">Accept</button>
                  <button className="btn btn-outline text-sm">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {isFriendsLoading ? (
        <LoadingSkeleton />
      ) : friends.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Friends</h2>
          <div className="space-y-2">
            {friends.map((friend: any) => (
              <div key={friend._id} className="card p-4">
                <a href={`/user/${friend.userId?.username}`} className="font-medium hover:text-primary">
                  {friend.userId?.username}
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title="No friends yet" description="Send a friend request to get started" />
      )}
    </div>
  )
}
