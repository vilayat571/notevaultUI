import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Lock, Globe, ShieldCheck, ChevronRight } from 'lucide-react'
import { discoverUsers, getImageUrl } from '../services/api'

interface DiscoverUser {
  _id: string
  name: string
  surname: string
  username: string
  avatar: string
  bio: string
  privacyMode: 'public' | 'private' | 'private_plus'
}

function PrivacyBadge({ mode }: { mode: string }) {
  if (mode === 'public') return (
    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
      <Globe size={9} /> Public
    </span>
  )
  if (mode === 'private_plus') return (
    <span className="flex items-center gap-1 text-[10px] font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
      <ShieldCheck size={9} /> Private+
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-[10px] font-medium text-ink-400 bg-ink-800 border border-ink-700 px-2 py-0.5 rounded-full">
      <Lock size={9} /> Private
    </span>
  )
}

function Avatar({ avatar, name }: { avatar: string; name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  if (avatar) return (
    <img src={getImageUrl(avatar)} alt={name} className="w-12 h-12 rounded-2xl object-cover border border-ink-700/50 flex-shrink-0" />
  )
  return (
    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
      <span className="font-semibold text-amber-400 text-base">{initials}</span>
    </div>
  )
}

function UserCard({ user, onClick }: { user: DiscoverUser; onClick: () => void }) {
  const isPublic = user.privacyMode === 'public'
  return (
    <div
      onClick={onClick}
      className="group bg-ink-900 border border-ink-800 hover:border-ink-700 rounded-2xl p-5 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-start gap-3 mb-4">
        <Avatar avatar={user.avatar} name={`${user.name} ${user.surname}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="font-semibold text-ink-100 text-sm truncate">{user.name} {user.surname}</p>
            <PrivacyBadge mode={user.privacyMode} />
          </div>
          <p className="text-xs text-ink-500">@{user.username}</p>
        </div>
        <ChevronRight size={15} className="text-ink-700 group-hover:text-ink-500 transition-colors flex-shrink-0 mt-1" />
      </div>

      {isPublic && user.bio ? (
        <p className="text-xs text-ink-400 leading-relaxed line-clamp-2 mb-4">{user.bio}</p>
      ) : !isPublic ? (
        <p className="text-xs text-ink-600 italic mb-4 flex items-center gap-1.5">
          <Lock size={10} /> This profile is private
        </p>
      ) : null}

    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-ink-900 border border-ink-800 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-ink-800 flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-ink-800 rounded-full w-32" />
          <div className="h-3 bg-ink-800 rounded-full w-20" />
        </div>
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="h-3 bg-ink-800 rounded-full w-full" />
        <div className="h-3 bg-ink-800 rounded-full w-2/3" />
      </div>
      <div className="h-px bg-ink-800 mb-3" />
      <div className="flex gap-4">
        <div className="h-3 w-16 bg-ink-800 rounded-full" />
        <div className="h-3 w-16 bg-ink-800 rounded-full" />
      </div>
    </div>
  )
}

export default function UsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<DiscoverUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [skip, setSkip] = useState(0)
  const LIMIT = 20
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchUsers = async (searchVal: string, skipVal: number, reset: boolean) => {
    reset ? setLoading(true) : setLoadingMore(true)
    try {
      const res = await discoverUsers({ search: searchVal || undefined, limit: LIMIT, skip: skipVal })
      const newUsers: DiscoverUser[] = res.data.users
      setUsers(prev => reset ? newUsers : [...prev, ...newUsers])
      setHasMore(newUsers.length === LIMIT)
      setSkip(skipVal + newUsers.length)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => { fetchUsers('', 0, true) }, [])

  const handleSearch = (val: string) => {
    setSearch(val)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => fetchUsers(val, 0, true), 400)
  }

  return (
    <div className="min-h-screen bg-ink-950 paper-texture">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
              <Users size={16} className="text-amber-400" />
            </div>
            <h1 className="font-display text-3xl font-bold text-ink-50">People</h1>
          </div>
          <p className="text-ink-500 ml-12">Browse readers and explore their public vaults</p>
        </div>

        <div className="relative mb-6">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-600" />
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full bg-ink-900 border border-ink-800 focus:border-amber-500/40 rounded-2xl pl-11 pr-5 py-3.5 text-sm text-ink-100 placeholder-ink-600 focus:outline-none transition-all"
          />
        </div>

        {!loading && (
          <p className="text-xs text-ink-600 mb-6">
            {search
              ? `${users.length} result${users.length !== 1 ? 's' : ''} for "${search}"`
              : `${users.length} reader${users.length !== 1 ? 's' : ''}`}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-ink-900 border border-ink-800 flex items-center justify-center mb-4">
              <Users size={24} className="text-ink-600" />
            </div>
            <p className="text-ink-400 font-medium mb-1">No readers found</p>
            <p className="text-ink-600 text-sm">Try a different search term</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(user => (
                <UserCard key={user._id} user={user} onClick={() => navigate(`/users/${user._id}`)} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => !loadingMore && fetchUsers(search, skip, false)}
                  disabled={loadingMore}
                  className="px-6 py-2.5 text-sm font-medium text-ink-300 bg-ink-900 border border-ink-800 hover:border-ink-700 rounded-xl transition-all disabled:opacity-50"
                >
                  {loadingMore
                    ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />Loading...</span>
                    : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}