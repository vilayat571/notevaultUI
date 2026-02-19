import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../services/api'
import { BookOpen, Eye, EyeOff, Check } from 'lucide-react'

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!token) return

    setLoading(true)
    setError('')
    try {
      await resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center px-6 py-12 paper-texture">
        <div className="w-full max-w-md text-center animate-scale-in">
          <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-green-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink-50 mb-3">Password reset!</h2>
          <p className="text-ink-400">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-6 py-12 paper-texture">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 gold-shimmer rounded-lg flex items-center justify-center">
            <BookOpen size={15} className="text-ink-950" />
          </div>
          <span className="font-display text-xl font-semibold text-ink-50">NoteVault</span>
        </div>

        <h2 className="font-display text-3xl font-bold text-ink-50 mb-2">Set new password</h2>
        <p className="text-ink-500 mb-8">Enter your new password below</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">New Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
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

          <div>
            <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Confirm Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
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
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  )
}
