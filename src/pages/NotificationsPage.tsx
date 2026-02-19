import { useState, useEffect } from 'react'
import { FollowRequest, Notification as NotificationType } from '../types'
import { getMyFollowRequests, respondToFollowRequest, getImageUrl, getNotifications, markNotificationsRead } from '../services/api'
import { Bell, Check, X, User, UserPlus, UserMinus, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<FollowRequest[]>([])
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [reqRes, notifRes] = await Promise.all([
        getMyFollowRequests(),
        getNotifications()
      ])
      setRequests(reqRes.data.requests)
      setNotifications(notifRes.data.notifications)
      // Mark as read
      await markNotificationsRead()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      await respondToFollowRequest(requestId, action)
      setRequests(prev => prev.filter(r => r._id !== requestId))
    } catch (err) {
      console.error(err)
    }
  }

  const getNotificationText = (notif: NotificationType) => {
    switch (notif.type) {
      case 'follow_request':
        return 'sent you a follow request'
      case 'follow_accepted':
        return 'accepted your follow request'
      case 'follow_removed':
        return 'unfollowed you'
      case 'comment':
        return `commented on "${notif.note?.title || 'your note'}"`
      default:
        return ''
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow_request':
      case 'follow_accepted':
        return <UserPlus size={16} className="text-green-400" />
      case 'follow_removed':
        return <UserMinus size={16} className="text-rose-400" />
      case 'comment':
        return <MessageCircle size={16} className="text-sky-400" />
      default:
        return <Bell size={16} className="text-ink-500" />
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-center">
            <Bell size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-50">Notifications</h1>
            <p className="text-ink-500 text-sm">{requests.length} pending {requests.length === 1 ? 'request' : 'requests'}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-ink-900 border border-ink-800 rounded-xl p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Follow Requests */}
            {requests.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-ink-300 uppercase tracking-wider mb-3">Follow Requests</h2>
                <div className="space-y-3">
                  {requests.map(req => (
                    <div key={req._id} className="bg-ink-900 border border-amber-500/20 rounded-xl p-4 flex items-center gap-4 animate-slide-up">
                      {req.from.avatar ? (
                        <img src={getImageUrl(req.from.avatar)} alt={req.from.name} className="w-12 h-12 rounded-full object-cover border border-ink-700" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                          <User size={20} className="text-amber-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-100">
                          {req.from.name} {req.from.surname}
                        </p>
                        <p className="text-xs text-ink-500 font-mono">@{req.from.username}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRespond(req._id, 'accept')}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 transition-all text-xs font-medium">
                          <Check size={13} />
                          Accept
                        </button>
                        <button onClick={() => handleRespond(req._id, 'decline')}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-ink-700 text-ink-500 hover:text-rose-400 hover:border-rose-500/30 transition-all text-xs">
                          <X size={13} />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Notifications */}
            {notifications.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-ink-300 uppercase tracking-wider mb-3">Recent Activity</h2>
                <div className="space-y-3">
                  {notifications.map(notif => (
                    <div
                      key={notif._id}
                      onClick={() => notif.note && navigate(`/notes/${notif.note._id}`)}
                      className={`bg-ink-900 border border-ink-800 rounded-xl p-4 flex items-center gap-4 animate-slide-up transition-all ${
                        notif.note ? 'cursor-pointer hover:border-ink-600' : ''
                      }`}
                    >
                      {notif.from.avatar ? (
                        <img src={getImageUrl(notif.from.avatar)} alt={notif.from.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center">
                          <User size={18} className="text-ink-600" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink-200">
                          <span className="font-medium">{notif.from.name} {notif.from.surname}</span>{' '}
                          <span className="text-ink-500">{getNotificationText(notif)}</span>
                        </p>
                        <p className="text-xs text-ink-600 mt-0.5">
                          {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {requests.length === 0 && notifications.length === 0 && (
              <div className="bg-ink-900 border border-ink-800 rounded-2xl p-12 text-center">
                <Bell size={32} className="text-ink-700 mx-auto mb-3" />
                <p className="text-ink-500 text-sm">No notifications</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
