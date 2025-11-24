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

import useRestaurantChat from "../Messages/useRestaurantChat";

export default function Messageslayout() {
  const { user } = useAuth();
  const { restaurantId } = useRestaurant();

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
      if (!restaurantId) {
        console.log("⚠️ No restaurantId, skipping conversation load");
        return;
      }

      if (!userId) {
        console.error("❌ No userId, cannot load conversations");
        return;
      }

      console.log("🏪 Loading conversations for restaurant:", restaurantId);
      console.log("👤 With userId:", userId);
      setIsInitialLoading(true);

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
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadConversations();
  }, [restaurantId, userId]);

  // 2️⃣ Handle conversation selection
  const handleConversationSelect = async (roomId) => {
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
    if (selectedConversationId && userId) {
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

  if (isInitialLoading) {
    return (
      <div className="xl:ml-64 pt-14 bg-gray-50 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="xl:ml-64 pt-14 bg-gray-50 min-h-screen">
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
            <ConversationsList
              conversations={filteredConversations}
              selectedId={selectedConversationId}
              onSelect={handleConversationSelect}
            />
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
                disabled={isLoading}
                roomId={selectedConversationId}
                userId={userId}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p className="text-lg">Select a conversation to start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
