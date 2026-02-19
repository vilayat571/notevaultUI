import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Note, Comment } from '../types'
import { getComments, getImageUrl, addComment, deleteComment } from '../services/api'
import { BookOpen, Video, FileText, GraduationCap, StickyNote, ArrowLeft, MessageCircle, Send, Trash2, Globe, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// We resolve the note by the last 6 chars of ID embedded in the slug
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

// Fetch note by partial id suffix (last 6 chars) — we search via discover endpoint
// Since your API has getSingleNote by full id, we'll embed the full id in the slug as last 24 chars
import { getSingleNote } from '../services/api'

export default function SharedNotePage() {
  const { category, slug } = useParams<{ category: string; slug: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (!slug) return

    // Extract the full MongoDB ObjectId (24 hex chars) appended after the last '-'
    // Format: some-slug-title-<id>  where id is last 24 chars
    const parts = slug.split('-')
    // Try last segment as 24-char id first, then fall back to last 6-char suffix search
    const lastPart = parts[parts.length - 1]
    const noteId = lastPart.length === 24 ? lastPart : null

    if (!noteId) {
      setNotFound(true)
      setLoading(false)
      return
    }

    getSingleNote(noteId)
      .then(res => {
        const n: Note = res.data.note
        // Guard: must be public and category must match
        if (!n.isPublic || n.category !== category) {
          setNotFound(true)
          return
        }
        setNote(n)
        return getComments(noteId)
      })
      .then(res => res && setComments(res.data.comments))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug, category])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !note) return
    setSubmittingComment(true)
    try {
      const res = await addComment(note._id, commentText)
      setComments(prev => [res.data.comment, ...prev])
      setCommentText('')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete comment?')) return
    try {
      await deleteComment(commentId)
      setComments(prev => prev.filter(c => c._id !== commentId))
    } catch (err) {
      console.error(err)
    }
  }

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
      <Link
        to="/"
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-ink-950 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
      >
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
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-100 transition-colors"
          >
            <ArrowLeft size={15} />
            ReadShelf
          </Link>
          <div className="flex items-center gap-2">
            <Globe size={13} className="text-ink-600" />
            <span className="text-xs text-ink-600">Public note</span>
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

        {/* Author card */}
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

        {/* Meta */}
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

        {note.author && (
          <p className="text-ink-500 font-mono text-sm mb-2">by {note.author}</p>
        )}

        {note.description && (
          <p className="text-ink-400 text-base leading-relaxed mb-4">{note.description}</p>
        )}

        {note.link && (
          <a
            href={note.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors mb-6 font-mono"
          >
            <ExternalLink size={14} />
            {note.link.length > 60 ? note.link.slice(0, 60) + '...' : note.link}
          </a>
        )}

        {/* Notes content */}
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

        {/* Comments */}
        <div className="mt-12 border-t border-ink-800 pt-8">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle size={18} className="text-ink-500" />
            <h2 className="font-display text-xl font-semibold text-ink-200">
              Comments ({comments.length})
            </h2>
          </div>

          {currentUser ? (
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="px-4 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-ink-950 rounded-xl transition-all flex items-center gap-2 text-sm font-semibold"
                >
                  <Send size={14} />
                  Post
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-6 bg-ink-900 border border-ink-800 rounded-xl px-5 py-4 text-sm text-ink-500 flex items-center justify-between">
              <span>Sign in to leave a comment</span>
              <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Sign in →
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment._id} className="bg-ink-900 border border-ink-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  {comment.user.avatar ? (
                    <img src={getImageUrl(comment.user.avatar)} alt={comment.user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-400 text-xs font-semibold">{comment.user.name[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-ink-200">{comment.user.name} {comment.user.surname}</span>
                      <span className="text-xs text-ink-600 font-mono">@{comment.user.username}</span>
                      <span className="text-xs text-ink-700">·</span>
                      <span className="text-xs text-ink-600">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-ink-300 leading-relaxed">{comment.text}</p>
                  </div>
                  {comment.user._id === currentUser?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="p-1.5 rounded-lg text-ink-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}