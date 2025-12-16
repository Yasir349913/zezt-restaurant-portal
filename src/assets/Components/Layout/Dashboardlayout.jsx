import React, { useState, useEffect } from "react";
import WelcomeMessage from "../Dashboard/Welcomemessage";
import Revenuecards from "../Dashboard/Revenuecards";
import Revenuegraphs from "../Dashboard/Revenuegraphs";
import Loader from "../Common/Loader";
import { useRestaurant } from "../../context/RestaurantContext";

export default function Dashboardlayout() {
  const { restaurantId, loading } = useRestaurant();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Set initial load to false after component mounts
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show main loader only on initial page load
  if (loading && isInitialLoad) {
    return (
      <div className="bg-gray-100 min-h-screen xl:ml-64 pt-14">
        <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
          <Loader size="lg" text="Loading Dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen xl:ml-64 pt-14">
      <div className="p-6 space-y-6 w-full overflow-x-hidden">
        {/* Show message if no restaurant, but still show components */}
        {!restaurantId && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-yellow-800 font-medium">
                No restaurant created yet. Please create a restaurant to see
                live data.
              </p>
            </div>
          </div>
        )}

        {/* Welcome Message */}
        <WelcomeMessage />

        {/* Revenue Cards */}
        <Revenuecards restaurantId={restaurantId} />

        {/* Revenue Graphs */}
        <Revenuegraphs restaurantId={restaurantId} />

        {/* AI Suggestions */}
        {/* <Suggestions />*/}
      </div>
    </div>
  );
}
