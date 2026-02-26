import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Note, User as UserType } from '../types'
import {
  getSingleNote, editNote, deleteNote, getImageUrl,
} from '../services/api'
import {
  ArrowLeft, Edit3, Trash2, Save, BookOpen, Video, FileText,
  GraduationCap, StickyNote, ExternalLink, Globe, Lock, X,
  Download, MessageCircle, Send, User, UserPlus, UserMinus,
  Share2, Check, ChevronUp, ChevronDown,
} from 'lucide-react'
import NoteModal from '../components/NoteModal'
import RichTextEditor from '../components/RichTextEditor'
import { useAuth } from '../context/AuthContext'
import { noteSharePath } from '../utils/slugify'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  book: BookOpen,
  video: Video,
  article: FileText,
  course: GraduationCap,
  general: StickyNote,
}

const STATUS_COLORS: Record<string, string> = {
  currently_reading: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  finished:          'text-green-400 bg-green-500/10 border-green-500/20',
  will_repeat:       'text-amber-400 bg-amber-500/10 border-amber-500/20',
  repeated:          'text-violet-400 bg-violet-500/10 border-violet-500/20',
}

const STATUS_LABELS: Record<string, string> = {
  currently_reading: 'Currently Reading',
  finished:          'Finished',
  will_repeat:       'Will Repeat',
  repeated:          'Repeated',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  // Core state
  const [note, setNote]                     = useState<Note | null>(null)
  const [loading, setLoading]               = useState(true)
  const [content, setContent]               = useState('')
  const [editing, setEditing]               = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [showEditModal, setShowEditModal]   = useState(false)



  // UI
  const [copied, setCopied]                 = useState(false)
  const [showScrollTop, setShowScrollTop]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // ─── Scroll listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ─── Data fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    setLoading(true)

    getSingleNote(id)
      .then(res => {
        const n: Note = res.data.note
        setNote(n)
        setContent(n.content || '')
        const noteUser = n.user as UserType
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))


  }, [id])

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const scrollToTop    = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

  // ─── Share ──────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!note) return
    const path = noteSharePath(note.category, note.title, note._id)
    const url  = `${window.location.origin}${path}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  // ─── PDF / Download ─────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!note) return

    const noteUser       = typeof note.user === 'string' ? null : note.user
    const noteUserLine   = noteUser
      ? `${noteUser.name} ${noteUser.surname} (@${noteUser.username})`
      : ''
    const exportDate     = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
    const createdAtLine  = note.createdAt
      ? new Date(note.createdAt).toLocaleString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : ''
    const coverImageUrl  = note.cover ? getImageUrl(note.cover) : null
    const coverHtml      =
      note.category === 'general' && note.coverColor
        ? `<div class="cover-solid" style="background:${note.coverColor};"></div>`
        : coverImageUrl
          ? `<img class="cover-img" src="${coverImageUrl}" alt="${note.title}" crossorigin="anonymous" />`
          : ''

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${note.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; background: #fff; }
    body { font-family: 'Nunito', sans-serif; color: #1a1a2e; line-height: 1.75; }
    .cover-img  { display: block; width: 100%; height: 300px; object-fit: cover; }
    .cover-solid { width: 100%; height: 300px; }
    .wrapper { width: 90%; margin: 0 auto; padding: 48px 0 72px; }
    header { border-bottom: 3px solid #f59e0b; padding-bottom: 28px; margin-bottom: 36px; }
    h1 { font-size: 38px; font-weight: 800; color: #111827; line-height: 1.2; margin-bottom: 12px; letter-spacing: -0.5px; }
    .meta-line { font-family: 'Courier New', monospace; font-size: 13px; color: #9ca3af; margin-bottom: 4px; }
    .description { font-size: 15px; color: #4b5563; font-style: italic; margin-top: 12px; line-height: 1.6; }
    .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #9ca3af; margin-bottom: 16px; font-family: 'Courier New', monospace; }
    .content-box { background: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 36px 44px; }
    .content-box p { margin-bottom: 14px; font-size: 15px; color: #374151; }
    .content-box p:last-child { margin-bottom: 0; }
    .content-box h1 { font-size: 22px; font-weight: 700; color: #111827; margin: 22px 0 10px; }
    .content-box h2 { font-size: 19px; font-weight: 700; color: #111827; margin: 20px 0 10px; }
    .content-box h3 { font-size: 16px; font-weight: 700; color: #111827; margin: 18px 0 8px; }
    .content-box ul, .content-box ol { margin: 10px 0 14px 24px; }
    .content-box li { margin-bottom: 6px; font-size: 15px; color: #374151; }
    .content-box blockquote { border-left: 3px solid #d1d5db; padding-left: 18px; color: #6b7280; font-style: italic; margin: 16px 0; }
    .content-box strong { color: #111827; }
    .content-box em { color: #4b5563; }
    .content-box code { font-family: 'Courier New', monospace; background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .content-box pre { background: #e5e7eb; padding: 18px; border-radius: 6px; margin: 16px 0; font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; }
    .content-box img { display: block; max-width: 100%; height: auto; object-fit: contain; border-radius: 6px; margin: 20px 0; }
    .empty { color: #9ca3af; font-style: italic; font-size: 15px; }
    footer { margin-top: 56px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-family: 'Courier New', monospace; font-size: 11px; color: #d1d5db; display: flex; justify-content: space-between; }
    @media print {
      .cover-img, .cover-solid { height: 240px; }
      .wrapper { width: 90%; padding: 36px 0 52px; }
      @page { size: A4; margin: 0mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .content-box img { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  ${coverHtml}
  <div class="wrapper">
    <header>
      <h1>${note.title}</h1>
      ${note.author     ? `<p class="meta-line">by ${note.author}</p>` : ''}
      ${noteUserLine    ? `<p class="meta-line">Note by: ${noteUserLine}</p>` : ''}
      ${createdAtLine   ? `<p class="meta-line" style="font-size:12px;color:#b3b3b3;margin-top:4px;">Added on ${createdAtLine}</p>` : ''}
      ${note.description? `<p class="description">${note.description}</p>` : ''}
    </header>
    <main>
      <p class="section-label">Notes &amp; Thoughts</p>
      <div class="content-box">
        ${content || '<p class="empty">No notes written yet.</p>'}
      </div>
    </main>
    <footer>
      <span>Exported on ${exportDate}</span>
      <span>ReadShelf</span>
    </footer>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close() }<\/script>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const win  = window.open(url, '_blank', 'width=1300,height=800')
    if (win) win.onload = () => URL.revokeObjectURL(url)
  }


 


  // ─── Save note content ──────────────────────────────────────────────────────
  const handleSaveContent = async () => {
    if (!note) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('content',  content)
      fd.append('title',    note.title)
      fd.append('category', note.category)
      fd.append('status',   note.status)
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

  // ─── Delete note ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!note || !confirm('Delete this note? This cannot be undone.')) return
    await deleteNote(note._id)
    navigate('/dashboard')
  }

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!note) return null

  const Icon     = CATEGORY_ICONS[note.category] ?? StickyNote
  const noteUser = typeof note.user === 'string' ? null : note.user
  const isOwner  = currentUser?._id === noteUser?._id

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <div className="relative h-72 overflow-hidden">
        {note.category === 'general' ? (
          <div className="w-full h-full" style={{ backgroundColor: note.coverColor }} />
        ) : note.cover ? (
          <img
            src={getImageUrl(note.cover)}
            alt={note.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-ink-900 flex items-center justify-center">
            <Icon size={56} className="text-ink-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 flex items-center gap-2 bg-ink-950/60 backdrop-blur-sm border border-ink-700/50 px-3 py-2 rounded-xl text-sm text-ink-300 hover:text-ink-100 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <button
          onClick={scrollToBottom}
          className="absolute bottom-1 right-24 z-50 flex items-center gap-1.5 bg-ink-950/60 backdrop-blur-sm border border-ink-700/50 px-3 py-2 rounded-xl text-xs text-ink-400 hover:text-ink-100 transition-colors"
        >
          <ChevronDown size={13} />
          Scroll Down
        </button>

        {/* Action buttons — top right */}
        <div className="absolute top-5 right-5 flex items-center gap-2 flex-wrap justify-end">

          {/* Share — only for public notes */}
          {note.isPublic && (
            <button
              onClick={handleShare}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${
                copied
                  ? 'bg-green-500/15 border-green-500/30 text-green-400'
                  : 'bg-ink-950/60 backdrop-blur-sm border-ink-700/50 text-ink-300 hover:text-ink-100'
              }`}
            >
              {copied ? <Check size={15} /> : <Share2 size={15} />}
              {copied ? 'Copied!' : 'Share'}
            </button>
          )}

          {/* Download / PDF */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-ink-950/60 backdrop-blur-sm border border-ink-700/50 px-3 py-2 rounded-xl text-ink-300 hover:text-ink-100 transition-colors text-sm"
          >
            <Download size={15} />
            Download
          </button>

          {isOwner && (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-ink-950/60 backdrop-blur-sm border border-ink-700/50 p-2 rounded-xl text-ink-400 hover:text-ink-100 transition-colors"
                title="Edit note info"
              >
                <Edit3 size={15} />
              </button>
              <button
                onClick={handleDelete}
                className="bg-ink-950/60 backdrop-blur-sm border border-ink-700/50 p-2 rounded-xl text-ink-400 hover:text-rose-400 transition-colors"
                title="Delete note"
              >
                <Trash2 size={15} />
              </button>
            </>
          ) }
        </div>
      </div>

      {/* ── Body ── */}
      <div className="xl:w-[90%] lg:w-[95%] w-full mx-auto px-4 -mt-20 relative z-10 pb-24">

        {/* Author card — only shown when viewing someone else's note */}
        {noteUser && !isOwner && (
          <div className="bg-ink-900/90 backdrop-blur-sm border border-ink-800 rounded-xl p-4 flex items-center gap-3 mb-6">
            {noteUser.avatar ? (
              <img
                src={getImageUrl(noteUser.avatar)}
                alt={noteUser.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-amber-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-200 truncate">
                {noteUser.name} {noteUser.surname}
              </p>
              <p className="text-xs text-ink-500 font-mono truncate">@{noteUser.username}</p>
            </div>
          </div>
        )}

        {/* Category + Status + Visibility */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 bg-ink-900 border border-ink-800 px-3 py-1.5 rounded-lg">
            <Icon size={13} className="text-amber-400" />
            <span className="text-xs font-medium text-ink-300 capitalize">{note.category}</span>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${STATUS_COLORS[note.status]}`}>
            {STATUS_LABELS[note.status]}
          </span>
          <span className="ml-auto" title={note.isPublic ? 'Public' : 'Private'}>
            {note.isPublic
              ? <Globe size={14} className="text-ink-500" />
              : <Lock  size={14} className="text-ink-700" />
            }
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl font-bold text-ink-50 mb-3 leading-tight">
          {note.title}
        </h1>

        {/* Author / book author */}
        {note.author && (
          <p className="text-ink-500 font-mono text-sm mb-2">by {note.author}</p>
        )}

        {/* Description */}
        {note.description && (
          <p className="text-ink-400 text-base leading-relaxed mb-4">{note.description}</p>
        )}

        {/* External link */}
        {note.link && (
          <a
            href={note.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors mb-6 font-mono break-all"
          >
            <ExternalLink size={14} className="flex-shrink-0" />
            {note.link.length > 70 ? note.link.slice(0, 70) + '…' : note.link}
          </a>
        )}

        {/* ── Notes & Thoughts ── */}
        <div className="border-t border-ink-800 mt-6 pt-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-ink-200">Notes & Thoughts</h2>

            {isOwner && (
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
                      {saving ? 'Saving…' : 'Save'}
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
            )}
          </div>

          {editing ? (
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your notes, reflections, key takeaways…"
            />
          ) : content ? (
            <div className="bg-ink-900 border border-ink-800 rounded-2xl px-6 py-5">
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          ) : isOwner ? (
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-ink-900 border border-dashed border-ink-800 rounded-2xl px-6 py-16 text-center text-ink-600 hover:border-amber-500/30 hover:text-ink-500 transition-all group"
            >
              <Edit3 size={24} className="mx-auto mb-3 text-ink-700 group-hover:text-ink-500 transition-colors" />
              <p className="text-sm">Click to add your notes and reflections…</p>
            </button>
          ) : (
            <div className="bg-ink-900 border border-dashed border-ink-800 rounded-2xl px-6 py-16 text-center text-ink-600">
              <StickyNote size={24} className="mx-auto mb-3 text-ink-700" />
              <p className="text-sm">No notes written yet.</p>
            </div>
          )}
        </div>

      </div>

      {/* ── Edit Note Modal ── */}
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


        <button
          onClick={scrollToTop}
          className="fixed bottom-10 right-8 z-50 w-11 h-11 bg-amber-500 hover:bg-amber-400 text-ink-950 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 transition-all"
          title="Back to top"
        >
          <ChevronUp size={20} />
        </button>
    </div>
  )
}