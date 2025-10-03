import React from "react";
import UserAvatar from "./UserAvater";

const ConversationItem = ({ conversation, onClick, isSelected }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(conversation.id);
    }
  };

  const formatTime = (time) => {
    // Handle different time formats
    if (time === "now") return "now";
    if (time.includes("ago")) return time;
    return time;
  };

  const truncateMessage = (message, maxLength = 35) => {
    if (!message) return "";
    return message.length > maxLength
      ? message.substring(0, maxLength) + "..."
      : message;
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
        isSelected ? "bg-blue-50 border border-blue-100 shadow-sm" : ""
      }`}
    >
      <UserAvatar
        name={conversation.name}
        avatar={conversation.avatar}
        size="lg"
        showOnline={conversation.isOnline}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4
            className={`text-sm font-medium truncate ${
              isSelected ? "text-blue-900" : "text-gray-900"
            }`}
          >
            {conversation.name}
          </h4>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span
              className={`text-xs ${
                conversation.hasNotification
                  ? "text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              {formatTime(conversation.time)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p
            className={`text-sm truncate flex-1 ${
              conversation.hasNotification
                ? "text-gray-900 font-medium"
                : "text-gray-600"
            }`}
          >
            {truncateMessage(conversation.lastMessage)}
          </p>

          <div className="flex items-center space-x-1 ml-2">
            {conversation.hasNotification && !conversation.unreadCount && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
            {conversation.unreadCount && conversation.unreadCount > 0 && (
              <div className="bg-blue-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 flex-shrink-0">
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
