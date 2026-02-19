import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, LayoutDashboard, User, LogOut, Compass, Bell, Menu, ChevronLeft } from 'lucide-react'
import { getImageUrl } from '../services/api'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Collapse sidebar on every route change (all screen sizes)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }:{isActive:boolean}) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
        : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800'
    }`

  return (
    <div className="flex h-screen bg-ink-950 overflow-hidden">
      {/* Overlay — all screen sizes */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always off-canvas, slides in when open */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0
          bg-ink-900 border-r border-ink-800 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo + close */}
        <div className="p-6 border-b border-ink-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gold-shimmer rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-ink-950" />
            </div>
            <span className="font-display text-lg font-semibold text-ink-50">NoteVault</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-md text-ink-400 hover:text-ink-100 hover:bg-ink-800 transition-colors"
            aria-label="Close sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard size={17} />
            Dashboard
          </NavLink>
          <NavLink to="/discover" className={navLinkClass}>
            <Compass size={17} />
            Discover
          </NavLink>
          <NavLink to="/notifications" className={navLinkClass}>
            <Bell size={17} />
            Notifications
          </NavLink>
          <NavLink to="/profile" className={navLinkClass}>
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
        {/* Top bar with menu toggle — always visible on all screen sizes */}
        <div className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 bg-ink-950/80 backdrop-blur border-b border-ink-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-ink-400 hover:text-ink-100 hover:bg-ink-800 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 gold-shimmer rounded-md flex items-center justify-center">
              <BookOpen size={12} className="text-ink-950" />
            </div>
            <span className="font-display text-base font-semibold text-ink-50">NoteVault</span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  )
}