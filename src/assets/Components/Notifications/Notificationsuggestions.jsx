// src/components/Notifications/Notificationsuggestions.jsx
import React, { useEffect, useState } from "react";
import Notificationslist from "./Notificationslist";
import {
  fetchUserNotifications,
  markNotificationAsRead,
} from "../../../api/services/Notificationservices";
import { useAuth } from "../../../context/AuthContext"; // if you have auth context, else pass userId as prop

const Notificationsuggestions = ({ activeTab = "All", userIdProp = null }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Try to get userId from auth context if available, otherwise use prop
  let userId = userIdProp;
  try {
    const auth = useAuth?.(); // optional: if you have hook
    if (!userId && auth?.user?.id) userId = auth.user.id;
  } catch (e) {
    // ignore if hook not present
  }

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!userId) {
        console.warn("No userId provided to Notificationsuggestions");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { notifications: items } = await fetchUserNotifications(userId, {
          page: 1,
          limit: 100,
        });
        if (!mounted) return;
        // your UI uses isUnread; backend has isRead flag => map to isUnread
        const normalized = items.map((n) => ({ ...n, isUnread: !n.isRead }));
        setNotifications(normalized);
      } catch (err) {
        console.error("Failed to load notifications:", err);
        if (mounted) setNotifications([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const handleMarkRead = async (id) => {
    if (!userId) return alert("User not identified");
    try {
      const updated = await markNotificationAsRead(id, userId);
      // backend returns the updated notification in data
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id || n.id === id
            ? { ...n, isRead: true, isUnread: false, ...updated }
            : n
        )
      );
    } catch (err) {
      console.error("Mark read failed:", err);
      alert("Failed to mark notification as read");
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "Unread":
        return notifications.filter((n) => n.isUnread);

      case "All":
      default:
        return notifications;
    }
  };

  const filtered = getFilteredNotifications();

  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-base font-medium text-gray-900">
          {activeTab === "All" ? "Notifications" : `${activeTab} Notifications`}
        </h2>
      </div>

      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="py-8 px-4 text-center text-gray-500">Loading...</div>
        ) : filtered.length > 0 ? (
          filtered.map((notification) => (
            <Notificationslist
              key={notification._id || notification.id}
              id={notification._id || notification.id}
              title={notification.title}
              description={notification.description}
              time={new Date(
                notification.createdAt || notification.time
              ).toLocaleString()}
              isUnread={notification.isUnread}
              onMarkRead={() =>
                handleMarkRead(notification._id || notification.id)
              }
            />
          ))
        ) : (
          <div className="py-8 px-4 text-center text-gray-500">
            <p>No {activeTab.toLowerCase()} notifications found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notificationsuggestions;
