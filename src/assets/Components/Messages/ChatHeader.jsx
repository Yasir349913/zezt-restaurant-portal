import React from "react";
import UserAvatar from "./UserAvater";

const ChatHeader = ({ user, isLoading = false }) => {
  if (!user) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
        <div className="text-gray-500 text-base">
          Select a conversation to start messaging
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 lg:p-6 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          </div>
          <div className="min-w-0 flex-1 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusText = () => {
    if (user.isOnline) return "Online";
    if (user.lastSeen) return `Last seen ${user.lastSeen}`;
    return null;
  };

  const statusText = getStatusText();

  return (
    <div className="flex items-center justify-between p-4 lg:p-6 bg-white border-b border-gray-100">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <UserAvatar
          name={user.name}
          avatar={user.avatar}
          size="lg"
          showOnline={user.isOnline !== false}
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-base lg:text-lg truncate">
            {user.name}
          </h3>
          {statusText && (
            <p
              className={`text-sm font-medium ${
                user.isOnline ? "text-green-500" : "text-gray-500"
              }`}
            >
              {statusText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
