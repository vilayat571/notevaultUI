import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DiscoverPage from './pages/DiscoverPage'
import NotificationsPage from './pages/NotificationsPage'
import NotePage from './pages/NotePage'
import ProfilePage from './pages/ProfilePage'
import Layout from './components/Layout'
import LandingPage from './pages/Landing'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, loading } = useAuth()
  if (loading) return null
  return !token ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/notes/:id" element={<NotePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}