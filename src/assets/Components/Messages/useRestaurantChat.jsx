import { useEffect, useRef, useState } from "react";
import socketService from "../../../api/services/Socketservice";
import { useRestaurant } from "../../../context/RestaurantContext";

export default function useRestaurantChat(userId, conversations) {
  const { restaurantId } = useRestaurant();
  const [messagesData, setMessagesData] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const initialized = useRef(false);
  const typingTimeouts = useRef({});

  useEffect(() => {
    if (!userId || !restaurantId || initialized.current) return;

    initialized.current = true;

    // 1️⃣ Connect socket
    const socket = socketService.connect(userId);

    // 2️⃣ Join all active conversation rooms
    conversations.forEach((conv) =>
      socketService.joinRoom(conv.roomId, userId)
    );

    // 3️⃣ Listen for incoming messages
    socketService.onReceiveMessage((incomingMessage) => {
      const { roomId, text, sender, messageType, createdAt, _id } =
        incomingMessage;

      const transformedMessage = {
        id: _id || Date.now(),
        sender: sender._id === userId ? "me" : "them",
        content: text,
        type: messageType || "text",
        time: new Date(createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt,
      };

      setMessagesData((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), transformedMessage],
      }));
    });

    // 4️⃣ Listen for typing events
    socketService.onUserTyping(({ userId: typingUserId, isTyping }) => {
      setTypingUsers((prev) => ({ ...prev, [typingUserId]: isTyping }));

      // Clear previous timeout
      if (typingTimeouts.current[typingUserId]) {
        clearTimeout(typingTimeouts.current[typingUserId]);
      }

      if (isTyping) {
        typingTimeouts.current[typingUserId] = setTimeout(() => {
          setTypingUsers((prev) => ({ ...prev, [typingUserId]: false }));
        }, 3000);
      }
    });

    // Cleanup on unmount
    return () => {
      Object.values(typingTimeouts.current).forEach(clearTimeout);
      // optional disconnect: comment out in StrictMode dev
      // socketService.disconnect();
    };
  }, [userId, restaurantId]);

  // 5️⃣ Send a message
  const sendMessage = (roomId, messageContent) => {
    if (!roomId || !messageContent.trim()) return;

    socketService.sendMessage(roomId, userId, messageContent, "text");

    // Optimistic local update
    const newMessage = {
      id: Date.now(),
      sender: "me",
      content: messageContent,
      type: "text",
      time: "now",
      createdAt: new Date(),
    };

    setMessagesData((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMessage],
    }));
  };

  // 6️⃣ Emit typing
  const emitTyping = (roomId, isTyping) => {
    socketService.emitTyping(roomId, userId, isTyping);
  };

  return { messagesData, typingUsers, sendMessage, emitTyping };
}
