import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateMe, getImageUrl } from '../services/api'
import { Camera, Save, User } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
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

  const avatarSrc = avatarPreview || (user?.avatar ? getImageUrl(user.avatar) : '')

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-xl">
        <h1 className="font-display text-3xl font-bold text-ink-50 mb-1">Profile</h1>
        <p className="text-ink-500 text-sm mb-10">Manage your account information</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
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

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Name</label>
              <input
                name="name" value={form.name} onChange={handleChange} required
                className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Surname</label>
              <input
                name="surname" value={form.surname} onChange={handleChange} required
                className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Username</label>
            <input
              name="username" value={form.username} onChange={handleChange} required
              className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 focus:outline-none focus:border-amber-500/50 transition-colors text-sm font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Bio</label>
            <textarea
              name="bio" value={form.bio} onChange={handleChange}
              placeholder="A few words about yourself..."
              rows={3}
              className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              Profile updated successfully!
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-ink-950 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            <Save size={15} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
