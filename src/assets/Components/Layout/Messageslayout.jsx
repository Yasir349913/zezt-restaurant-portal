import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import socketService from "../../../api/services/Socketservice";
import SearchBar from "../Messages/SearchBar";
import ConversationsList from "../Messages/Conversationslist";
import ChatHeader from "../Messages/ChatHeader";
import MessagesList from "../Messages/Messageslist";
import MessageInput from "../Messages/MessageInput";

import {
  fetchRestaurantConversations,
  fetchMessages,
  getConversationById,
  searchConversations,
} from "../../../api/services/Messagesservices";

export default function Messageslayout() {
  const { user } = useAuth(); // Must have user.restaurantId

  const [conversations, setConversations] = useState([]);
  const [messagesData, setMessagesData] = useState({});
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});

  // Socket setup
  useEffect(() => {
    if (user && user._id) {
      socketService.connect(user._id);

      // Listen to incoming messages from customers
      socketService.onReceiveMessage((message) => {
        console.log("📥 Customer message:", message);

        const matchingConv = conversations.find(
          (conv) => conv.roomId === message.roomId
        );

        if (matchingConv) {
          const transformedMessage = {
            id: message._id || Date.now(),
            sender: message.sender._id === user._id ? "me" : "them",
            content: message.text,
            time: new Date(message.createdAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
            type: message.messageType || "text",
          };

          setMessagesData((prev) => ({
            ...prev,
            [matchingConv.id]: [
              ...(prev[matchingConv.id] || []),
              transformedMessage,
            ],
          }));

          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === matchingConv.id
                ? {
                    ...conv,
                    lastMessage: message.text.substring(0, 30),
                    time: "now",
                    hasNotification: true,
                  }
                : conv
            )
          );
        }
      });

      // Typing indicator
      socketService.onUserTyping(({ userId, isTyping }) => {
        setTypingUsers((prev) => ({ ...prev, [userId]: isTyping }));
        if (isTyping) {
          setTimeout(() => {
            setTypingUsers((prev) => ({ ...prev, [userId]: false }));
          }, 3000);
        }
      });
    }

    return () => {
      if (user?._id) socketService.disconnect();
    };
  }, [user, conversations]);

  // Load restaurant conversations
  useEffect(() => {
    const loadData = async () => {
      if (!user?.restaurantId) {
        console.error("❌ No restaurantId in user");
        setIsInitialLoading(false);
        return;
      }

      setIsInitialLoading(true);
      try {
        const conversationsData = await fetchRestaurantConversations(
          user.restaurantId
        );

        setConversations(conversationsData);
        setFilteredConversations(conversationsData);

        if (conversationsData.length > 0) {
          const first = conversationsData[0];
          setSelectedConversationId(first.roomId);

          const [userData, messagesData] = await Promise.all([
            getConversationById(first.roomId),
            fetchMessages(first.roomId),
          ]);

          const transformed = messagesData.map((msg) => ({
            ...msg,
            sender: msg.sender === user._id ? "me" : "them",
          }));

          setSelectedUser(userData);
          setMessagesData({ [first.roomId]: transformed });
        }
      } catch (error) {
        console.error("Error loading:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Join room
  useEffect(() => {
    if (selectedConversationId && user?._id) {
      socketService.joinRoom(selectedConversationId, user._id);
    }
  }, [selectedConversationId, user]);

  // Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() === "") {
        setFilteredConversations(conversations);
      } else {
        setFilteredConversations(
          searchConversations(searchTerm, conversations)
        );
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, conversations]);

  const currentMessages = messagesData[selectedConversationId] || [];

  const handleConversationSelect = async (conversationId) => {
    if (conversationId === selectedConversationId) return;

    setSelectedConversationId(conversationId);
    setIsLoading(true);

    try {
      const [userData, messages] = await Promise.all([
        getConversationById(conversationId),
        fetchMessages(conversationId),
      ]);

      setSelectedUser(userData);

      const transformed = messages.map((msg) => ({
        ...msg,
        sender: msg.sender === user._id ? "me" : "them",
      }));

      setMessagesData((prev) => ({ ...prev, [conversationId]: transformed }));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (messageContent) => {
    if (!messageContent.trim() || !selectedConversationId || !user?._id) return;

    // Send via socket
    socketService.sendMessage(
      selectedConversationId,
      user._id,
      messageContent,
      "text"
    );

    // Optimistic UI
    const newMessage = {
      id: Date.now(),
      sender: "me",
      content: messageContent,
      time: "now",
      type: "text",
    };

    setMessagesData((prev) => ({
      ...prev,
      [selectedConversationId]: [
        ...(prev[selectedConversationId] || []),
        newMessage,
      ],
    }));

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversationId
          ? {
              ...conv,
              lastMessage: `You: ${messageContent.substring(0, 30)}`,
              time: "now",
            }
          : conv
      )
    );
  };

  if (isInitialLoading) {
    return (
      <div className="xl:ml-64 pt-14 bg-gray-50 h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="xl:ml-64 pt-14 bg-gray-50 min-h-screen">
      <div className="h-[calc(100vh-3.5rem)] flex gap-3 p-4">
        {/* Sidebar */}
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

        {/* Chat */}
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
                placeholder="Reply..."
                disabled={isLoading}
                roomId={selectedConversationId}
                userId={user?._id}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
