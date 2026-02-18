import { useState, useEffect, useRef } from 'react'
import { Note, NoteCategory, NoteStatus } from '../types'
import { createNote, editNote } from '../services/api'
import { X, Upload, BookOpen, Video, FileText, GraduationCap, StickyNote } from 'lucide-react'

const CATEGORIES: { value: NoteCategory; label: string; icon: React.ElementType }[] = [
  { value: 'book', label: 'Book', icon: BookOpen },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'article', label: 'Article', icon: FileText },
  { value: 'course', label: 'Course', icon: GraduationCap },
  { value: 'general', label: 'General', icon: StickyNote },
]

const STATUSES: { value: NoteStatus; label: string }[] = [
  { value: 'currently_reading', label: 'Currently Reading' },
  { value: 'finished', label: 'Finished' },
  { value: 'will_repeat', label: 'Will Repeat' },
  { value: 'repeated', label: 'Repeated' },
]

const COLORS = ['#6c63ff', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6']

interface Props {
  onClose: () => void
  onSaved: () => void
  editingNote?: Note | null
}

export default function NoteModal({ onClose, onSaved, editingNote }: Props) {
  const [category, setCategory] = useState<NoteCategory>(editingNote?.category || 'general')
  const [title, setTitle] = useState(editingNote?.title || '')
  const [description, setDescription] = useState(editingNote?.description || '')
  const [author, setAuthor] = useState(editingNote?.author || '')
  const [link, setLink] = useState(editingNote?.link || '')
  const [status, setStatus] = useState<NoteStatus>(editingNote?.status || 'currently_reading')
  const [isPublic, setIsPublic] = useState(editingNote?.isPublic || false)
  const [coverColor, setCoverColor] = useState(editingNote?.coverColor || '#6c63ff')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setCoverFile(f)
    setCoverPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('description', description)
      fd.append('category', category)
      fd.append('status', status)
      fd.append('isPublic', String(isPublic))
      fd.append('coverColor', coverColor)
      if (author) fd.append('author', author)
      if (link) fd.append('link', link)
      if (coverFile) fd.append('cover', coverFile)

      if (editingNote) {
        await editNote(editingNote._id, fd)
      } else {
        await createNote(fd)
      }
      onSaved()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-ink-900 border border-ink-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink-800">
          <h2 className="font-display text-xl font-semibold text-ink-50">
            {editingNote ? 'Edit Note' : 'New Note'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-ink-500 hover:text-ink-100 hover:bg-ink-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Category */}
          <div>
            <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Category</label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setCategory(value)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all duration-200 ${
                    category === value
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                      : 'border-ink-700 text-ink-500 hover:border-ink-500 hover:text-ink-300'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter title..."
              className="w-full bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description..."
              rows={2}
              className="w-full bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm resize-none"
            />
          </div>

          {/* Author (book only) */}
          {category === 'book' && (
            <div>
              <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Author</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Author name..."
                className="w-full bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
              />
            </div>
          )}

          {/* Link (video, article, course) */}
          {['video', 'article', 'course'].includes(category) && (
            <div>
              <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Link</label>
              <input
                type="url"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm font-mono"
              />
            </div>
          )}

          {/* Cover — image or color */}
          {category === 'general' ? (
            <div>
              <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Cover Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setCoverColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${coverColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={coverColor}
                  onChange={e => setCoverColor(e.target.value)}
                  className="w-8 h-8 rounded-full border-2 border-ink-600 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Cover Image</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-ink-700 rounded-xl p-4 text-center cursor-pointer hover:border-amber-500/40 transition-colors"
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Upload size={20} className="text-ink-600" />
                    <span className="text-sm text-ink-600">Click to upload cover</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
          )}

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2 block">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as NoteStatus)}
              className="w-full bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-200">Make public</p>
              <p className="text-xs text-ink-500">Visible to all users</p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isPublic ? 'bg-amber-500' : 'bg-ink-700'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-ink-700 text-ink-400 hover:text-ink-100 hover:border-ink-500 text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-ink-950 text-sm font-semibold transition-all"
          >
            {loading ? 'Saving...' : editingNote ? 'Save Changes' : 'Create Note'}
          </button>
        </div>
      </div>
    </div>
  )
}
