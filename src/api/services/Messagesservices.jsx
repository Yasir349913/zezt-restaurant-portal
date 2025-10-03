// src/api/services/Messagesservices.jsx
import { userApi } from "../api";

// Sirf restaurant ki conversations fetch karo
export const fetchRestaurantConversations = async (restaurantId) => {
  try {
    const response = await userApi.get(`/api/chat/restaurant/${restaurantId}`);

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

// Messages fetch by roomId
export const fetchMessages = async (roomId) => {
  try {
    const response = await userApi.get(`/api/chat/${roomId}`);

    if (!response.data.messages) return [];

    return response.data.messages.map((msg) => ({
      id: msg._id,
      sender: msg.sender._id,
      content: msg.text,
      time: new Date(msg.createdAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      type: msg.messageType || "text",
    }));
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

// Conversation details
export const getConversationById = async (roomId) => {
  try {
    const response = await userApi.get(`/api/chat/${roomId}`);
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

// Search (client-side filter)
export const searchConversations = (searchTerm, conversations) => {
  return conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
