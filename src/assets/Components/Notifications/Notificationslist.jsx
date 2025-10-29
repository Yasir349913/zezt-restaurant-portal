// src/components/Notifications/Notificationslist.jsx
import React from "react";

const Notificationslist = ({
  id,
  title,
  description,
  time,
  isUnread = false,
  onMarkRead = () => {},
}) => {
  return (
    <div className="flex items-start justify-between py-4 px-4 bg-white hover:bg-gray-50 transition-colors duration-200">
      <div className="flex-1 pr-3">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium text-gray-900 leading-tight">
            {title}
          </h3>
          {isUnread && (
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-0.5" />
          )}
        </div>
        <p className="text-xs text-gray-600 leading-relaxed mb-1">
          {description}
        </p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>

      <div className="flex items-start gap-1 flex-shrink-0 mt-1">
        {/* three-dot or other action */}
        <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>

        {/* delete/trash (placeholder) */}
        <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400"
          >
            <polyline points="3,6 5,6 21,6" />
            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
          </svg>
        </button>

        {/* Mark as read button (only show if unread) */}
        {isUnread && (
          <button
            onClick={onMarkRead}
            className="ml-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:opacity-90"
            title="Mark as read"
          >
            Mark read
          </button>
        )}
      </div>
    </div>
  );
};

export default Notificationslist;
