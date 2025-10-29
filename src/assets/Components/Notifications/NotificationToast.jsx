import { useEffect, useState } from "react";
import { useNotifications } from "../../../context/NotificationContext";

export default function NotificationToast() {
  const { notifications } = useNotifications();
  const [visibleToasts, setVisibleToasts] = useState([]);

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];

      // Only show toast for unread notifications
      if (!latestNotification.isRead) {
        const toastId = latestNotification._id;

        // Add to visible toasts
        setVisibleToasts((prev) => {
          // Avoid duplicates
          if (prev.find((t) => t._id === toastId)) return prev;
          return [latestNotification, ...prev].slice(0, 3); // Max 3 toasts
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
          setVisibleToasts((prev) => prev.filter((t) => t._id !== toastId));
        }, 5000);
      }
    }
  }, [notifications]);

  const removeToast = (toastId) => {
    setVisibleToasts((prev) => prev.filter((t) => t._id !== toastId));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {visibleToasts.map((toast, index) => (
        <div
          key={toast._id}
          className="animate-slide-in-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 p-4 max-w-sm"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">🔔</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{toast.title}</p>
              <p className="mt-1 text-sm text-gray-600">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast._id)}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
