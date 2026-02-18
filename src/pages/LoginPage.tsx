import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex paper-texture">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-violet-500/5" />
        {/* Decorative lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute border-t border-ink-800/50"
              style={{ top: `${12 + i * 12}%`, left: '-5%', right: '-5%', transform: `rotate(${-5 + i * 1.5}deg)` }}
            />
          ))}
        </div>
        <div className="relative flex flex-col justify-center px-16">
          <div className="mb-8">
            <div className="w-12 h-12 gold-shimmer rounded-2xl flex items-center justify-center mb-6">
              <BookOpen size={22} className="text-ink-950" />
            </div>
            <h1 className="font-display text-4xl font-bold text-ink-50 leading-tight mb-4">
              Every great reader<br />
              <em className="text-amber-400">keeps notes.</em>
            </h1>
            <p className="text-ink-400 text-lg leading-relaxed">
              Collect your thoughts on books, videos, articles and courses — all in one place.
            </p>
          </div>

          <div className="space-y-4">
            {['Reading', 'Reflecting', 'Remembering'].map((word, i) => (
              <div key={word} className="flex items-center gap-3" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-ink-400 font-body">{word} — made meaningful.</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 gold-shimmer rounded-lg flex items-center justify-center">
              <BookOpen size={15} className="text-ink-950" />
            </div>
            <span className="font-display text-xl font-semibold text-ink-50">NoteVault</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-ink-50 mb-2">Welcome back</h2>
          <p className="text-ink-500 mb-8">Sign in to your vault</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3.5 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 focus:bg-ink-800 transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-3.5 pr-12 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 focus:bg-ink-800 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-600 hover:text-ink-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-ink-950 font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-ink-500 text-sm mt-8">
            No account?{' '}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
