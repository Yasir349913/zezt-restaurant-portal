// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import {
  fetchUserNotifications,
  markNotificationAsRead,
} from "../api/services/Notificationservices";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Load notifications from API
  const loadInitialNotifications = async (userId) => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading notifications for user:", userId);

      const result = await fetchUserNotifications(userId, {
        page: 1,
        limit: 50,
        unreadOnly: false,
      });

      console.log("📥 API Response:", result);

      const fetchedNotifications = result.notifications || [];

      setNotifications(fetchedNotifications);

      // Calculate unread count
      const unread = fetchedNotifications.filter((n) => !n.isRead).length;
      setUnreadCount(unread);

      console.log("✅ Loaded:", fetchedNotifications.length, "notifications");
      console.log("📊 Unread:", unread);

      setIsLoading(false);
    } catch (error) {
      console.error("❌ Error loading notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      console.log("⚠️ No user/token found");
      return;
    }

    const userId = user._id || user.id;
    console.log("👤 User ID:", userId);

    // ✅ Load notifications on mount
    loadInitialNotifications(userId);

    // Initialize socket
    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const newSocket = io(BACKEND_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
      newSocket.emit("join_notification_room", { userId });
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket error:", error);
      setIsConnected(false);
    });

    // Listen for new notifications via socket
    newSocket.on("new_notification", (data) => {
      console.log("🔔 New notification:", data);

      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Browser notification
      if (Notification.permission === "granted") {
        new Notification(data.notification.title, {
          body: data.notification.message,
          icon: "/logo.png",
        });
      }
    });

    // Listen for unread count updates
    newSocket.on("unread_notification_count", (data) => {
      console.log("📊 Unread count update:", data.count);
      setUnreadCount(data.count);
    });

    setSocket(newSocket);

    return () => {
      console.log("🧹 Cleaning up socket");
      newSocket.disconnect();
    };
  }, []);

  // ✅ Mark as read function
  const markAsRead = async (notificationId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user._id || user.id;

      console.log("📝 Marking as read:", notificationId);

      // Call API
      await markNotificationAsRead(notificationId, userId);

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      // Decrease count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Emit socket event
      if (socket) {
        socket.emit("mark_notification_read", {
          notificationId,
          userId,
        });
      }

      console.log("✅ Marked as read");
    } catch (error) {
      console.error("❌ Error marking as read:", error);
    }
  };

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    isLoading,
    loadInitialNotifications,
    setNotifications,
    setUnreadCount,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
