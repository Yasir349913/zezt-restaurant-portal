import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get user ID from your auth system (localStorage, context, etc.)
    const userId = localStorage.getItem("userId"); // Adjust based on your auth
    const token = localStorage.getItem("authToken"); // Your JWT token

    if (!userId) return;

    // Connect to your backend
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to notification service");
      setIsConnected(true);

      // Join notification room
      newSocket.emit("join_notification_room", { userId });
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from notification service");
      setIsConnected(false);
    });

    // Listen for restaurant notifications
    newSocket.on("restaurant_notification", (notification) => {
      console.log("🔔 New notification:", notification);

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if permitted
      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/notification-icon.png",
          badge: "/badge-icon.png",
        });
      }
    });

    // Listen for unread count updates
    newSocket.on("unread_notification_count", ({ count }) => {
      console.log("📊 Unread count:", count);
      setUnreadCount(count);
    });

    setSocket(newSocket);

    // Fetch initial notifications from REST API
    fetchInitialNotifications(userId, token);

    return () => newSocket.close();
  }, []);

  const fetchInitialNotifications = async (userId, token) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/notifications/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.pagination.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = (notificationId) => {
    if (!socket) return;

    socket.emit("mark_notification_read", {
      notificationId,
      userId: localStorage.getItem("userId"),
    });

    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("authToken");

    try {
      // Call your backend API to mark all as read
      await fetch(
        `http://localhost:5000/api/admin/notifications/mark-all-read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};
