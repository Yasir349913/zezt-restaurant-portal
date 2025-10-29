// src/api/services/Notificationservices.js
import { http } from "../api";

/**
 * Fetch notifications for a given user with pagination and unread filter.
 * GET /notifications/:userId?page=1&limit=20&unreadOnly=true
 * Returns: { notifications: [...], pagination: {...} }
 */
export const fetchUserNotifications = async (
  userId,
  { page = 1, limit = 20, unreadOnly = false } = {}
) => {
  if (!userId) throw new Error("userId is required");
  const params = { page, limit };
  if (unreadOnly) params.unreadOnly = true;

  const { data } = await http.get(`/notifications/${userId}`, { params });
  // Backend response shape (based on code you showed):
  // { success: true, data: { notifications: [...], pagination: { ... } } }
  const resp = data || {};
  if (!resp.success) {
    // fallback to empty
    return { notifications: [], pagination: null };
  }

  const payload = resp.data || {};
  return {
    notifications: payload.notifications || [],
    pagination: payload.pagination || null,
  };
};

/**
 * Mark a notification as read.
 * PUT /notifications/:notificationId/read
 * Body: { userId }
 * Returns: { notification: { ... } } (based on your backend)
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  if (!notificationId) throw new Error("notificationId is required");
  if (!userId) throw new Error("userId is required");

  const { data } = await http.put(`/notifications/${notificationId}/read`, {
    userId,
  });

  // backend returns { success: true, data: notification }
  if (!data || !data.success) {
    throw new Error("Failed to mark notification as read");
  }

  return data.data || data; // return the notification object
};

/**
 * Convenience: fetch all notifications for current user (no paging) - returns array
 * You can pass a userId or it can be wired to current user at call site.
 */
export const fetchAllNotifications = async (userId, opts = {}) => {
  const { notifications } = await fetchUserNotifications(userId, {
    page: 1,
    limit: 1000,
    ...opts,
  });
  return notifications;
};

/**
 * Convenience used by notification cards - returns summary items
 * Example result: [{ name: "Unread", number: 5, percentage: 12 }, ...]
 * Here we compute simple counts from the notifications endpoint.
 */
export const fetchNotificationsItems = async (userId) => {
  const { notifications } = await fetchUserNotifications(userId, {
    page: 1,
    limit: 1000,
  });

  const total = notifications.length;
  const unread = notifications.filter((n) => !n.isRead).length;
  // example business logic — adapt as needed
  const bookings = notifications.filter((n) => n.category === "booking").length;
  const deals = notifications.filter((n) => n.category === "deal").length;

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
