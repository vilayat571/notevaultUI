import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, LayoutDashboard, User, LogOut } from 'lucide-react'
import { getImageUrl } from '../services/api'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-ink-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-ink-900 border-r border-ink-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-ink-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gold-shimmer rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-ink-950" />
            </div>
            <span className="font-display text-lg font-semibold text-ink-50">NoteVault</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800'
              }`
            }
          >
            <LayoutDashboard size={17} />
            Dashboard
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800'
              }`
            }
          >
            <User size={17} />
            Profile
          </NavLink>
        </nav>

        {/* User block */}
        <div className="p-4 border-t border-ink-800">
          <div className="flex items-center gap-3 mb-3">
            {user?.avatar ? (
              <img
                src={getImageUrl(user.avatar)}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-ink-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <span className="text-amber-400 font-semibold text-sm">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-100 truncate">{user?.name} {user?.surname}</p>
              <p className="text-xs text-ink-500 truncate">@{user?.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
