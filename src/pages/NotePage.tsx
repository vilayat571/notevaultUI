import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Note, Comment, User as UserType } from '../types'
import { getSingleNote, editNote, deleteNote, getImageUrl, getComments, addComment, deleteComment, downloadNote, sendFollowRequest, unfollowUser } from '../services/api'
import { ArrowLeft, Edit3, Trash2, Save, BookOpen, Video, FileText, GraduationCap, StickyNote, ExternalLink, Globe, Lock, X, Download, MessageCircle, Send, User, UserPlus, UserMinus } from 'lucide-react'
import NoteModal from '../components/NoteModal'
import RichTextEditor from '../components/RichTextEditor'
import { useAuth } from '../context/AuthContext'

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
  const { user: currentUser } = useAuth()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    getSingleNote(id)
      .then(res => {
        setNote(res.data.note)
        setContent(res.data.note.content || '')
        // Check if following
        const noteUser = res.data.note.user as UserType
        setIsFollowing(currentUser?.following?.includes(noteUser._id) || false)
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
    
    // Fetch comments
    getComments(id)
      .then(res => setComments(res.data.comments))
      .catch(console.error)
  }, [id])

  const handleDownload = async () => {
    if (!note) return
    try {
      const res = await downloadNote(note._id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${note.title}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error(err)
    }
  }

  const handleFollowToggle = async () => {
    if (!note || typeof note.user === 'string') return
    setFollowLoading(true)
    try {
      if (isFollowing) {
        await unfollowUser(note.user._id)
        setIsFollowing(false)
      } else {
        await sendFollowRequest(note.user._id)
        alert('Follow request sent!')
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed')
    } finally {
      setFollowLoading(false)
    }
  }

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
  const noteUser = typeof note.user === 'string' ? null : note.user
  const isOwner = currentUser?._id === noteUser?._id

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
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 bg-ink-950/60 backdrop-blur-sm border border-ink-700/50 px-3 py-2 rounded-xl text-sm text-ink-300 hover:text-ink-100 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        {/* Actions */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          {note.isPublic && (
            <button
              onClick={handleDownload}
              className="bg-ink-950/60 backdrop-blur-sm border border-ink-700/50 px-3 py-2 rounded-xl text-ink-300 hover:text-ink-100 transition-colors text-sm flex items-center gap-2"
            >
              <Download size={15} />
              Download
            </button>
          )}
          {isOwner ? (
            <>
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
            </>
          ) : noteUser && (
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isFollowing
                  ? 'bg-ink-950/60 backdrop-blur-sm border border-ink-700/50 text-ink-400 hover:text-rose-400'
                  : 'bg-amber-500 hover:bg-amber-400 text-ink-950'
              }`}
            >
              {isFollowing ? <UserMinus size={15} /> : <UserPlus size={15} />}
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="xl:w-[90%] lg:w-9/10 md:w-full sm:w-full mx-auto px-4 -mt-16 relative z-10 pb-20">
        {/* Author card */}
        {noteUser && !isOwner && (
          <div className="bg-ink-900 border border-ink-800 rounded-xl p-4 flex items-center gap-3 mb-6">
            {noteUser.avatar ? (
              <img src={getImageUrl(noteUser.avatar)} alt={noteUser.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <User size={18} className="text-amber-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-ink-200">{noteUser.name} {noteUser.surname}</p>
              <p className="text-xs text-ink-500 font-mono">@{noteUser.username}</p>
            </div>
          </div>
        )}

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
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your notes, reflections, key takeaways..."
            />
          ) : content ? (
            <div className="bg-ink-900 border border-ink-800 rounded-2xl px-6 py-5">
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
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

        {/* Comments section - only for public notes */}
        {note.isPublic && (
          <div className="mt-12 border-t border-ink-800 pt-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle size={18} className="text-ink-500" />
              <h2 className="font-display text-xl font-semibold text-ink-200">
                Comments ({comments.length})
              </h2>
            </div>

            {/* Add comment form */}
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

            {/* Comments list */}
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment._id} className="bg-ink-900 border border-ink-800 rounded-xl p-4 animate-slide-up">
                  <div className="flex items-start gap-3">
                    {comment.user.avatar ? (
                      <img
                        src={getImageUrl(comment.user.avatar)}
                        alt={comment.user.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-400 text-xs font-semibold">
                          {comment.user.name[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-ink-200">
                          {comment.user.name} {comment.user.surname}
                        </span>
                        <span className="text-xs text-ink-600 font-mono">
                          @{comment.user.username}
                        </span>
                        <span className="text-xs text-ink-700">·</span>
                        <span className="text-xs text-ink-600">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
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
        )}
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
