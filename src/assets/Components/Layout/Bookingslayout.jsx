import React, { useState, useEffect } from "react";
import { useRestaurant } from "../../../context/RestaurantContext";
import { fetchBookingDashboardData } from "../../../api/services/Bookingsservice";
import Bookingcards from "../Bookings/Bookingscards";
import Bookingsfilter from "../Bookings/Bookingsfilter";
import Bookingstable from "../Bookings/Bookingstable";

export default function Bookingslayout() {
  const { restaurantId } = useRestaurant();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({});

  // ✅ Fetch bookings data
  const loadBookings = async (filters = {}) => {
    setLoading(true);
    setError(null);

    // Check localStorage fallback
    const fallbackId =
      typeof window !== "undefined"
        ? localStorage.getItem("restaurantId")
        : null;
    const idToUse = restaurantId || fallbackId;

    try {
      if (!idToUse) {
        // No restaurant - set default empty data
        setDashboardData({
          totalBookings: 0,
          confirmedCount: 0,
          pendingCount: 0,
          cancelledCount: 0,
          noshowCount: 0,
          totalPartySize: 0,
          bookings: [],
        });
        return;
      }

      const data = await fetchBookingDashboardData(idToUse, filters);
      console.log("Dashboard Data:", data);
      setDashboardData(data);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError(err.message || "Failed to load bookings");

      // On error, show empty data instead of breaking
      setDashboardData({
        totalBookings: 0,
        confirmedCount: 0,
        pendingCount: 0,
        cancelledCount: 0,
        noshowCount: 0,
        totalPartySize: 0,
        bookings: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    loadBookings();
  }, [restaurantId]);

  // ✅ Handle filter changes
  const handleFilterChange = (filters) => {
    setCurrentFilters(filters);
    loadBookings(filters);
  };

  // ✅ Refresh data after actions
  const handleRefresh = () => {
    loadBookings(currentFilters);
  };

  // Check if restaurant exists (from context or localStorage)
  const fallbackId =
    typeof window !== "undefined" ? localStorage.getItem("restaurantId") : null;
  const hasRestaurant = restaurantId || fallbackId;

  return (
    <div className="bg-gray-100 min-h-screen xl:ml-64 pt-14">
      <div className="p-6 space-y-6">
        {/* Header with Refresh Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Booking Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your restaurant bookings
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </div>

        {/* ✅ Warning banner if no restaurant (instead of blocking error) */}
        {!hasRestaurant && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">
                  No restaurant created yet
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Please create a restaurant to see live booking data. The
                  dashboard will show placeholder values until then.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message (only for API errors, not missing restaurant) */}
        {error && hasRestaurant && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* ✅ Analytics Cards - Pass stats and loading prop */}
        <Bookingcards stats={dashboardData} loading={loading} />

        {/* Filter and Table Container */}
        <div className="space-y-6">
          {/* ✅ Filter - Pass handlers and current filters */}
          <Bookingsfilter
            onFilterChange={handleFilterChange}
            currentFilters={currentFilters}
          />

          {/* ✅ Table - Pass bookings, loading state, and refresh handler */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Bookingstable
              bookings={dashboardData?.bookings || []}
              onRefresh={handleRefresh}
              loading={loading}
            />
          </div>
        </div>

        {/* Date Range Info - Only show if we have data and date range */}
        {dashboardData?.dateRange && dashboardData?.bookings?.length > 0 && (
          <div className="text-sm text-gray-500 text-center bg-white rounded-lg p-3 shadow-sm">
            📅 Showing bookings from{" "}
            <strong>
              {new Date(dashboardData.dateRange.start).toLocaleDateString()}
            </strong>{" "}
            to{" "}
            <strong>
              {new Date(dashboardData.dateRange.end).toLocaleDateString()}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}
