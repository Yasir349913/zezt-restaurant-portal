// src/assets/Components/Dashboard/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Menu, User2, LogOut, Home, ExternalLink } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../Notifications/NotificationBell";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getUserDisplayName = () => {
    if (!user) return "Guest";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName} ${lastName}`.trim() || user.email || "User";
  };

  const getUserEmail = () => {
    return user?.email || "user@example.com";
  };

  const getUserInitials = () => {
    if (!user) return "G";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName.slice(0, 2).toUpperCase();
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return "U";
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/login");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white z-30 border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 xl:ml-64">
        {/* Left Section */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            className="xl:hidden p-1.5 rounded-md hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} className="text-gray-600" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
              <Home size={16} />
            </button>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
              <ExternalLink size={16} />
            </button>
          </div>

          <div className="hidden sm:flex items-center truncate">
            <span className="text-sm text-gray-500 truncate">Dashboard</span>
            <span className="text-sm text-gray-400 mx-2">/</span>
            <span className="text-sm font-medium text-gray-800 truncate">
              Overview
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* ✅ Replace old notification with NotificationBell */}
          <NotificationBell />

          {/* User Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded-md"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-sm font-medium text-gray-700">
                {getUserInitials()}
              </div>

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
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
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
