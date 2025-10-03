import React from "react";

const Message = ({ message }) => {
  const isMe = message.sender === "me";

  if (message.type === "image") {
    return (
      <div
        className={`flex ${
          isMe ? "justify-end" : "justify-start"
        } mb-3 sm:mb-4`}
      >
        <div
          className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg ${
            isMe ? "order-2" : "order-1"
          }`}
        >
          <div
            className={`rounded-lg p-2 sm:p-3 ${
              isMe ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
          >
            <div className="w-full max-w-64 h-36 sm:h-48 rounded-lg mb-2 relative overflow-hidden">
              {message.imageUrl ? (
                <img
                  src={message.imageUrl}
                  alt="Shared image"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center"
                style={{ display: message.imageUrl ? "none" : "flex" }}
              >
                <span className="text-gray-600 text-sm">Image</span>
              </div>
              {message.imageUrl && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              )}
              {message.caption && (
                <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                  {message.caption}
                </div>
              )}
            </div>
            {message.content && (
              <p className="text-xs sm:text-sm">{message.content}</p>
            )}
          </div>
          <p
            className={`text-xs mt-1 ${
              isMe ? "text-right" : "text-left"
            } text-gray-500`}
          >
            {message.time}
          </p>
        </div>
      </div>
    );
  }

  if (message.type === "file") {
    return (
      <div
        className={`flex ${
          isMe ? "justify-end" : "justify-start"
        } mb-3 sm:mb-4`}
      >
        <div
          className={`max-w-xs sm:max-w-sm md:max-w-md ${
            isMe ? "order-2" : "order-1"
          }`}
        >
          <div
            className={`rounded-lg px-3 sm:px-4 py-2 sm:py-3 ${
              isMe ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div
                className={`p-1.5 sm:p-2 rounded ${
                  isMe ? "bg-blue-400" : "bg-gray-200"
                }`}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">
                  {message.fileName || "Document"}
                </p>
                <p className="text-xs opacity-75">
                  {message.fileSize || "Unknown size"}
                </p>
              </div>
            </div>
          </div>
          <p
            className={`text-xs mt-1 ${
              isMe ? "text-right" : "text-left"
            } text-gray-500`}
          >
            {message.time}
          </p>
        </div>
      </div>
    );
  }

  // Regular text message
  return (
    <div
      className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3 sm:mb-4`}
    >
      <div
        className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg ${
          isMe ? "order-2" : "order-1"
        }`}
      >
        <div
          className={`rounded-lg px-3 sm:px-4 py-2 ${
            isMe ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
          }`}
        >
          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <p
          className={`text-xs mt-1 ${
            isMe ? "text-right" : "text-left"
          } text-gray-500`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
};

export default Message;
