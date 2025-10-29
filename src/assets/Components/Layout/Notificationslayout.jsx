import React, { useState } from "react";
import Notificationcards from "../Notifications/Notificationcards";
import Notificationsuggestions from "../Notifications/Notificationsuggestions";

export default function Notificationslayout() {
  const [activeTab, setActiveTab] = useState("All");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "All":
        return (
          <div className="space-y-6">
            <Notificationsuggestions activeTab="All" />
          </div>
        );

      case "Unread":
        return (
          <div className="space-y-6">
            <Notificationsuggestions activeTab="Unread" />
          </div>
        );

      case "Bookings":
        return (
          <div className="space-y-6">
            <Notificationsuggestions activeTab="Bookings" />
          </div>
        );

      case "Revenue":
        return (
          <div className="space-y-6">
            <Notificationsuggestions activeTab="Revenue" />
          </div>
        );

      case "Alerts":
        return (
          <div className="space-y-6">
            <Notificationsuggestions activeTab="Alerts" />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <Notificationsuggestions activeTab="All" />
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen xl:ml-64 pt-14">
      <div className="p-6 space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800">
          Notifications Dashboard
        </h1>

        {/* Notification Cards with Tab Navigation */}
        <Notificationcards onTabChange={handleTabChange} />

        {/* Dynamic Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
