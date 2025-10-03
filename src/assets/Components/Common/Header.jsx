import React, { useState, useRef, useEffect } from "react";
import { Bell, Menu, User2, LogOut, Home, ExternalLink } from "lucide-react";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const bellRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    console.log("Logging out...");
  };

  const getUserDisplayName = () => "John Miles";
  const getUserEmail = () => "john.miles@example.com";
  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white z-30 border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 xl:ml-64">
        {/* Left Section: Menu + Icons + Breadcrumb */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Mobile Menu Button */}
          <button
            className="xl:hidden p-1.5 rounded-md hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} className="text-gray-600" />
          </button>

          {/* Navigation Icons */}
          <div className="hidden sm:flex items-center gap-2">
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
              <Home size={16} />
            </button>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
              <ExternalLink size={16} />
            </button>
          </div>

          {/* Breadcrumb/Title */}
          <div className="hidden sm:flex items-center truncate">
            <span className="text-sm text-gray-500 truncate">Dashboard</span>
            <span className="text-sm text-gray-400 mx-2">/</span>
            <span className="text-sm font-medium text-gray-800 truncate">
              Overview
            </span>
          </div>
        </div>

        {/* Right Section: Notifications + User */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <Bell size={18} />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-md p-3 z-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">
                    Notifications
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    2
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-teal-50 rounded border border-teal-100">
                    <p className="text-gray-800">Register for next semester</p>
                    <p className="text-gray-500 text-xs">2 min ago</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-800">Fee challan available</p>
                    <p className="text-gray-500 text-xs">1 hour ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded-md"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-sm font-medium text-gray-700">
                <img
                  src="/api/placeholder/32/32"
                  alt="User"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.textContent = getUserInitials();
                  }}
                />
              </div>

              {/* Username (hide on xs screens) */}
              <div className="hidden sm:block text-left max-w-[120px] truncate">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {getUserDisplayName()}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 shadow-md rounded-md z-50 py-1">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {getUserEmail()}
                  </p>
                </div>
                <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User2 size={14} className="mr-2" />
                  View Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
