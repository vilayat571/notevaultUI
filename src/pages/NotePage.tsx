import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Note } from '../types'
import { getSingleNote, editNote, deleteNote, getImageUrl } from '../services/api'
import { ArrowLeft, Edit3, Trash2, Save, BookOpen, Video, FileText, GraduationCap, StickyNote, ExternalLink, Globe, Lock, X } from 'lucide-react'
import NoteModal from '../components/NoteModal'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  book: BookOpen, video: Video, article: FileText, course: GraduationCap, general: StickyNote,
}

const STATUS_COLORS: Record<string, string> = {
  currently_reading: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  finished: 'text-green-400 bg-green-500/10 border-green-500/20',
  will_repeat: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  repeated: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
}

const STATUS_LABELS: Record<string, string> = {
  currently_reading: 'Currently Reading',
  finished: 'Finished',
  will_repeat: 'Will Repeat',
  repeated: 'Repeated',
}

export default function NotePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (!id) return
    getSingleNote(id)
      .then(res => {
        setNote(res.data.note)
        setContent(res.data.note.content || '')
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSaveContent = async () => {
    if (!note) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('content', content)
      fd.append('title', note.title)
      fd.append('category', note.category)
      fd.append('status', note.status)
      fd.append('isPublic', String(note.isPublic))
      const res = await editNote(note._id, fd)
      setNote(res.data.note)
      setEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!note || !confirm('Delete this note?')) return
    await deleteNote(note._id)
    navigate('/dashboard')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!note) return null

  const Icon = CATEGORY_ICONS[note.category]

  return (
    <div className="min-h-screen">
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

        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="absolute top-6 left-6 flex items-center gap-2 bg-ink-950/60 backdrop-blur-sm border border-ink-700/50 px-3 py-2 rounded-xl text-sm text-ink-300 hover:text-ink-100 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        {/* Actions */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-ink-950/60 backdrop-blur-sm border border-ink-700/50 p-2 rounded-xl text-ink-400 hover:text-ink-100 transition-colors"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={handleDelete}
            className="bg-ink-950/60 backdrop-blur-sm border border-ink-700/50 p-2 rounded-xl text-ink-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-8 -mt-16 relative z-10 pb-20">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 bg-ink-900 border border-ink-800 px-3 py-1.5 rounded-lg">
            <Icon size={13} className="text-amber-400" />
            <span className="text-xs font-medium text-ink-300 capitalize">{note.category}</span>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${STATUS_COLORS[note.status]}`}>
            {STATUS_LABELS[note.status]}
          </span>
          <span className="ml-auto">
            {note.isPublic
              ? <Globe size={14} className="text-ink-500" />
              : <Lock size={14} className="text-ink-700" />
            }
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

        <div className="border-t border-ink-800 mt-6 pt-8">
          {/* Content editor */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-ink-200">Notes & Thoughts</h2>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    onClick={() => { setEditing(false); setContent(note.content || '') }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-700 text-ink-500 hover:text-ink-200 text-xs transition-colors"
                  >
                    <X size={13} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveContent}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-ink-950 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <Save size={13} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-700 text-ink-500 hover:text-ink-200 text-xs transition-colors"
                >
                  <Edit3 size={13} />
                  Edit
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your notes, reflections, key takeaways..."
              rows={20}
              autoFocus
              className="w-full bg-ink-900 border border-amber-500/30 rounded-2xl px-6 py-5 text-ink-200 placeholder-ink-700 focus:outline-none focus:border-amber-500/50 transition-colors text-sm leading-relaxed font-body resize-none"
            />
          ) : content ? (
            <div className="bg-ink-900 border border-ink-800 rounded-2xl px-6 py-5">
              <p className="text-ink-300 leading-relaxed text-sm whitespace-pre-wrap">{content}</p>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-ink-900 border border-dashed border-ink-800 rounded-2xl px-6 py-12 text-center text-ink-600 hover:border-amber-500/30 hover:text-ink-500 transition-all"
            >
              <Edit3 size={20} className="mx-auto mb-2 text-ink-700" />
              <p className="text-sm">Click to add your notes and reflections...</p>
            </button>
          )}
        </div>
      </div>

      {showEditModal && (
        <NoteModal
          editingNote={note}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false)
            getSingleNote(note._id).then(res => setNote(res.data.note))
          }}
        />
      )}
    </div>
  )
}
