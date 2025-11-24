// Updated SocketService.js with fixes
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Set();
    this.pendingRooms = new Set(); 
  }

  connect(userId) {
    if (this.socket?.connected) {
      console.log("✅ Socket already connected, ID:", this.socket.id);
      return this.socket;
    }

    if (this.socket && !this.socket.connected) {
      console.log("🔄 Socket exists but disconnected, reconnecting...");
      this.socket.connect();
      return this.socket;
    }

    console.log("📌 Creating NEW socket connection for userId:", userId);
    console.log("🌐 Socket URL:", SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("✅✅✅ Socket CONNECTED successfully! ID:", this.socket.id);
      this.connected = true;

      // Join any pending rooms
      this.pendingRooms.forEach(({ roomId, userId }) => {
        this.joinRoom(roomId, userId);
      });
      this.pendingRooms.clear();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected. Reason:", reason);
      this.connected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      this.connected = false;
    });

    this.socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    // Log all incoming events for debugging
    this.socket.onAny((eventName, ...args) => {
      console.log(`📡 Socket event received: ${eventName}`, args);
    });

    return this.socket;
  }

  joinRoom(roomId, userId) {
    if (!this.socket) {
      console.error("❌ Cannot join room: Socket not initialized");
      return;
    }

    if (!this.socket.connected) {
      console.warn("⚠️ Socket not connected yet, queuing room join...");
      this.pendingRooms.add({ roomId, userId });
      return;
    }

    console.log("🚪 Joining room:", { roomId, userId });
    this.socket.emit("join_room", { roomId, userId });

    // Listen for confirmation
    this.socket.once("room_joined", (data) => {
      if (data.success) {
        console.log("✅ Room join confirmed:", data);
      } else {
        console.error("❌ Failed to join room:", data.error);
      }
    });
  }

  sendMessage(roomId, senderId, message, messageType = "text") {
    if (!this.socket) {
      console.error("❌ Cannot send: Socket not initialized");
      return;
    }

    if (!this.socket.connected) {
      console.error("❌ Cannot send: Socket not connected");
      return;
    }

    const payload = {
      roomId,
      senderId,
      message,
      messageType,
    };

    console.log("📤 Emitting send_message:", payload);
    this.socket.emit("send_message", payload);
  }

  onReceiveMessage(callback) {
    if (!this.socket) {
      console.error("❌ Cannot setup listener: Socket not initialized");
      return;
    }

    // Remove old listeners first
    this.socket.off("receive_message");
    this.socket.off("new_customer_message");

    console.log("👂 Setting up message listeners");

    // Listen for regular messages
    this.socket.on("receive_message", (message) => {
      console.log("📨📨📨 RECEIVE_MESSAGE EVENT FIRED!", message);

      // Extract the necessary data
      const processedMessage = {
        roomId: message.roomId,
        message: message.text || message.message,
        text: message.text,
        sender: message.sender,
        senderId: message.sender?._id || message.senderId,
        messageType: message.messageType || "text",
        createdAt: message.createdAt,
        timestamp: message.createdAt,
        _id: message._id || `temp-${Date.now()}`,
        id: message.id || message._id || `temp-${Date.now()}`,
      };

      callback(processedMessage);
    });

    // Also listen for new_customer_message events (for restaurant owners)
    this.socket.on("new_customer_message", (data) => {
      console.log("📨🔔 NEW_CUSTOMER_MESSAGE EVENT!", data);

      const { roomId, message } = data;
      const processedMessage = {
        roomId: roomId,
        message: message.text || message.message,
        text: message.text,
        sender: message.sender,
        senderId: message.sender?._id || message.senderId,
        messageType: message.messageType || "text",
        createdAt: message.createdAt,
        timestamp: message.createdAt,
        _id: message._id || `temp-${Date.now()}`,
        id: message.id || message._id || `temp-${Date.now()}`,
      };

      callback(processedMessage);
    });
  }

  onUserTyping(callback) {  
    if (!this.socket) return;

    this.socket.off("user_typing");
    this.socket.on("user_typing", (data) => {
      console.log("⌨️ user_typing event:", data);
      callback(data);
    });
  }

  emitTyping(roomId, userId, isTyping) {
    if (!this.socket?.connected) return;

    console.log("⌨️ Emitting typing:", { roomId, userId, isTyping });
    this.socket.emit("typing", { roomId, userId, isTyping });
  }

  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting socket");
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.pendingRooms.clear();
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
