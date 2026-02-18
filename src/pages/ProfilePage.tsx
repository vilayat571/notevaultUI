import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateMe, getImageUrl, getFollowers, getFollowing, removeFollower, unfollowUser, getAllNotes } from '../services/api'
import { Camera, Save, User, Users, UserMinus } from 'lucide-react'
import { Note } from '../types'
import NoteCard from '../components/NoteCard'

type Tab = 'profile' | 'followers' | 'following' | 'feed'

interface UserItem {
  _id: string
  name: string
  surname: string
  username: string
  avatar: string
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [form, setForm] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    username: user?.username || '',
    bio: user?.bio || '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [followers, setFollowers] = useState<UserItem[]>([])
  const [following, setFollowing] = useState<UserItem[]>([])
  const [feedNotes, setFeedNotes] = useState<Note[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (!user) return
    if (activeTab === 'followers') {
      fetchFollowers()
    } else if (activeTab === 'following') {
      fetchFollowing()
    } else if (activeTab === 'feed') {
      fetchFeed()
    }
  }, [activeTab, user])

  const fetchFollowers = async () => {
    if (!user) return
    setLoadingData(true)
    try {
      const res = await getFollowers(user._id)
      setFollowers(res.data.followers)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchFollowing = async () => {
    if (!user) return
    setLoadingData(true)
    try {
      const res = await getFollowing(user._id)
      setFollowing(res.data.following)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchFeed = async () => {
    setLoadingData(true)
    try {
      // Get all notes and filter for followed users' public notes
      const res = await getAllNotes()
      setFeedNotes(res.data.notes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setAvatarFile(f)
    setAvatarPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (avatarFile) fd.append('avatar', avatarFile)
      const res = await updateMe(fd)
      updateUser(res.data.user)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFollower = async (userId: string) => {
    if (!confirm('Remove this follower?')) return
    try {
      await removeFollower(userId)
      setFollowers(prev => prev.filter(f => f._id !== userId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleUnfollow = async (userId: string) => {
    if (!confirm('Unfollow this user?')) return
    try {
      await unfollowUser(userId)
      setFollowing(prev => prev.filter(f => f._id !== userId))
    } catch (err) {
      console.error(err)
    }
  }

  const avatarSrc = avatarPreview || (user?.avatar ? getImageUrl(user.avatar) : '')

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl">
        {/* Header with tabs */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-ink-50 mb-6">Profile</h1>
          <div className="flex gap-2 border-b border-ink-800">
            {[
              { key: 'profile' as Tab, label: 'Edit Profile' },
              { key: 'followers' as Tab, label: `Followers (${user?.followers?.length || 0})` },
              { key: 'following' as Tab, label: `Following (${user?.following?.length || 0})` },
              { key: 'feed' as Tab, label: 'Feed' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-ink-500 hover:text-ink-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-ink-700 bg-ink-800">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={28} className="text-ink-600" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-amber-500 hover:bg-amber-400 rounded-full flex items-center justify-center transition-colors shadow-lg"
                >
                  <Camera size={13} className="text-ink-950" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-200">{user?.name} {user?.surname}</p>
                <p className="text-xs text-ink-500 font-mono">@{user?.username}</p>
                <p className="text-xs text-ink-600 mt-1">{user?.email}</p>
              </div>
            </div>

            <div className="h-px bg-ink-800" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Name</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 focus:outline-none focus:border-amber-500/50 transition-colors text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Surname</label>
                <input name="surname" value={form.surname} onChange={handleChange} required
                  className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 focus:outline-none focus:border-amber-500/50 transition-colors text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Username</label>
              <input name="username" value={form.username} onChange={handleChange} required
                className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 focus:outline-none focus:border-amber-500/50 transition-colors text-sm font-mono" />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="A few words about yourself..." rows={3}
                className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm resize-none" />
            </div>

            {error && (
              <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">Profile updated!</p>
            )}

            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-ink-950 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-500/20">
              <Save size={15} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* Followers Tab */}
        {activeTab === 'followers' && (
          <div className="animate-fade-in">
            {loadingData ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-ink-900 border border-ink-800 rounded-xl h-20 animate-pulse" />
                ))}
              </div>
            ) : followers.length === 0 ? (
              <div className="bg-ink-900 border border-ink-800 rounded-2xl p-12 text-center">
                <Users size={32} className="text-ink-700 mx-auto mb-3" />
                <p className="text-ink-500">No followers yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {followers.map(follower => (
                  <div key={follower._id} className="bg-ink-900 border border-ink-800 rounded-xl p-4 flex items-center gap-4">
                    {follower.avatar ? (
                      <img src={getImageUrl(follower.avatar)} alt={follower.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <User size={20} className="text-amber-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-100">{follower.name} {follower.surname}</p>
                      <p className="text-xs text-ink-500 font-mono">@{follower.username}</p>
                    </div>
                    <button onClick={() => handleRemoveFollower(follower._id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-ink-700 text-ink-500 hover:text-rose-400 hover:border-rose-500/30 transition-all text-xs">
                      <UserMinus size={13} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Following Tab */}
        {activeTab === 'following' && (
          <div className="animate-fade-in">
            {loadingData ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-ink-900 border border-ink-800 rounded-xl h-20 animate-pulse" />
                ))}
              </div>
            ) : following.length === 0 ? (
              <div className="bg-ink-900 border border-ink-800 rounded-2xl p-12 text-center">
                <Users size={32} className="text-ink-700 mx-auto mb-3" />
                <p className="text-ink-500">Not following anyone yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {following.map(user => (
                  <div key={user._id} className="bg-ink-900 border border-ink-800 rounded-xl p-4 flex items-center gap-4">
                    {user.avatar ? (
                      <img src={getImageUrl(user.avatar)} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <User size={20} className="text-amber-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-100">{user.name} {user.surname}</p>
                      <p className="text-xs text-ink-500 font-mono">@{user.username}</p>
                    </div>
                    <button onClick={() => handleUnfollow(user._id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-ink-700 text-ink-500 hover:text-rose-400 hover:border-rose-500/30 transition-all text-xs">
                      <UserMinus size={13} />
                      Unfollow
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="animate-fade-in">
            {loadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-ink-900 border border-ink-800 rounded-xl h-72 animate-pulse" />
                ))}
              </div>
            ) : feedNotes.length === 0 ? (
              <div className="bg-ink-900 border border-ink-800 rounded-2xl p-12 text-center">
                <Users size={32} className="text-ink-700 mx-auto mb-3" />
                <p className="text-ink-500">No posts from followed users</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedNotes.map(note => (
                  <NoteCard key={note._id} note={note} onDelete={() => {}} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
