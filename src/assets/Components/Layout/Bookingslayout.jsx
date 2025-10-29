import React, { useState, useEffect } from "react";
import { useRestaurant } from "../../../context/RestaurantContext";
import { fetchBookingDashboardData } from "../../../api/services/Bookingsservice";
import Bookingcards from "../Bookings/Bookingscards";
import Bookingsfilter from "../Bookings/Bookingsfilter";
import Bookingstable from "../Bookings/Bookingstable";

export default function Bookingslayout() {
  const { restaurantId } = useRestaurant(); // ✅ Get restaurant ID
  const [dashboardData, setDashboardData] = useState(null); // ✅ Store data
  const [loading, setLoading] = useState(true); // ✅ Loading state
  const [error, setError] = useState(null); // ✅ Error state
  const [currentFilters, setCurrentFilters] = useState({}); // ✅ Filter state

  // ✅ Fetch bookings data
  const loadBookings = async (filters = {}) => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchBookingDashboardData(restaurantId, filters);
      console.log("Dashboard Data:", data); // Debug
      setDashboardData(data);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError(err.message || "Failed to load bookings");
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

  // ✅ Check restaurant ID
  if (!restaurantId) {
    return (
      <div className="bg-gray-100 min-h-screen xl:ml-64 pt-14">
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Restaurant ID not found. Please log in again.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* ✅ Analytics Cards - Pass stats prop */}
        <Bookingcards stats={dashboardData} />

        {/* Filter and Table Container */}
        <div className="space-y-6">
          {/* ✅ Filter - Pass handlers and current filters */}
          <Bookingsfilter
            onFilterChange={handleFilterChange}
            currentFilters={currentFilters}
          />

          {/* Table with Loading State */}
          {loading && !dashboardData ? (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading bookings...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              {/* ✅ Table - Pass bookings and refresh handler */}
              <Bookingstable
                bookings={dashboardData?.bookings || []}
                onRefresh={handleRefresh}
              />
            </div>
          )}
        </div>

        {/* Date Range Info */}
        {dashboardData?.dateRange && (
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
