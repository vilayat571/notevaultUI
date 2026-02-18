import { useState, useEffect, useCallback } from 'react'
import { Note, NoteCategory, NoteStatus } from '../types'
import { getMyNotes, deleteNote, reorderNotes } from '../services/api'
import NoteCard from '../components/NoteCard'
import NoteModal from '../components/NoteModal'
import { Plus, Search, SlidersHorizontal, BookOpen, Video, FileText, GraduationCap, StickyNote, Layers } from 'lucide-react'

const CATEGORIES: { value: NoteCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: Layers },
  { value: 'book', label: 'Books', icon: BookOpen },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'article', label: 'Articles', icon: FileText },
  { value: 'course', label: 'Courses', icon: GraduationCap },
  { value: 'general', label: 'General', icon: StickyNote },
]

const STATUSES: { value: NoteStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'currently_reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
  { value: 'will_repeat', label: 'Will Repeat' },
  { value: 'repeated', label: 'Repeated' },
]

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<NoteCategory | 'all'>('all')
  const [status, setStatus] = useState<NoteStatus | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (category !== 'all') params.category = category
      if (status !== 'all') params.status = status
      if (search) params.search = search
      const res = await getMyNotes(params)
      setNotes(res.data.notes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [category, status, search])

  useEffect(() => {
    const timeout = setTimeout(fetchNotes, 300)
    return () => clearTimeout(timeout)
  }, [fetchNotes])

  const handleDelete = async (id: string) => {
    await deleteNote(id)
    setNotes(prev => prev.filter(n => n._id !== id))
  }

  // Drag and drop
  const handleDragStart = (id: string) => setDraggedId(id)
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDragOverId(id)
  }
  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return

    const oldIndex = notes.findIndex(n => n._id === draggedId)
    const newIndex = notes.findIndex(n => n._id === targetId)
    const reordered = [...notes]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    setNotes(reordered)

    const updates = reordered.map((n, i) => ({ id: n._id, order: i }))
    await reorderNotes(updates)
    setDraggedId(null)
    setDragOverId(null)
  }

  const countByCategory = (cat: NoteCategory | 'all') =>
    cat === 'all' ? notes.length : notes.filter(n => n.category === cat).length

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink-50 mb-1">My Notes</h1>
          <p className="text-ink-500 text-sm">{notes.length} {notes.length === 1 ? 'note' : 'notes'} in your vault</p>
        </div>
        <button
          onClick={() => { setEditingNote(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-ink-950 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30"
        >
          <Plus size={17} />
          New Note
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-ink-900 border border-ink-800 rounded-xl pl-10 pr-4 py-2.5 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/40 transition-colors text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFilters || status !== 'all'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'border-ink-800 text-ink-500 hover:text-ink-200 hover:border-ink-600'
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

      {/* Status filter */}
      {showFilters && (
        <div className="flex gap-2 flex-wrap mb-6 animate-slide-up">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                status === s.value
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'border-ink-800 text-ink-500 hover:border-ink-600 hover:text-ink-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {CATEGORIES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border whitespace-nowrap transition-all ${
              category === value
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                : 'border-ink-800 text-ink-500 hover:text-ink-200 hover:border-ink-700'
            }`}
          >
            <Icon size={14} />
            {label}
            {countByCategory(value) > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                category === value ? 'bg-amber-500/20 text-amber-400' : 'bg-ink-800 text-ink-600'
              }`}>
                {countByCategory(value)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-ink-900 border border-ink-800 rounded-xl h-72 animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 bg-ink-900 border border-ink-800 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-ink-700" />
          </div>
          <h3 className=" text-xl font-semibold text-ink-400 mb-2">No notes yet</h3>
          <p className="text-ink-600 text-sm mb-6">Start by adding your first book, article or video</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-ink-950 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
          >
            <Plus size={16} />
            Add your first note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map(note => (
            <div
              key={note._id}
              draggable
              onDragStart={() => handleDragStart(note._id)}
              onDragOver={e => handleDragOver(e, note._id)}
              onDrop={e => handleDrop(e, note._id)}
              onDragEnd={() => { setDraggedId(null); setDragOverId(null) }}
              className={`transition-all duration-200 ${dragOverId === note._id && draggedId !== note._id ? 'scale-105 ring-2 ring-amber-500/40 rounded-xl' : ''}`}
            >
              <NoteCard
                note={note}
                onDelete={handleDelete}
                isDragging={draggedId === note._id}
              />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NoteModal
          onClose={() => setShowModal(false)}
          editingNote={editingNote}
          onSaved={() => {
            setShowModal(false)
            fetchNotes()
          }}
        />
      )}
    </div>
  )
}
