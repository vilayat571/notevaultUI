import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, Upload } from 'lucide-react'
import { registerUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', 
    surname: '', 
    username: '', 
    email: '', 
    password: '', 
    bio: '',
    age: '',
    subject: '',
    linkedinUrl: '',
    twitterUrl: '',
    instagramUrl: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

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
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (avatarFile) fd.append('avatar', avatarFile)
      await registerUser(fd)
      // Auto-login after register
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-6 py-12 paper-texture">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 gold-shimmer rounded-lg flex items-center justify-center">
            <BookOpen size={15} className="text-ink-950" />
          </div>
          <span className="font-display text-xl font-semibold text-ink-50">NoteVault</span>
        </div>

        <h2 className="font-display text-3xl font-bold text-ink-50 mb-2">Create your vault</h2>
        <p className="text-ink-500 mb-8">Start collecting knowledge that lasts</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-full border-2 border-dashed border-ink-700 hover:border-amber-500/40 cursor-pointer overflow-hidden flex items-center justify-center transition-colors flex-shrink-0"
            >
              {avatarPreview
                ? <img src={avatarPreview} className="w-full h-full object-cover" />
                : <Upload size={18} className="text-ink-600" />
              }
            </div>
            <div>
              <p className="text-sm text-ink-300 font-medium">Profile photo</p>
              <p className="text-xs text-ink-600">Optional</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-1.5 block">Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John" required
                className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-all text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-1.5 block">Surname</label>
              <input name="surname" value={form.surname} onChange={handleChange} placeholder="Doe" required
                className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-all text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-1.5 block">Username</label>
            <input name="username" value={form.username} onChange={handleChange} placeholder="johndoe" required
              className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-all text-sm font-mono" />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-1.5 block">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required
              className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-all text-sm" />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-1.5 block">Password</label>
            <div className="relative">
              <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="••••••••" required
                className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 pr-12 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-all text-sm" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-600 hover:text-ink-300 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-1.5 block">Bio <span className="text-ink-700 normal-case">(optional)</span></label>
            <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="A few words about yourself..."
              rows={2} className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-all text-sm resize-none" />
          </div>

          {/* Optional fields section */}
          <div className="pt-4 border-t border-ink-800">
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">Optional Info</p>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-ink-600 mb-1 block">Age</label>
                <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="25"
                  className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-all text-sm" />
              </div>

              <div>
                <label className="text-xs text-ink-600 mb-1 block">Field of Interest</label>
                <input name="subject" value={form.subject} onChange={handleChange} placeholder="e.g., Software Development, Design..."
                  className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-all text-sm" />
              </div>

              <div>
                <label className="text-xs text-ink-600 mb-1 block">LinkedIn URL</label>
                <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..."
                  className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-all text-sm font-mono" />
              </div>

              <div>
                <label className="text-xs text-ink-600 mb-1 block">Twitter/X URL</label>
                <input name="twitterUrl" value={form.twitterUrl} onChange={handleChange} placeholder="https://twitter.com/..."
                  className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-all text-sm font-mono" />
              </div>

              <div>
                <label className="text-xs text-ink-600 mb-1 block">Instagram URL</label>
                <input name="instagramUrl" value={form.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/..."
                  className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-all text-sm font-mono" />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-ink-950 font-semibold py-3.5 rounded-xl transition-all text-sm mt-2">
            {loading ? 'Creating vault...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-ink-500 text-sm mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
