import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/api'
import { BookOpen, Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await forgotPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center px-6 py-12 paper-texture">
        <div className="w-full max-w-md text-center animate-slide-up">
          <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail size={28} className="text-green-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink-50 mb-3">Check your email</h2>
          <p className="text-ink-400 mb-8">
            We've sent a password reset link to <span className="text-amber-400">{email}</span>
          </p>
          <Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
            ← Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-6 py-12 paper-texture">
      <div className="w-full max-w-sm animate-slide-up">
        <Link to="/login" className="flex items-center gap-2 text-ink-500 hover:text-ink-300 transition-colors mb-8 text-sm">
          <ArrowLeft size={14} />
          Back to login
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 gold-shimmer rounded-lg flex items-center justify-center">
            <BookOpen size={15} className="text-ink-950" />
          </div>
          <span className="font-display text-xl font-semibold text-ink-50">NoteVault</span>
        </div>

        <h2 className="font-display text-3xl font-bold text-ink-50 mb-2">Reset password</h2>
        <p className="text-ink-500 mb-8">Enter your email and we'll send you a reset link</p>

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

          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-ink-950 font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm mt-2"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  )
}
