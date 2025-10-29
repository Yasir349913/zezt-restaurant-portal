import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../../context/NotificationContext";
import { Link } from "react-router-dom";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, isConnected } =
    useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Connection indicator */}
        {!isConnected && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))
            )}
          </div>

          {/* Footer - FIXED */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <Link
                to="/notifications"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => setIsOpen(false)}
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification, onMarkAsRead }) {
  const getIcon = (type) => {
    const icons = {
      restaurant_approved: "✅",
      restaurant_rejected: "❌",
      restaurant_suspended: "⚠️",
      restaurant_reactivated: "🔄",
      payment_confirmed: "💰",
      payment_reminder: "⏰",
      payment_notice: "📢",
      stripe_setup_reminder: "💳",
      new_booking: "📅",
      booking_confirmed: "✔️",
      booking_cancelled: "❌",
      upgrade_reminder: "⬆️",
      urgent_upgrade_reminder: "🚨",
    };
    return icons[type] || "📢";
  };

  const getTypeColor = (type) => {
    if (type.includes("approved") || type.includes("confirmed"))
      return "text-green-600";
    if (
      type.includes("rejected") ||
      type.includes("suspended") ||
      type.includes("cancelled")
    )
      return "text-red-600";
    if (type.includes("payment") || type.includes("stripe"))
      return "text-blue-600";
    if (type.includes("urgent")) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div
      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
        !notification.isRead ? "bg-blue-50" : ""
      }`}
      onClick={() => !notification.isRead && onMarkAsRead(notification._id)}
    >
      <div className="flex items-start space-x-3">
        <span
          className={`text-2xl flex-shrink-0 ${getTypeColor(
            notification.type
          )}`}
        >
          {getIcon(notification.type)}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium ${
              !notification.isRead ? "text-gray-900" : "text-gray-700"
            }`}
          >
            {notification.title}
          </p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          {notification.restaurantName && (
            <p className="text-xs text-gray-500 mt-1">
              {notification.restaurantName}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {formatTime(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
        )}
      </div>
    </div>
  );
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}
