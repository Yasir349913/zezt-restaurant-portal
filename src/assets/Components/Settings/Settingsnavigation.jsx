// src/assets/Components/Settings/Settingsnavigation.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Simple navigation for settings tabs.
 * - Static tabs (reliable, no external fetch)
 * - Clicking a tab navigates to /settings/<tabSlug>
 * - Accepts optional onTabChange(tab) callback and activeTab prop
 */

const DEFAULT_TABS = ["Restaurant", "Account", "Notifications", "Billing"];

const tabToSlug = {
  Restaurant: "restaurant",
  Account: "account",
  Notifications: "notifications",
  Billing: "billing",
};

const slugToTab = Object.fromEntries(
  Object.entries(tabToSlug).map(([k, v]) => [v, k])
);

const SettingsNavigation = ({
  onTabChange,
  initialTab = "Restaurant",
  activeTab: controlledActiveTab,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const deriveActiveFromPath = () => {
    const parts = location.pathname.split("/").filter(Boolean); // e.g. ["settings", "restaurant"]
    const slug = parts[1] || "restaurant";
    return slugToTab[slug] || initialTab;
  };

  const [activeTab, setActiveTab] = useState(deriveActiveFromPath());
  const [navigationTabs] = useState(DEFAULT_TABS);

  // sync active tab from parent or URL
  useEffect(() => {
    if (controlledActiveTab) {
      setActiveTab(controlledActiveTab);
    } else {
      setActiveTab(deriveActiveFromPath());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, controlledActiveTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
    const slug = tabToSlug[tab] || "restaurant";
    navigate(`/settings/${slug}`);
  };

  return (
    <div className="mb-6">
      <div className="flex bg-white w-full max-w-md h-10 rounded-md border border-gray-300 p-1 gap-1">
        {navigationTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`flex-1 flex items-center justify-center text-sm font-medium transition-colors cursor-pointer rounded ${
              activeTab === tab
                ? "bg-gray-100 text-gray-900"
                : "bg-transparent text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-2 text-xs text-gray-500">Active: {activeTab}</div>
    </div>
  );
};

export default SettingsNavigation;