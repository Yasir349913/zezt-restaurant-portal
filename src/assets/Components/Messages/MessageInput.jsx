import React, { useState, useRef, useEffect } from "react";
import { Send, Plus, Smile, Image, FileText, Paperclip } from "lucide-react";
import socketService from "../../../api/services/Socketservice";

const MessageInput = ({
  onSend,
  onAttachment,
  placeholder = "Send your message...",
  disabled = false,
  roomId,
  userId,
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const textareaRef = useRef(null);
  const attachmentMenuRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && onSend && !disabled) {
      // Stop typing indicator
      if (roomId && userId) {
        socketService.emitTyping(roomId, userId, false);
        setIsTyping(false);
      }

      onSend(trimmedMessage);
      setMessage("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);

    // Emit typing indicator
    if (roomId && userId && e.target.value.length > 0) {
      if (!isTyping) {
        setIsTyping(true);
        socketService.emitTyping(roomId, userId, true);
      }

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socketService.emitTyping(roomId, userId, false);
      }, 2000);
    }

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const handleAttachmentClick = () => {
    setShowAttachmentMenu(!showAttachmentMenu);
  };

  const handleAttachmentOption = (type) => {
    setShowAttachmentMenu(false);
    if (onAttachment) {
      onAttachment(type);
    }
  };

  // Close attachment menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target)
      ) {
        setShowAttachmentMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Stop typing indicator on unmount
      if (roomId && userId && isTyping) {
        socketService.emitTyping(roomId, userId, false);
      }
    };
  }, [roomId, userId, isTyping]);

  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <div className="flex items-end space-x-3">
        {/* Attachment Button */}
        <div className="relative" ref={attachmentMenuRef}>
          <button
            onClick={handleAttachmentClick}
            disabled={disabled}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              disabled
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Attach file"
          >
            <Plus size={20} />
          </button>

          {/* Attachment Menu */}
          {showAttachmentMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48 z-10">
              <button
                onClick={() => handleAttachmentOption("image")}
                className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Image size={16} />
                <span>Photo</span>
              </button>
              <button
                onClick={() => handleAttachmentOption("file")}
                className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileText size={16} />
                <span>Document</span>
              </button>
              <button
                onClick={() => handleAttachmentOption("any")}
                className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Paperclip size={16} />
                <span>Browse Files</span>
              </button>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`w-full px-4 py-3 pr-12 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden ${
              disabled ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            style={{
              minHeight: "44px",
              maxHeight: "120px",
            }}
          />

          {/* Emoji Button */}
          <button
            type="button"
            disabled={disabled}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
              disabled
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-400"
            }`}
            title="Add emoji"
          >
            <Smile size={18} />
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
            message.trim() && !disabled
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Helper Text */}
      {message.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 hidden sm:block">
          Press Enter to send, Shift + Enter for new line
        </div>
      )}
    </div>
  );
};

export default MessageInput;
