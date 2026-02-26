import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Globe, Lock, ShieldCheck, Linkedin, ExternalLink,
  BookOpen, Video, FileText, GraduationCap, StickyNote, BookMarked,
} from 'lucide-react'
import { getUserProfile, discoverNotes, getImageUrl } from '../services/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  _id: string
  name: string
  surname: string
  username: string
  avatar: string
  bio?: string
  privacyMode: 'public' | 'private' | 'private_plus'
  linkedinUrl?: string
}

interface Note {
  _id: string
  title: string
  author?: string
  description?: string
  category: string
  status: string
  cover: string
  coverColor: string
  isPublic: boolean
  createdAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  book: BookOpen, video: Video, article: FileText,
  course: GraduationCap, general: StickyNote,
}

const STATUS_COLORS: Record<string, string> = {
  currently_reading: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  finished:          'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  will_repeat:       'text-amber-400 bg-amber-500/10 border-amber-500/20',
  repeated:          'text-violet-400 bg-violet-500/10 border-violet-500/20',
}

const STATUS_LABELS: Record<string, string> = {
  currently_reading: 'Reading', finished: 'Finished',
  will_repeat: 'Will Repeat', repeated: 'Repeated',
}

// ─── Privacy Badge ────────────────────────────────────────────────────────────

function PrivacyBadge({ mode }: { mode: string }) {
  if (mode === 'public') return (
    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
      <Globe size={11} /> Public
    </span>
  )
  if (mode === 'private_plus') return (
    <span className="flex items-center gap-1 text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
      <ShieldCheck size={11} /> Private+
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-ink-400 bg-ink-800 border border-ink-700 px-2.5 py-1 rounded-full">
      <Lock size={11} /> Private
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ avatar, name }: { avatar: string; name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  if (avatar) return (
    <img src={getImageUrl(avatar)} alt={name} className="w-20 h-20 rounded-2xl object-cover border border-ink-700/50 flex-shrink-0" />
  )
  return (
    <div className="w-20 h-20 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
      <span className="font-bold text-amber-400 text-2xl">{initials}</span>
    </div>
  )
}

// ─── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({ note, onClick }: { note: Note; onClick: () => void }) {
  const Icon = CATEGORY_ICONS[note.category] ?? StickyNote
  const hasCover = note.category !== 'general' && note.cover

  return (
    <div
      onClick={onClick}
      className="group bg-ink-900 border border-ink-800 hover:border-ink-700 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
    >
      {/* Cover */}
      <div className="h-28 overflow-hidden">
        {hasCover ? (
          <img src={getImageUrl(note.cover)} alt={note.title} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: note.category === 'general' ? note.coverColor : undefined }}
          >
            {note.category !== 'general' && <Icon size={28} className="text-ink-700" />}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Icon size={11} className="text-amber-400" />
          <span className="text-[10px] text-ink-500 capitalize">{note.category}</span>
        </div>
        <p className="font-semibold text-ink-100 text-sm leading-snug line-clamp-2 mb-1">{note.title}</p>
        {note.author && <p className="text-xs text-ink-500 mb-3">by {note.author}</p>}
        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[note.status] ?? 'text-ink-500 bg-ink-800 border-ink-700'}`}>
          {STATUS_LABELS[note.status] ?? note.status}
        </span>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function NoteSkeleton() {
  return (
    <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-28 bg-ink-800" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-ink-800 rounded-full w-full" />
        <div className="h-3 bg-ink-800 rounded-full w-2/3" />
        <div className="h-5 w-16 bg-ink-800 rounded-full mt-3" />
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [profileLoading, setProfileLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    setProfileLoading(true)
    setNotesLoading(true)

    getUserProfile(userId)
      .then(res => setProfile(res.data.user))
      .catch(console.error)
      .finally(() => setProfileLoading(false))

    // Fetch this user's public notes via discoverNotes?userId=...
    discoverNotes({ limit: 50, skip: 0 } as any)
      .then(res => {
        // Filter client-side by userId since backend may not support it yet
        const all: Note[] = res.data.notes
        setNotes(all.filter((n: any) => {
          const noteUserId = typeof n.user === 'string' ? n.user : n.user?._id
          return noteUserId === userId
        }))
      })
      .catch(console.error)
      .finally(() => setNotesLoading(false))
  }, [userId])

  if (profileLoading) return (
    <div className="min-h-screen bg-ink-950 paper-texture">
      <div className="max-w-3xl mx-auto px-6 py-10 animate-pulse space-y-6">
        <div className="h-5 w-16 bg-ink-800 rounded-lg" />
        <div className="bg-ink-900 border border-ink-800 rounded-2xl p-7">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-ink-800 flex-shrink-0" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-5 bg-ink-800 rounded-full w-40" />
              <div className="h-3 bg-ink-800 rounded-full w-24" />
              <div className="h-3 bg-ink-800 rounded-full w-64" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-ink-950 paper-texture flex items-center justify-center">
      <p className="text-ink-500">User not found</p>
    </div>
  )

  const isPrivate = profile.privacyMode !== 'public'

  return (
    <div className="min-h-screen bg-ink-950 paper-texture">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors mb-6"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Profile Card */}
        <div className="bg-ink-900 border border-ink-800 rounded-2xl p-7 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar avatar={profile.avatar} name={`${profile.name} ${profile.surname}`} />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold text-ink-50">
                  {profile.name} {profile.surname}
                </h1>
                <PrivacyBadge mode={profile.privacyMode} />
              </div>
              <p className="text-ink-500 text-sm mb-4">@{profile.username}</p>

              {profile.bio && !isPrivate && (
                <p className="text-ink-300 text-sm leading-relaxed mb-4">{profile.bio}</p>
              )}

              {isPrivate && (
                <p className="text-ink-600 text-sm italic mb-4 flex items-center gap-1.5">
                  <Lock size={12} /> Bio and notes are hidden for private profiles
                </p>
              )}

              {profile.linkedinUrl && !isPrivate && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors mb-4"
                >
                  <Linkedin size={12} /> LinkedIn <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Public Notes */}
        {!isPrivate && (
          <div className="bg-ink-900 border border-ink-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <BookMarked size={15} className="text-amber-400" />
              <h2 className="font-semibold text-ink-200 text-sm">Public Vault</h2>
              {!notesLoading && (
                <span className="ml-auto text-xs text-ink-600">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            {notesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <NoteSkeleton key={i} />)}
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12">
                <StickyNote size={24} className="mx-auto mb-3 text-ink-700" />
                <p className="text-ink-500 text-sm">No public notes yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {notes.map(note => (
                  <NoteCard key={note._id} note={note} onClick={() => navigate(`/notes/${note._id}`)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Private profile — locked state */}
        {isPrivate && (
          <div className="bg-ink-900 border border-ink-800 rounded-2xl flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-ink-900 border border-ink-800 flex items-center justify-center mb-4">
              {profile.privacyMode === 'private_plus'
                ? <ShieldCheck size={22} className="text-violet-400" />
                : <Lock size={22} className="text-ink-600" />}
            </div>
            <p className="text-ink-300 font-medium mb-1">This vault is private</p>
            <p className="text-ink-600 text-sm max-w-xs">This user's notes and bio are not visible to others</p>
          </div>
        )}

      </div>
    </div>
  )
}