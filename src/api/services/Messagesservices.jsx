// src/api/services/Messagesservices.jsx
import { userApi } from "../api";

export const fetchRestaurantConversations = async (restaurantId) => {
  try {
    const response = await userApi.get(`/chat/restaurant/${restaurantId}`);

    return response.data.map((chat) => ({
      id: chat.roomId,
      roomId: chat.roomId,
      customerId: chat.customer._id,
      name: `${chat.customer.firstName} ${chat.customer.lastName}`,
      avatar: null,
      lastMessage: chat.lastMessage?.text || "No messages yet",
      time: chat.lastActivity
        ? new Date(chat.lastActivity).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "",
      isOnline: false,
      hasNotification: false,
      unreadCount: 0,
    }));
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

// ✅ FIXED: Extract _id from sender object properly
export const fetchMessages = async (roomId) => {
  try {
    const response = await userApi.get(`/chat/${roomId}`);

    if (!response.data.messages) return [];

    console.log("📥 Raw messages from backend:", response.data.messages); // Debug log

    return response.data.messages.map((msg) => {
      // ✅ Extract sender ID properly (handle both populated and unpopulated)
      const senderId =
        typeof msg.sender === "string"
          ? msg.sender
          : msg.sender?._id || msg.sender?.id;

      console.log("🔍 Message sender ID:", senderId, "Type:", typeof senderId); // Debug log

      return {
        id: msg._id,
        sender: senderId, // ✅ Now this is always a string ID
        content: msg.text,
        timestamp: msg.createdAt, // ✅ Added for sorting
        time: new Date(msg.createdAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        type: msg.messageType || "text",
      };
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const getConversationById = async (roomId) => {
  try {
    const response = await userApi.get(`/chat/${roomId}`);
    const chatInfo = response.data.chatInfo;

    return {
      id: roomId,
      name: `${chatInfo.customer.firstName} ${chatInfo.customer.lastName}`,
      avatar: null,
      isOnline: false,
    };
  } catch (error) {
    return {
      id: roomId,
      name: "Customer",
      avatar: null,
      isOnline: false,
    };
  }
};

export const searchConversations = (searchTerm, conversations) => {
  return conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
