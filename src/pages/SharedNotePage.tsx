import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Note, } from '../types'
import {  getImageUrl, } from '../services/api'
import {
  BookOpen, Video, FileText, GraduationCap, StickyNote,
  ArrowLeft, MessageCircle, Send, Trash2, Globe, ExternalLink,
  ChevronUp, ChevronDown,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ── No-auth fetch — works for logged-out visitors ─────────────────────────────
const API_BASE = 'https://notevaultapi-production.up.railway.app/'

async function fetchPublicNotes(category: string): Promise<Note[]> {
  const url = `${API_BASE}/notes/discover?category=${encodeURIComponent(category)}&limit=200`
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error('Failed to fetch public notes')
  const data = await res.json()
  return (data.notes ?? data) as Note[]
}
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  book: BookOpen, video: Video, article: FileText, course: GraduationCap, general: StickyNote,
}

const STATUS_LABELS: Record<string, string> = {
  currently_reading: 'Currently Reading',
  finished: 'Finished',
  will_repeat: 'Will Repeat',
  repeated: 'Repeated',
}

const STATUS_COLORS: Record<string, string> = {
  currently_reading: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  finished: 'text-green-400 bg-green-500/10 border-green-500/20',
  will_repeat: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  repeated: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
}

export default function SharedNotePage() {
  const { category, slug } = useParams<{ category: string; slug: string }>()
  const { user: currentUser } = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
 
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Show scroll-to-top button after scrolling down
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!slug || !category) return

    const parts = slug.split('-')
    const idSuffix = parts[parts.length - 1]

    if (!idSuffix || idSuffix.length !== 6) {
      setNotFound(true)
      setLoading(false)
      return
    }

    // Use no-auth fetch so unauthenticated visitors can view shared notes
    fetchPublicNotes(category)
      .then(notes => {
        const found = notes.find(n =>
          n._id.endsWith(idSuffix) &&
          n.category === category &&
          n.isPublic
        )
        if (!found) {
          setNotFound(true)
          return Promise.reject('not found')
        }
        setNote(found)
      })
  }, [slug, category])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

  if (loading) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (notFound || !note) return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-ink-900 border border-ink-800 rounded-2xl flex items-center justify-center mb-4">
        <BookOpen size={28} className="text-ink-700" />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink-200 mb-2">Note not found</h1>
      <p className="text-ink-500 text-sm mb-6">This note may be private or no longer exists.</p>
      <Link to="/" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-ink-950 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all">
        <ArrowLeft size={15} />
        Go Home
      </Link>
    </div>
  )

  const Icon = CATEGORY_ICONS[note.category] ?? StickyNote
  const noteUser = typeof note.user === 'string' ? null : note.user

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Top bar */}
      <div className="border-b border-ink-800 bg-ink-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="xl:w-[90%] mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-100 transition-colors">
            <ArrowLeft size={15} />
            ReadShelf
          </Link>
          <div className="flex items-center gap-3">
            {/* Scroll to bottom */}
            <button
              onClick={scrollToBottom}
              className="flex items-center gap-1.5 text-xs text-ink-600 hover:text-ink-300 transition-colors"
            >
              <ChevronDown size={14} />
              <span className="hidden sm:inline">Jump to comments</span>
            </button>
            <div className="flex items-center gap-1.5">
              <Globe size={13} className="text-ink-600" />
              <span className="text-xs text-ink-600">Public note</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-64 overflow-hidden">
        {note.category === 'general' ? (
          <div className="w-full h-full" style={{ backgroundColor: note.coverColor }} />
        ) : note.cover ? (
          <img src={getImageUrl(note.cover)} alt={note.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-ink-900 flex items-center justify-center">
            <Icon size={48} className="text-ink-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="xl:w-[90%] mx-auto px-4 -mt-16 relative z-10 pb-20">

        {noteUser && (
          <div className="bg-ink-900 border border-ink-800 rounded-xl p-4 flex items-center gap-3 mb-6">
            {noteUser.avatar ? (
              <img src={getImageUrl(noteUser.avatar)} alt={noteUser.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <span className="text-amber-400 text-sm font-bold">{noteUser.name[0]}</span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-ink-200">{noteUser.name} {noteUser.surname}</p>
              <p className="text-xs text-ink-500 font-mono">@{noteUser.username}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 bg-ink-900 border border-ink-800 px-3 py-1.5 rounded-lg">
            <Icon size={13} className="text-amber-400" />
            <span className="text-xs font-medium text-ink-300 capitalize">{note.category}</span>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${STATUS_COLORS[note.status]}`}>
            {STATUS_LABELS[note.status]}
          </span>
        </div>

        <h1 className="font-display text-4xl font-bold text-ink-50 mb-3 leading-tight">{note.title}</h1>

        {note.author && <p className="text-ink-500 font-mono text-sm mb-2">by {note.author}</p>}
        {note.description && <p className="text-ink-400 text-base leading-relaxed mb-4">{note.description}</p>}

        {note.link && (
          <a href={note.link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors mb-6 font-mono"
          >
            <ExternalLink size={14} />
            {note.link.length > 60 ? note.link.slice(0, 60) + '...' : note.link}
          </a>
        )}

        <div className="border-t border-ink-800 mt-6 pt-8">
          <h2 className="font-display text-xl font-semibold text-ink-200 mb-4">Notes & Thoughts</h2>
          {note.content ? (
            <div className="bg-ink-900 border border-ink-800 rounded-2xl px-6 py-5">
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: note.content }} />
            </div>
          ) : (
            <div className="bg-ink-900 border border-dashed border-ink-800 rounded-2xl px-6 py-12 text-center text-ink-600">
              <p className="text-sm">No notes written yet.</p>
            </div>
          )}
        </div>

  
      </div>

      {/* Floating scroll-to-top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-amber-500 hover:bg-amber-400 text-ink-950 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 transition-all"
        >
          <ChevronUp size={18} />
        </button>
      )}
    </div>
  )
}