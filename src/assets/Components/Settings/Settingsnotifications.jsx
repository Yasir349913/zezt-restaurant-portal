import React, { useState, useEffect } from "react";

const NotificationsSettings = () => {
  const [notifications, setNotifications] = useState({});
  const [notificationItems, setNotificationItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    Promise.all([fetchNotificationSettings(), fetchNotificationItems()])
      .then(([settings, items]) => {
        setNotifications(settings);
        setNotificationItems(items);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching notification data:", error);
        setLoading(false);
      });
  }, []);

  const handleToggle = async (key) => {
    const previousSettings = { ...notifications };
    const newSettings = { ...notifications, [key]: !notifications[key] };

    // Optimistically update UI
    setNotifications(newSettings);

    setUpdating(true);
    try {
      const result = await updateNotificationSettings(newSettings);
      console.log("Settings updated:", result.message);
    } catch (error) {
      // Revert on error
      setNotifications(previousSettings);
      alert("Error updating notification settings");
      console.error("Update error:", error);
    }
    setUpdating(false);
  };

  const ToggleSwitch = ({ isOn, onToggle, disabled = false }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        isOn ? "bg-red-400" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isOn ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  if (loading) {
    return (
      <div
        className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center"
        style={{ width: "893px", height: "384px" }}
      >
        <div className="text-gray-500">Loading notification settings...</div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-6"
      style={{
        width: "893px",
        height: "384px",
        top: "268px",
        left: "390px",
      }}
    >
      <div className="space-y-6">
        {notificationItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <div className="ml-6">
              <ToggleSwitch
                isOn={notifications[item.key] || false}
                onToggle={() => handleToggle(item.key)}
                disabled={updating}
              />
            </div>
          </div>
        ))}
      </div>

      {updating && (
        <div className="absolute top-4 right-4">
          <div className="text-xs text-gray-500">Updating...</div>
        </div>
      )}
    </div>
  );
};

export default NotificationsSettings;
