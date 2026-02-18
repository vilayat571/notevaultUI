import { Note } from '../types'
import { useNavigate } from 'react-router-dom'
import { getImageUrl } from '../services/api'
import { BookOpen, Video, FileText, GraduationCap, StickyNote, Globe, Lock, Trash2 } from 'lucide-react'

const CATEGORY_ICONS = {
  book: BookOpen,
  video: Video,
  article: FileText,
  course: GraduationCap,
  general: StickyNote,
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  currently_reading: { label: 'Reading', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  finished: { label: 'Finished', color: 'text-sage-400 bg-sage-500/10 border-green-500/20' },
  will_repeat: { label: 'Will Repeat', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  repeated: { label: 'Repeated', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
}

interface Props {
  note: Note
  onDelete: (id: string) => void
  isDragging?: boolean
}

export default function NoteCard({ note, onDelete, isDragging }: Props) {
  const navigate = useNavigate()
  const Icon = CATEGORY_ICONS[note.category]
  const statusInfo = STATUS_LABELS[note.status]

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this note?')) onDelete(note._id)
  }

  return (
    <div
      onClick={() => navigate(`/notes/${note._id}`)}
      className={`group relative bg-ink-900 border border-ink-800 rounded-xl overflow-hidden cursor-pointer
        transition-all duration-300 hover:border-ink-600 hover:shadow-xl hover:shadow-black/30
        hover:-translate-y-0.5 animate-fade-in
        ${isDragging ? 'opacity-50 scale-95 rotate-1' : ''}`}
    >
      {/* Cover */}
      <div className="relative h-36 overflow-hidden">
        {note.category === 'general' ? (
          <div
            className="w-full h-full flex items-end p-4"
            style={{ backgroundColor: note.coverColor || '#6c63ff' }}
          >
            <span className="text-white text-lg font-semibold leading-tight line-clamp-2 drop-shadow-sm">
              {note.title}
            </span>
          </div>
        ) : note.cover ? (
          <img
            src={getImageUrl(note.cover)}
            alt={note.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-ink-800 flex items-center justify-center">
            <Icon size={32} className="text-ink-600" />
          </div>
        )}

        {/* Overlay gradient */}
        {note.category !== 'general' && (
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1.5 bg-ink-950/70 backdrop-blur-sm px-2 py-1 rounded-md border border-ink-700/50">
            <Icon size={12} className="text-amber-400" />
            <span className="text-xs font-medium text-ink-300 capitalize">{note.category}</span>
          </div>
        </div>

        {/* Public/Private */}
        <div className="absolute top-3 right-3">
          {note.isPublic
            ? <Globe size={14} className="text-ink-400" />
            : <Lock size={14} className="text-ink-600" />
          }
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {note.category !== 'general' && (
          <h3 className=" text-ink-100 font-semibold text-base leading-snug mb-1 line-clamp-2">
            {note.title}
          </h3>
        )}

        {note.author && (
          <p className="text-xs text-ink-500 mb-2 font-mono">by {note.author}</p>
        )}

        {note.description && (
          <p className="text-sm text-ink-400 line-clamp-2 leading-relaxed">
            {note.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-800">
          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>

          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-ink-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
