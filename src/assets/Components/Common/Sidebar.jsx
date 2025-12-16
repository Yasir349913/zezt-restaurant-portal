// src/assets/Components/Common/Sidebar.jsx
import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarDays,
  FileText,
  CheckSquare,
  MessageSquare,
  Building2,
  Bell,
  Settings,
  X,
  LogOut,
  CreditCard,
  Zap,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUserApi } from "../../../api/auth";
import { useSocket } from "../../../context/SocketContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/deals", label: "Deals", icon: BookOpen },
  { path: "/hot-deals", label: "Hot Deals", icon: Zap },
  { path: "/bookings", label: "Bookings", icon: ClipboardList },
  { path: "/analytics", label: "Analytics", icon: FileText },
  { path: "/revenue", label: "Revenue", icon: CheckSquare },
  { path: "/payments", label: "Payments", icon: CreditCard },
  { path: "/messages", label: "Messages", icon: MessageSquare, hasBadge: true }, // ✅ Mark messages as having badge
  { path: "/occupancy", label: "Occupancy", icon: Building2 },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [loadingLogout, setLoadingLogout] = useState(false);

  // ✅ Get unread message count from socket context
  const { unreadMessageCount, markAllMessagesAsRead } = useSocket();

  const handleNavClick = (path) => {
    // ✅ If navigating to messages page, clear the message badge
    if (path === "/messages" && unreadMessageCount > 0) {
      markAllMessagesAsRead();
    }

    if (window.innerWidth < 1280) setOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      setLoadingLogout(true);
      await logoutUserApi();
    } catch (err) {
      console.warn("Logout API error:", err);
    } finally {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("restaurantId");
      } catch (e) {
        /* ignore */
      }

      setLoadingLogout(false);
      setOpen(false);
      navigate("/login");
    }
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white z-40 transition-transform duration-300 flex flex-col
        ${open ? "translate-x-0" : "-translate-x-full"} xl:translate-x-0`}
        aria-label="Main sidebar"
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#E57272" }}
              >
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <h1 className="text-lg font-bold text-gray-800">ZEZT</h1>
            </div>
            <button
              className="p-1 rounded hover:bg-gray-100 xl:hidden transition-colors"
              onClick={() => setOpen(false)}
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 min-h-0">
          <nav className="h-full px-4 py-4">
            <div className="h-full overflow-y-auto space-y-2 pr-2 beautiful-scroll">
              {navItems.map(({ path, label, icon: Icon, hasBadge }) => {
                const isActive = currentPath === path;

                // ✅ Show badge only for messages item
                const showBadge = hasBadge && unreadMessageCount > 0;

                return (
                  <button
                    key={path}
                    onClick={() => handleNavClick(path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left relative ${
                      isActive
                        ? "text-white bg-[#E57272]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={isActive ? "text-white" : "text-gray-500"}
                    />
                    <span className="font-medium text-sm flex-1">{label}</span>

                    {/* ✅ Message Badge */}
                    {showBadge && (
                      <span
                        className={`
                        inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 
                        text-[10px] font-bold rounded-full
                        ${
                          isActive
                            ? "bg-white text-[#E57272]"
                            : "bg-[#E57272] text-white"
                        }
                        shadow-sm
                      `}
                      >
                        {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Logout */}
        <div className="flex-shrink-0 p-4">
          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left
                     text-[#E57272] hover:bg-gray-50 disabled:opacity-60"
          >
            <LogOut size={18} className="text-[#E57272]" />
            <span className="font-medium text-sm">
              {loadingLogout ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 xl:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
