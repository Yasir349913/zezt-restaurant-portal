import React, { useState, useEffect } from "react";
import { useSocket } from "../../../context/SocketContext";
import {
  Bell,
  CheckCheck,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Notificationslayout() {
  const { notifications, unreadCount, markAsRead, isConnected } = useSocket();

  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter((n) => !n.isRead);
      for (const notif of unreadNotifs) {
        await markAsRead(notif._id);
      }
      console.log("✅ All marked as read");
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  // ✅ NEW: Handle notification click - marks as read
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
        console.log("✅ Marked as read:", notification._id);
      } catch (error) {
        console.error("❌ Failed to mark as read:", error);
      }
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread" && notification.isRead) return false;
    if (filter === "read" && !notification.isRead) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  const getNotificationIcon = (type) => {
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
    if (type?.includes("approved") || type?.includes("confirmed"))
      return "bg-green-100 text-green-800";
    if (
      type?.includes("rejected") ||
      type?.includes("suspended") ||
      type?.includes("cancelled")
    )
      return "bg-red-100 text-red-800";
    if (type?.includes("payment") || type?.includes("stripe"))
      return "bg-blue-100 text-blue-800";
    if (type?.includes("urgent")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 xl:ml-64 pt-14 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="text-teal-600" size={28} />
                Notifications
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${
                      unreadCount !== 1 ? "s" : ""
                    }`
                  : "All caught up!"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isConnected
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-yellow-500"
                  }`}
                ></span>
                {isConnected ? "Connected" : "Reconnecting..."}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === "all"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === "unread"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter("read")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === "read"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Read ({notifications.length - unreadCount})
                </button>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <CheckCheck size={16} />
                    Mark all read
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {paginatedNotifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery
                  ? "No notifications found"
                  : "No notifications yet"}
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "You're all caught up! New notifications will appear here."}
              </p>
            </div>
          ) : (
            <>
              {paginatedNotifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)} // ✅ Added click handler
                  className={`p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3
                            className={`text-sm font-semibold mb-1 ${
                              !notification.isRead
                                ? "text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>

                          {notification.restaurantId?.restaurantName && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                {notification.restaurantId.restaurantName}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatTime(notification.createdAt)}</span>
                            <span className="text-gray-300">•</span>
                            <span>{formatDate(notification.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // ✅ Prevent parent click
                                markAsRead(notification._id);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <CheckCheck size={18} />
                            </button>
                          )}
                          <div
                            className={`w-2 h-2 rounded-full ${
                              !notification.isRead
                                ? "bg-blue-600"
                                : "bg-transparent"
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredNotifications.length
                      )}{" "}
                      of {filteredNotifications.length} notifications
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
