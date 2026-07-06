import React from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle2, AlertCircle, Info, Clock, Trash2, CheckCheck, TrendingUp } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick?: (issueId?: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick 
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.isRead) {
      onMarkAsRead(notif.id);
    }
    if (notif.issueId && onNotificationClick) {
      onNotificationClick(notif.issueId);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Bell size={24} className="text-slate-700" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">Notifications</h2>
            <p className="text-slate-500 text-sm">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={onMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-slate-700 hover:bg-slate-100 rounded-full text-sm font-semibold border-2 border-slate-200 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
            >
              <CheckCheck size={16} />
              Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={onClearAll}
              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-rose-600 hover:bg-rose-50 rounded-full text-sm font-semibold border-2 border-rose-200 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-400 outline-none"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onClick={() => handleNotificationClick(notif)}
            />
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl sm:rounded-4xl p-6 sm:p-12 md:p-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Bell size={48} />
            </div>
            <h3 className="text-xl font-display font-bold mb-2">All Caught Up</h3>
            <p className="text-slate-500 max-w-sm">
              No new notifications. We'll notify you when there are updates
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* Notification card component */
function NotificationCard({ notification, onClick }: { notification: Notification, onClick: () => void }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'StatusUpdate':
        return <CheckCircle2 size={24} />;
      case 'NewIssue':
        return <AlertCircle size={24} />;
      case 'Upvote':
        return <TrendingUp size={24} />;
      case 'System':
        return <Info size={24} />;
      default:
        return <Bell size={24} />;
    }
  };

  const getColor = () => {
    if (notification.priority === 'High') {
      return 'bg-rose-50 text-rose-600 border-rose-100';
    }
    switch (notification.type) {
      case 'StatusUpdate':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'NewIssue':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Upvote':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900 outline-none ${
        notification.isRead 
          ? 'bg-white border-slate-100 opacity-60 hover:opacity-80' 
          : 'bg-white border-slate-200 shadow-soft hover:shadow-soft-lg'
      }`}
    >
      <div className="flex gap-3 sm:gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${getColor()}`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 break-words">
              {notification.title}
              {!notification.isRead && (
                <span className="w-2 h-2 bg-slate-900 rounded-full shrink-0"></span>
              )}
            </h3>
            {notification.priority === 'High' && (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-semibold rounded-full shrink-0">
                High
              </span>
            )}
          </div>
          
          <p className="text-slate-600 text-sm mb-3 break-words">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock size={12} />
              {formatTimestamp(notification.timestamp)}
            </div>
            
            {notification.issueId && (
              <span className="text-xs font-semibold text-slate-700 hover:text-slate-900">
                View Issue →
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short'
  });
}