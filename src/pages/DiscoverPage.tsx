import { useState, useEffect, useCallback } from 'react'
import { Note, NoteCategory, NoteStatus } from '../types'
import { discoverNotes } from '../services/api'
import NoteCard from '../components/NoteCard'
import { Search, Compass } from 'lucide-react'

const CATEGORIES: { value: NoteCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'book', label: 'Books' },
  { value: 'video', label: 'Videos' },
  { value: 'article', label: 'Articles' },
  { value: 'course', label: 'Courses' },
  { value: 'general', label: 'General' },
]

const STATUSES: { value: NoteStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'currently_reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
  { value: 'will_repeat', label: 'Will Repeat' },
  { value: 'repeated', label: 'Repeated' },
]

export default function DiscoverPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<NoteCategory | 'all'>('all')
  const [status, setStatus] = useState<NoteStatus | 'all'>('all')

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { limit: 50 }
      if (category !== 'all') params.category = category
      if (status !== 'all') params.status = status
      if (search) params.search = search
      const res = await discoverNotes(params)
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

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-center">
            <Compass size={20} className="text-amber-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-50">Discover</h1>
        </div>
        <p className="text-ink-500 text-sm">Explore public notes from the community</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-600" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full bg-ink-900 border border-ink-800 rounded-xl pl-10 pr-4 py-2.5 text-ink-100 placeholder-ink-600 focus:outline-none focus:border-amber-500/40 transition-colors text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <div className="flex gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-all ${
                category === c.value
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'border-ink-800 text-ink-500 hover:border-ink-600 hover:text-ink-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="w-px bg-ink-800" />
        <div className="flex gap-2">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-all ${
                status === s.value
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'border-ink-800 text-ink-500 hover:border-ink-600 hover:text-ink-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-ink-900 border border-ink-800 rounded-xl h-72 animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Compass size={48} className="text-ink-700 mb-4" />
          <h3 className="font-display text-xl font-semibold text-ink-400 mb-2">No notes found</h3>
          <p className="text-ink-600 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map(note => (
            <NoteCard key={note._id} note={note} onDelete={() => {}} />
          ))}
        </div>
      )}
    </div>
  )
}
