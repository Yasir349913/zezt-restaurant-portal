// src/components/Notifications/Notificationcards.jsx
import React, { useEffect, useState } from "react";
import Cardslist from "./Cardslist";
import { fetchNotificationsItems } from "../../../api/services/Notificationservices";
import { useAuth } from "../../../context/AuthContext"; // optional

const Notificationcards = ({ onTabChange, userIdProp = null }) => {
  const [activeTab, setActiveTab] = useState("Deal Performance");
  const [items, setItems] = useState([]);
  let userId = userIdProp;
  try {
    const auth = useAuth?.();
    if (!userId && auth?.user?.id) userId = auth.user.id;
  } catch (e) {}

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!userId) return;
      try {
        const data = await fetchNotificationsItems(userId);
        if (mounted) setItems(data);
      } catch (err) {
        console.error("Failed to fetch notification items:", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const navigationTabs = ["All", "Unread", "Bookings", "Deals", "Messages"];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <div className="space-y-6 px-4 md:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <Cardslist
            key={index}
            name={item.name}
            number={item.number}
            percentage={item.percentage}
          />
        ))}
      </div>

      <div className="flex flex-wrap sm:flex-nowrap w-full max-w-full sm:max-w-md border border-gray-200 rounded-md bg-white p-1 gap-2">
        {navigationTabs.map((tab) => (
          <span
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`flex-1 text-center text-sm font-medium transition-colors cursor-pointer px-2 py-2 rounded ${
              activeTab === tab
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Notificationcards;
