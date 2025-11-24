import { useEffect, useRef, useState } from "react";
import socketService from "../../../api/services/Socketservice";
import { useRestaurant } from "../../../context/RestaurantContext";

export default function useRestaurantChat(userId, conversations) {
  const { restaurantId } = useRestaurant();
  const [messagesData, setMessagesData] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const socketRef = useRef(null); // keep reference to socket object
  const listenersInitialized = useRef(false);
  const typingTimeouts = useRef({});

  // 1) Initialize socket + listeners once (when userId + restaurantId available)
  useEffect(() => {
    if (!userId || !restaurantId) {
      console.log("⚠️ Missing userId or restaurantId - skipping socket init");
      return;
    }

    console.log("🚀 init socket for", { userId, restaurantId });

    // Connect and keep reference
    const socket = socketService.connect(userId);
    socketRef.current = socket;

    // Only setup the client-side listeners once
    if (!listenersInitialized.current) {
      listenersInitialized.current = true;

      console.log("👂 setting up socket listeners");

      socketService.onReceiveMessage((incomingMessage) => {
        console.log("📨 incomingMessage callback:", incomingMessage);

        const {
          roomId,
          message: text,
          text: textAlt,
          sender,
          senderId,
          messageType,
          createdAt,
          timestamp,
          _id,
          id,
        } = incomingMessage || {};

        const messageText = text || textAlt || "";
        const messageId = _id || id || `temp-${Date.now()}`;
        const messageTime = createdAt || timestamp || new Date();

        let senderIdValue;
        if (senderId) {
          senderIdValue = senderId;
        } else if (typeof sender === "string") {
          senderIdValue = sender;
        } else if (sender?._id) {
          senderIdValue = sender._id;
        } else if (sender?.id) {
          senderIdValue = sender.id;
        } else {
          senderIdValue = null;
        }

        const transformedMessage = {
          id: messageId,
          sender: String(senderIdValue) === String(userId) ? "me" : "them",
          content: messageText,
          type: messageType || "text",
          timestamp: messageTime,
          time: new Date(messageTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: messageTime,
        };

        setMessagesData((prev) => {
          const currentMessages = prev[roomId] || [];

          const isDuplicate = currentMessages.some(
            (msg) =>
              msg.id === messageId ||
              (msg.content === messageText &&
                Math.abs(new Date(msg.timestamp) - new Date(messageTime)) <
                  1000)
          );

          if (isDuplicate) {
            console.log("⚠️ duplicate incoming message, skipping");
            return prev;
          }

          return {
            ...prev,
            [roomId]: [...currentMessages, transformedMessage],
          };
        });
      });

      socketService.onUserTyping(({ userId: typingUserId, isTyping }) => {
        console.log("⌨️ typing event:", typingUserId, isTyping);
        setTypingUsers((prev) => ({ ...prev, [typingUserId]: isTyping }));

        if (typingTimeouts.current[typingUserId]) {
          clearTimeout(typingTimeouts.current[typingUserId]);
        }

        if (isTyping) {
          typingTimeouts.current[typingUserId] = setTimeout(() => {
            setTypingUsers((prev) => ({ ...prev, [typingUserId]: false }));
          }, 3000);
        }
      });
    }

    // cleanup on unmount
    return () => {
      console.log("🧹 socket hook cleanup");
      Object.values(typingTimeouts.current).forEach(clearTimeout);
      // do NOT disconnect socket here if it's shared app-wide. Only if you want to.
      // socketService.disconnect();
    };
    // we intentionally do NOT include conversations here — joining rooms is handled in next effect
  }, [userId, restaurantId]);

  // 2) Join rooms whenever `conversations` changes and when socket is connected
  useEffect(() => {
    if (!socketRef.current) {
      console.log("⚠️ cannot join rooms - socket not initialized yet");
      return;
    }

    const tryJoin = (attempt = 0) => {
      const maxAttempts = 20;
      if (socketService.isConnected()) {
        console.log("✅ socket connected - joining all conversation rooms");
        conversations.forEach((conv) => {
          if (conv?.roomId) {
            console.log("  🚪 join room:", conv.roomId);
            socketService.joinRoom(conv.roomId, userId);
          }
        });
      } else if (attempt < maxAttempts) {
        // back off slightly and retry
        setTimeout(() => tryJoin(attempt + 1), 500 + attempt * 50);
      } else {
        console.error("❌ failed to join rooms - socket never connected");
      }
    };

    tryJoin();
  }, [conversations, userId]);

  const sendMessage = (roomId, messageContent) => {
    if (!roomId || !messageContent.trim()) {
      console.warn("⚠️ invalid message send");
      return;
    }

    console.log("📤 sendMessage ->", roomId, messageContent.substring(0, 40));
    socketService.sendMessage(roomId, userId, messageContent, "text");

    const tempId = `temp-${Date.now()}`;
    const now = new Date();
    const newMessage = {
      id: tempId,
      sender: "me",
      content: messageContent,
      type: "text",
      timestamp: now,
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: now,
    };

    setMessagesData((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMessage],
    }));
  };

  const emitTyping = (roomId, isTyping) => {
    socketService.emitTyping(roomId, userId, isTyping);
  };

  return { messagesData, typingUsers, sendMessage, emitTyping };
}
