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
  const userId = user?._id || user?.userId;

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

  //  Merge fetched messages with real-time socket messages
  const currentMessages = useMemo(() => {
    const fetched = allMessages[selectedConversationId] || [];
    const socketMsgs = messagesData[selectedConversationId] || [];

    console.log("🔄 Merging messages:");
    console.log("  - Fetched:", fetched.length);
    console.log("  - Socket:", socketMsgs.length);

    // Combine both arrays
    const combined = [...fetched, ...socketMsgs];

    // Remove duplicates based on message ID
    const uniqueMessages = combined.filter(
      (msg, index, self) => index === self.findIndex((m) => m.id === msg.id)
    );

    console.log("  - Combined (unique):", uniqueMessages.length);

    // Sort by timestamp if available
    const sorted = uniqueMessages.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.time || 0);
      const timeB = new Date(b.timestamp || b.time || 0);
      return timeA - timeB;
    });

    console.log("  - Final messages:", sorted.length);
    return sorted;
  }, [allMessages, messagesData, selectedConversationId]);

  // 1️⃣ Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      if (!restaurantId) {
        console.log("⚠️ No restaurantId, skipping conversation load");
        return;
      }

      console.log("🏪 Loading conversations for restaurant:", restaurantId);
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

          console.log("📥 Raw fetched messages:", msgs);
          console.log("👤 Current userId:", userId);

          const transformed = msgs.map((msg) => {
            const isMine = msg.sender === userId;
            console.log(
              `  Message ${msg.id}: sender=${msg.sender}, userId=${userId}, isMine=${isMine}`
            );

            return {
              ...msg,
              sender: isMine ? "me" : "them",
            };
          });

          console.log("✅ Transformed messages:", transformed);

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

        console.log("📥 Raw fetched messages:", msgs);
        console.log("👤 Current userId:", userId);

        const transformed = msgs.map((msg) => {
          const isMine = msg.sender === userId;
          console.log(
            `  Message ${msg.id}: sender=${msg.sender}, userId=${userId}, isMine=${isMine}`
          );

          return {
            ...msg,
            sender: isMine ? "me" : "them",
          };
        });

        console.log("✅ Transformed messages:", transformed);

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

    console.log("📤 Sending message:", messageContent.substring(0, 30));
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
    if (selectedConversationId) {
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
