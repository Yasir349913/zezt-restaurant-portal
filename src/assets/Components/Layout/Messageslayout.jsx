// src/assets/Components/Layout/Messageslayout.jsx
import React, { useState, useEffect, useMemo } from "react";
import SearchBar from "../Messages/SearchBar";
import ConversationsList from "../Messages/Conversationslist";
import ChatHeader from "../Messages/ChatHeader";
import MessagesList from "../Messages/Messageslist";
import MessageInput from "../Messages/MessageInput";
import { useAuth } from "../../../context/AuthContext";
import { useRestaurant } from "../../../context/RestaurantContext";
import {
  fetchRestaurantConversations,
  fetchMessages,
  getConversationById,
  searchConversations,
} from "../../../api/services/Messagesservices";
import Loader from "../Common/Loader";
import useRestaurantChat from "../Messages/useRestaurantChat";

export default function Messageslayout() {
  const { user } = useAuth();
  const { restaurantId } = useRestaurant();

  // ✅ Check if restaurant exists
  const fallbackId =
    typeof window !== "undefined" ? localStorage.getItem("restaurantId") : null;
  const hasRestaurant = restaurantId || fallbackId;

  // ✅ FIXED: Better user ID extraction with debugging
  console.log("🔍 AUTH DEBUG:");
  console.log("  - Full user object:", user);
  console.log("  - user._id:", user?._id);
  console.log("  - user.userId:", user?.userId);
  console.log("  - user.id:", user?.id);

  // Try multiple possible user ID fields
  const userId = user?._id || user?.userId || user?.id;

  console.log("  - ✅ Final userId:", userId);
  console.log("  - ✅ userId type:", typeof userId);

  // ✅ Early return if no userId
  if (!userId) {
    console.error("❌ CRITICAL: No userId found! User object:", user);
    return (
      <div className="xl:ml-64 pt-14 bg-gray-50 h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">
            Authentication Error
          </p>
          <p className="text-gray-600">Please log in again</p>
        </div>
      </div>
    );
  }

  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Add local state for storing fetched messages
  const [allMessages, setAllMessages] = useState({});

  // Use our socket hook
  const { messagesData, typingUsers, sendMessage, emitTyping } =
    useRestaurantChat(userId, conversations);

  // ✅ Better message merging logic
  const currentMessages = useMemo(() => {
    const fetched = allMessages[selectedConversationId] || [];
    const socketMsgs = messagesData[selectedConversationId] || [];

    console.log("🔄 MERGING MESSAGES for room:", selectedConversationId);
    console.log("  - Fetched messages:", fetched.length);
    console.log("  - Socket messages:", socketMsgs.length);

    // Combine both arrays
    const combined = [...fetched, ...socketMsgs];

    // Remove duplicates based on message ID (ignore temp IDs)
    const uniqueMessages = combined.filter((msg, index, self) => {
      // Skip temp IDs in duplicate check
      if (msg.id && msg.id.toString().startsWith("temp-")) {
        return true;
      }
      return (
        index ===
        self.findIndex((m) => {
          // Don't compare temp IDs
          if (m.id && m.id.toString().startsWith("temp-")) {
            return false;
          }
          return m.id === msg.id;
        })
      );
    });

    console.log("  - After deduplication:", uniqueMessages.length);

    // Sort by timestamp
    const sorted = uniqueMessages.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.createdAt || 0);
      const timeB = new Date(b.timestamp || b.createdAt || 0);
      return timeA - timeB;
    });

    console.log("  - Final sorted messages:", sorted.length);
    return sorted;
  }, [allMessages, messagesData, selectedConversationId]);

  // 1️⃣ Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      console.log("🏪 Checking restaurant:", restaurantId);
      console.log("👤 User ID:", userId);
      console.log("🔍 Has restaurant:", hasRestaurant);

      setIsInitialLoading(true);

      // ✅ If no restaurant, just set loading to false and show empty UI
      if (!hasRestaurant) {
        console.log("⚠️ No restaurant, showing empty state");
        setConversations([]);
        setFilteredConversations([]);
        setIsInitialLoading(false);
        return;
      }

      if (!userId) {
        console.error("❌ No userId, cannot load conversations");
        setIsInitialLoading(false);
        return;
      }

      console.log("🏪 Loading conversations for restaurant:", restaurantId);

      try {
        const convs = await fetchRestaurantConversations(restaurantId);
        console.log("✅ Loaded conversations:", convs.length);
        setConversations(convs);
        setFilteredConversations(convs);

        if (convs.length > 0) {
          const firstConv = convs[0];
          console.log(
            "🎯 Auto-selecting first conversation:",
            firstConv.roomId
          );
          setSelectedConversationId(firstConv.roomId);

          const userData = await getConversationById(firstConv.roomId);
          setSelectedUser(userData);

          console.log("📨 Fetching messages for room:", firstConv.roomId);
          const msgs = await fetchMessages(firstConv.roomId);

          console.log("📥 RAW FETCHED MESSAGES:", msgs);
          console.log("👤 Current userId for comparison:", userId);
          console.log("👤 User ID type:", typeof userId);

          // ✅ FIXED: Proper sender comparison
          const transformed = msgs.map((msg) => {
            // Extract sender ID (handle both string and object)
            let senderId;
            if (typeof msg.sender === "string") {
              senderId = msg.sender;
            } else if (msg.sender?._id) {
              senderId = msg.sender._id;
            } else if (msg.sender?.id) {
              senderId = msg.sender.id;
            }

            // ✅ Convert both to strings for comparison
            const senderStr = String(senderId);
            const userStr = String(userId);
            const isMine = senderStr === userStr;

            console.log(`  Message ${msg.id}:`);
            console.log(`    - Raw sender:`, msg.sender);
            console.log(`    - Extracted ID:`, senderId);
            console.log(`    - Sender (string):`, senderStr);
            console.log(`    - User (string):`, userStr);
            console.log(`    - Is mine:`, isMine);

            return {
              ...msg,
              sender: isMine ? "me" : "them",
            };
          });

          console.log("✅ TRANSFORMED MESSAGES:", transformed);

          // ✅ Store the fetched messages
          setAllMessages((prev) => ({
            ...prev,
            [firstConv.roomId]: transformed,
          }));

          console.log("✅ Initial messages loaded:", transformed.length);
        } else {
          console.log("ℹ️ No conversations found");
        }
      } catch (error) {
        console.error("❌ Error loading conversations:", error);
        // On error, still show UI with empty conversations
        setConversations([]);
        setFilteredConversations([]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadConversations();
  }, [restaurantId, userId, hasRestaurant]);

  // 2️⃣ Handle conversation selection
  const handleConversationSelect = async (roomId) => {
    if (!hasRestaurant) {
      console.log("⚠️ No restaurant, cannot select conversation");
      return;
    }

    if (roomId === selectedConversationId) {
      console.log("ℹ️ Already on conversation:", roomId);
      return;
    }

    console.log("🔄 Switching to conversation:", roomId);
    setSelectedConversationId(roomId);
    setIsLoading(true);

    try {
      const userData = await getConversationById(roomId);
      setSelectedUser(userData);

      // ✅ Only fetch messages if not already cached
      if (!allMessages[roomId]) {
        console.log("📨 Fetching messages for room:", roomId);
        const msgs = await fetchMessages(roomId);

        console.log("📥 RAW FETCHED MESSAGES:", msgs);
        console.log("👤 Current userId:", userId);

        // ✅ FIXED: Proper sender comparison
        const transformed = msgs.map((msg) => {
          let senderId;
          if (typeof msg.sender === "string") {
            senderId = msg.sender;
          } else if (msg.sender?._id) {
            senderId = msg.sender._id;
          } else if (msg.sender?.id) {
            senderId = msg.sender.id;
          }

          // ✅ Convert both to strings for comparison
          const senderStr = String(senderId);
          const userStr = String(userId);
          const isMine = senderStr === userStr;

          console.log(
            `  Message ${msg.id}: Sender=${senderStr}, User=${userStr}, Mine=${isMine}`
          );

          return {
            ...msg,
            sender: isMine ? "me" : "them",
          };
        });

        console.log("✅ TRANSFORMED MESSAGES:", transformed);

        // ✅ Store the fetched messages
        setAllMessages((prev) => ({
          ...prev,
          [roomId]: transformed,
        }));

        console.log("✅ Messages loaded for room:", roomId, transformed.length);
      } else {
        console.log(
          "✅ Using cached messages for room:",
          roomId,
          allMessages[roomId].length
        );
      }

      // Update conversations notification
      setConversations((prev) =>
        prev.map((conv) =>
          conv.roomId === roomId ? { ...conv, hasNotification: false } : conv
        )
      );
    } catch (err) {
      console.error("❌ Error loading conversation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3️⃣ Handle sending a message
  const handleSendMessage = (messageContent) => {
    if (!hasRestaurant) {
      console.log("⚠️ No restaurant, cannot send message");
      return;
    }

    if (!selectedConversationId) {
      console.warn("⚠️ No conversation selected");
      return;
    }

    if (!userId) {
      console.error("❌ Cannot send message: No userId");
      return;
    }

    console.log("📤 HANDLE SEND MESSAGE:");
    console.log("  - Room:", selectedConversationId);
    console.log("  - User:", userId);
    console.log("  - Content:", messageContent.substring(0, 30));

    sendMessage(selectedConversationId, messageContent);

    // Update last message preview
    setConversations((prev) =>
      prev.map((conv) =>
        conv.roomId === selectedConversationId
          ? {
              ...conv,
              lastMessage: `You: ${messageContent.substring(0, 30)}`,
              time: "now",
            }
          : conv
      )
    );
  };

  // 4️⃣ Handle typing indicator
  const handleTyping = () => {
    if (hasRestaurant && selectedConversationId && userId) {
      emitTyping(selectedConversationId, true);
    }
  };

  // 5️⃣ Search conversations
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() === "") {
        setFilteredConversations(conversations);
      } else {
        const filtered = searchConversations(searchTerm, conversations);
        console.log("🔍 Search results:", filtered.length);
        setFilteredConversations(filtered);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, conversations]);

  // ✅ Show loader while initially loading
  if (isInitialLoading) {
    return (
      <div className="xl:ml-64 pt-14 bg-gray-50 h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading messages..." />
      </div>
    );
  }

  return (
    <div className="xl:ml-64 pt-14 bg-gray-50 min-h-screen">
      {/* ✅ Warning banner if no restaurant */}
      {!hasRestaurant && (
        <div className="p-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">
                  No restaurant created yet
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Please create a restaurant to access customer messages.
                  Conversations will appear once your restaurant is set up.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-[calc(100vh-3.5rem)] flex gap-3 p-4">
        {/* Conversations Sidebar */}
        <div className="w-96 bg-white rounded-2xl shadow-sm flex flex-col">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Messages</h2>
            <SearchBar
              placeholder="Search..."
              onSearch={setSearchTerm}
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="flex-1 overflow-y-auto px-6">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-600 mb-1">
                  No conversations yet
                </p>
                <p className="text-sm text-gray-500">
                  {hasRestaurant
                    ? "Customer messages will appear here once they start chatting with you"
                    : "Create a restaurant to start receiving messages"}
                </p>
              </div>
            ) : (
              <ConversationsList
                conversations={filteredConversations}
                selectedId={selectedConversationId}
                onSelect={handleConversationSelect}
              />
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col">
          {selectedUser ? (
            <>
              <ChatHeader user={selectedUser} onMore={() => {}} />
              <div className="flex-1 overflow-hidden">
                <MessagesList
                  messages={currentMessages}
                  isLoading={isLoading}
                />
              </div>
              {Object.values(typingUsers).some(Boolean) && (
                <div className="px-6 py-2 text-sm text-gray-500 italic">
                  Customer is typing...
                </div>
              )}
              <MessageInput
                onSend={handleSendMessage}
                onChange={handleTyping}
                placeholder="Reply to customer..."
                disabled={isLoading || !hasRestaurant}
                roomId={selectedConversationId}
                userId={userId}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              {!hasRestaurant ? (
                <>
                  <svg
                    className="w-20 h-20 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-lg font-medium mb-1">
                    Create a restaurant first
                  </p>
                  <p className="text-sm text-gray-400">
                    Set up your restaurant to start messaging customers
                  </p>
                </>
              ) : conversations.length === 0 ? (
                <>
                  <svg
                    className="w-20 h-20 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-lg font-medium mb-1">No messages yet</p>
                  <p className="text-sm text-gray-400">
                    Waiting for customer messages...
                  </p>
                </>
              ) : (
                <>
                  <svg
                    className="w-20 h-20 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <p className="text-lg font-medium">
                    Select a conversation to start
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
