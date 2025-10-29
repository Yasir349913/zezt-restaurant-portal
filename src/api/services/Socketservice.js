// SocketService.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(userId) {
    if (!this.socket) {
      console.log("🔌 Connecting socket for userId:", userId);

      this.socket = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on("connect", () => {
        console.log("✅ Socket connected:", this.socket.id);
        this.connected = true;
      });

      this.socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        this.connected = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
      });
    }
    return this.socket;
  }

  joinRoom(roomId, userId) {
    if (this.socket) {
      console.log("🚪 Joining room:", { roomId, userId });
      this.socket.emit("join_room", { roomId, userId });
    }
  }

  sendMessage(roomId, senderId, message, messageType = "text") {
    if (this.socket) {
      console.log("📤 Sending message:", {
        roomId,
        senderId,
        message,
        messageType,
      });

      this.socket.emit("send_message", {
        roomId,
        senderId,
        message,
        messageType,
      });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      console.log("👂 Listening for messages");
      this.socket.on("receive_message", callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on("user_typing", callback);
    }
  }

  emitTyping(roomId, userId, isTyping) {
    if (this.socket) {
      this.socket.emit("typing", { roomId, userId, isTyping });
    }
  }

  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting socket");
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

// ✅ Make sure to use lowercase `SocketService.js` in import if the file is lowercase
export default new SocketService();
