import React from "react";

const UserAvatar = ({ name, avatar, size = "md", showOnline = false }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-sm",
    xl: "w-16 h-16 text-base",
  };

  const onlineIndicatorSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Use consistent light grey background for all avatars
  const backgroundColorClass = "bg-gray-300";

  const displayAvatar = avatar || getInitials(name);

  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizeClasses[size]} ${backgroundColorClass} rounded-full flex items-center justify-center text-gray-700 font-medium transition-all duration-200`}
      >
        {typeof displayAvatar === "string" ? (
          <span className="select-none">{displayAvatar}</span>
        ) : (
          displayAvatar
        )}
      </div>
      {showOnline && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 ${onlineIndicatorSizes[size]} bg-green-500 border-2 border-white rounded-full transition-all duration-200`}
        ></div>
      )}
    </div>
  );
};

export default UserAvatar;
