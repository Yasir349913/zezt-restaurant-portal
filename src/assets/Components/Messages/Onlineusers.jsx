import React from "react";
import UserAvatar from "./UserAvater";

const OnlineUsers = ({ users = [] }) => {
  if (!users || users.length === 0) {
    return (
      <div className="mb-4">
        <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
          Online users
        </h3>
        <div className="flex items-center justify-start py-2">
          <div className="animate-pulse flex space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
        Online users
      </h3>
      <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        {users.slice(0, 8).map((user) => (
          <div
            key={user.id}
            className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity group"
            title={user.name}
          >
            <div className="transform group-hover:scale-105 transition-transform">
              <UserAvatar
                name={user.name}
                avatar={user.avatar}
                size="lg"
                showOnline={true}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers;
