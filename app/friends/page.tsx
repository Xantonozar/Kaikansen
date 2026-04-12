'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { useFriends, useFriendRequests, useSendFriendRequest, useRespondToFriendRequest } from '@/lib/api/friends'
import { useAuth } from '@/providers/AuthProvider'
import { useSearchUsers } from '@/lib/api/users'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'

export default function FriendsPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'find'>('friends')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data: friendsData, isLoading: isFriendsLoading } = useFriends(user?.id ?? '', 1)
  const { data: requestsData, isLoading: isRequestsLoading } = useFriendRequests(user?.id ?? '', 1)
  const { data: searchData, isLoading: isSearchLoading } = useSearchUsers(searchQuery)
  
  const sendRequest = useSendFriendRequest()
  const respondRequest = useRespondToFriendRequest()

  const friends = (friendsData?.data ?? []) as any[]
  const requests = (requestsData?.data ?? []) as any[]
  const searchResults = (searchData?.data ?? []) as any[]

  const existingFriendIds = new Set(friends.map((f: any) => f.friendId?._id))
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
  }

  if (isAuthLoading) {
    return (
      <>
        <AppHeader />
        <main className="p-4"><LoadingSkeleton /></main>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <AppHeader />
        <main className="p-4">
          <EmptyState title="Login required" description="Please login to view friends" />
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="p-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-6">Connections</h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === 'friends'
                ? 'bg-accent text-white'
                : 'bg-bg-elevated text-ktext-secondary border border-border-default'
            }`}
          >
            Friends
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-accent text-white'
                : 'bg-bg-elevated text-ktext-secondary border border-border-default'
            }`}
          >
            Requests
            {requests.length > 0 && (
              <span className="bg-error text-white text-xs px-1.5 rounded-full">{requests.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('find')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'find'
                ? 'bg-accent text-white'
                : 'bg-bg-elevated text-ktext-secondary border border-border-default'
            }`}
          >
            Find Users
          </button>
        </div>

        {activeTab === 'find' && (
          <div className="mb-6">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ktext-tertiary" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by username or display name..."
                className="w-full pl-10 pr-4 py-3 bg-bg-surface border border-border-subtle rounded-[16px] text-ktext-primary placeholder:text-ktext-tertiary focus:outline-none focus:border-accent"
              />
            </form>

            {isSearchLoading ? (
              <LoadingSkeleton count={5} />
            ) : searchQuery && searchResults.length > 0 ? (
              <div className="space-y-3 mt-4">
                {searchResults
                  .filter((u: any) => u._id !== user.id && !existingFriendIds.has(u._id))
                  .map((u: any) => (
                    <div key={u._id} className="bg-bg-surface rounded-[16px] border border-border-subtle p-4 shadow-card flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-bg-elevated overflow-hidden">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ktext-tertiary">
                            {u.displayName?.[0] ?? '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-body font-semibold text-ktext-primary">{u.displayName}</p>
                        <p className="text-xs text-ktext-tertiary">@{u.username}</p>
                      </div>
                      <Link href={`/user/${u.username}`} className="px-4 py-2 bg-bg-elevated border border-border-default text-ktext-secondary rounded-full text-sm font-semibold">
                        View
                      </Link>
                    </div>
                  ))}
              </div>
            ) : searchQuery ? (
              <EmptyState title="No users found" description="Try a different search term" />
            ) : (
              <p className="text-sm text-ktext-tertiary text-center mt-4">
                Search for users by username or display name
              </p>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          isFriendsLoading ? (
            <LoadingSkeleton count={5} />
          ) : friends.length > 0 ? (
            <div className="space-y-3">
              {friends.map((friend: any) => (
                <div key={friend._id} className="bg-bg-surface rounded-[16px] border border-border-subtle p-4 shadow-card flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-bg-elevated overflow-hidden">
                    {friend.friendId?.avatarUrl ? (
                      <img src={friend.friendId.avatarUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ktext-tertiary">
                        {friend.friendId?.displayName?.[0] ?? '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-body font-semibold text-ktext-primary">{friend.friendId?.displayName}</p>
                    <p className="text-xs text-ktext-tertiary">@{friend.friendId?.username}</p>
                  </div>
                  <Link href={`/user/${friend.friendId?.username}`} className="px-4 py-2 bg-bg-elevated border border-border-default text-ktext-secondary rounded-full text-sm font-semibold">
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No friends yet" description="Start connecting with other users" />
          )
        )}

        {activeTab === 'requests' && (
          isRequestsLoading ? (
            <LoadingSkeleton count={3} />
          ) : requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((req: any) => (
                <div key={req._id} className="bg-bg-surface rounded-[16px] border border-border-subtle p-4 shadow-card flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-bg-elevated overflow-hidden">
                    {req.requesterId?.avatarUrl ? (
                      <img src={req.requesterId.avatarUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ktext-tertiary">
                        {req.requesterId?.displayName?.[0] ?? '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-body font-semibold text-ktext-primary">{req.requesterId?.displayName}</p>
                    <p className="text-xs text-ktext-tertiary">@{req.requesterId?.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondRequest.mutate({ id: req._id, action: 'accept' })}
                      className="px-4 py-2 bg-accent text-white rounded-full text-sm font-semibold"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respondRequest.mutate({ id: req._id, action: 'reject' })}
                      className="px-4 py-2 bg-bg-elevated border border-border-default text-ktext-secondary rounded-full text-sm font-semibold"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No pending requests" description="When someone sends you a friend request, it'll appear here" />
          )
        )}
      </main>
    </>
  )
}