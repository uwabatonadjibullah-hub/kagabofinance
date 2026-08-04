import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Clock, CheckCheck } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastReadTime, setLastReadTime] = useState(() => {
    const saved = localStorage.getItem('kagabo_notifications_read');
    return saved ? new Date(saved) : new Date(0);
  });
  const dropdownRef = useRef(null);

  const { data: logs } = useCollection('activityLogs', 'timestamp', 'desc');
  const recentLogs = logs.slice(0, 20);

  // Count unread notifications
  const unreadCount = recentLogs.filter(log => {
    const logTime = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
    return logTime > lastReadTime;
  }).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    const now = new Date();
    setLastReadTime(now);
    localStorage.setItem('kagabo_notifications_read', now.toISOString());
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        className="header-notification-btn"
        id="notifications-btn"
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button className="notification-mark-read" onClick={markAllRead}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {recentLogs.length === 0 ? (
              <div className="notification-empty">
                <Bell size={24} style={{ opacity: 0.3 }} />
                <p>No notifications yet</p>
              </div>
            ) : (
              recentLogs.map((log) => {
                const logTime = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
                const isUnread = logTime > lastReadTime;
                return (
                  <div key={log.id} className={`notification-item ${isUnread ? 'unread' : ''}`}>
                    <div className="notification-avatar">{(log.user || '?').charAt(0).toUpperCase()}</div>
                    <div className="notification-content">
                      <p className="notification-text">
                        <strong>{log.user}</strong> {log.action?.toLowerCase()}
                      </p>
                      <p className="notification-meta">
                        <Clock size={11} /> {getRelativeTime(logTime)}
                        <span className="notification-collection">{log.collection}</span>
                      </p>
                    </div>
                    {isUnread && <div className="notification-unread-dot" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
