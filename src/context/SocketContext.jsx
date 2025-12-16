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
  const [unreadMessageCount, setUnreadMessageCount] = useState(0); // ✅ NEW: Track unread messages separately
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

      // ✅ Calculate unread message count
      const unreadMessages = fetchedNotifications.filter(
        (n) => !n.isRead && n.type === "new_customer_message"
      ).length;
      setUnreadMessageCount(unreadMessages);

      console.log("✅ Loaded:", fetchedNotifications.length, "notifications");
      console.log("📊 Unread:", unread);
      console.log("💬 Unread Messages:", unreadMessages);

      setIsLoading(false);
    } catch (error) {
      console.error("❌ Error loading notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
      setUnreadMessageCount(0);
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
    console.log("=".repeat(60));
    console.log("🚀 INITIALIZING SOCKET CONNECTION");
    console.log(`   User ID: ${userId}`);
    console.log("=".repeat(60));

    // ✅ Load notifications on mount
    loadInitialNotifications(userId);

    // Initialize socket
    const BACKEND_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    const newSocket = io(BACKEND_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("=".repeat(60));
      console.log("✅ SOCKET CONNECTED");
      console.log(`   Socket ID: ${newSocket.id}`);
      console.log("=".repeat(60));

      setIsConnected(true);
      newSocket.emit("join_notification_room", { userId });
    });

    newSocket.on("notification_room_joined", (data) => {
      console.log("✅ Notification room join confirmed:", data);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket error:", error);
      setIsConnected(false);
    });

    // Listen for restaurant_notification
    newSocket.on("restaurant_notification", (notificationData) => {
      console.log("🔔 Restaurant notification received:", notificationData);

      const notification = {
        _id: notificationData._id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        restaurantId: notificationData.restaurantId,
        restaurantName: notificationData.restaurantName,
        actionData: notificationData.actionData,
        createdAt: notificationData.createdAt,
        isRead: false,
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Browser notification
      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/logo.png",
        });
      }
    });

    // Listen for new_notification
    newSocket.on("new_notification", (data) => {
      console.log("🔔 New notification received:", data);

      const notification = data.notification || data;

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // ✅ If it's a message notification, increment message count
      if (notification.type === "new_customer_message") {
        setUnreadMessageCount((prev) => prev + 1);
        console.log("💬 Unread message count increased");
      }

      // Browser notification
      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
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

      // Find the notification to check its type
      const notif = notifications.find((n) => n._id === notificationId);

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

      // ✅ If it's a message notification, decrease message count too
      if (notif && notif.type === "new_customer_message") {
        setUnreadMessageCount((prev) => Math.max(0, prev - 1));
        console.log("💬 Unread message count decreased");
      }

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

  // ✅ NEW: Function to mark all message notifications as read
  const markAllMessagesAsRead = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user._id || user.id;

      // Get all unread message notifications
      const unreadMessageNotifications = notifications.filter(
        (n) => !n.isRead && n.type === "new_customer_message"
      );

      // Mark each as read
      for (const notif of unreadMessageNotifications) {
        await markAsRead(notif._id);
      }

      console.log("✅ All message notifications marked as read");
    } catch (error) {
      console.error("❌ Error marking all messages as read:", error);
    }
  };

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    unreadMessageCount, // ✅ NEW: Expose message count
    markAsRead,
    markAllMessagesAsRead, // ✅ NEW: Expose function to clear message badge
    isLoading,
    loadInitialNotifications,
    setNotifications,
    setUnreadCount,
    setUnreadMessageCount, // ✅ NEW: Allow manual updates
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
