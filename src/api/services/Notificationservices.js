// src/api/services/Notificationservices.js
import { http } from "../api";

export const fetchUserNotifications = async (
  userId,
  { page = 1, limit = 20, unreadOnly = false } = {}
) => {
  if (!userId) throw new Error("userId is required");
  const params = { page, limit };
  if (unreadOnly) params.unreadOnly = true;

  // ✅ Correct: No userId in URL
  const { data } = await http.get(`/notifications`, { params });

  console.log("📡 API Response:", data);

  // ✅ FIXED: Backend returns notifications directly, not nested in data.data
  if (!data || !data.success) {
    return { notifications: [], pagination: null };
  }

  // ✅ Notifications are at data.notifications, NOT data.data.notifications
  return {
    notifications: data.notifications || [],
    pagination: null, // Backend doesn't return pagination
  };
};

export const markNotificationAsRead = async (notificationId, userId) => {
  if (!notificationId) throw new Error("notificationId is required");
  if (!userId) throw new Error("userId is required");

  const { data } = await http.patch(`/notifications/${notificationId}/read`, {
    userId,
  });

  if (!data || !data.success) {
    throw new Error("Failed to mark notification as read");
  }

  return data.notification || data;
};

export const fetchAllNotifications = async (userId, opts = {}) => {
  const { notifications } = await fetchUserNotifications(userId, {
    page: 1,
    limit: 1000,
    ...opts,
  });
  return notifications;
};

export const fetchNotificationsItems = async (userId) => {
  const { notifications } = await fetchUserNotifications(userId, {
    page: 1,
    limit: 1000,
  });

  const total = notifications.length;
  const unread = notifications.filter((n) => !n.isRead).length;
  const bookings = notifications.filter((n) => n.type === "new_booking").length;
  const deals = notifications.filter((n) => n.type?.includes("deal")).length;

  return [
    { name: "Total", number: total, percentage: total ? 100 : 0 },
    {
      name: "Unread",
      number: unread,
      percentage: total ? Math.round((unread / total) * 100) : 0,
    },
    {
      name: "Bookings",
      number: bookings,
      percentage: total ? Math.round((bookings / total) * 100) : 0,
    },
    {
      name: "Deals",
      number: deals,
      percentage: total ? Math.round((deals / total) * 100) : 0,
    },
  ];
};
