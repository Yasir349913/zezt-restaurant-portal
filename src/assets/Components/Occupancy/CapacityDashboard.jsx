// CapacityDashboard.jsx - Complete with Real API Integration
import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  TrendingUp,
  Calendar,
  Users,
  Clock,
  BarChart3,
  Settings,
} from "lucide-react";
import { useRestaurant } from "../../../context/RestaurantContext";
import {
  getCapacityOverview,
  getCapacityWarnings,
  getCapacityUtilization,
  getCapacityTimeline,
  updateRestaurantCapacity,
} from "../../../api/services/Occupancyservices";

const CapacityDashboard = () => {
  const { restaurantId } = useRestaurant();

  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [warningsData, setWarningsData] = useState(null);
  const [utilizationData, setUtilizationData] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [newCapacity, setNewCapacity] = useState("");
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  // Fetch dashboard data on mount
  useEffect(() => {
    if (restaurantId) {
      fetchDashboardData();
    }
  }, [restaurantId]);

  // Fetch tab-specific data when tab changes
  useEffect(() => {
    if (restaurantId && dashboardData && !needsSetup) {
      switch (activeTab) {
        case "warnings":
          fetchWarningsData();
          break;
        case "timeline":
          fetchTimelineData();
          break;
        case "overview":
          fetchUtilizationData();
          break;
      }
    }
  }, [restaurantId, activeTab, dashboardData]);

  // API 1: Get Dashboard Overview
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setNeedsSetup(false);
      const data = await getCapacityOverview(restaurantId);
      setDashboardData(data);
      setNewCapacity(data.restaurant.totalCapacity.toString());
    } catch (err) {
      if (
        err.response?.status === 400 &&
        err.response?.data?.error === "Restaurant capacity not set"
      ) {
        setNeedsSetup(true);
        setShowCapacityModal(true);
      } else {
        setError(err.message || "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  // API 2: Get Capacity Warnings
  const fetchWarningsData = async () => {
    try {
      setTabLoading(true);
      const data = await getCapacityWarnings(restaurantId);
      setWarningsData(data);
    } finally {
      setTabLoading(false);
    }
  };

  // API 3: Get Capacity Utilization
  const fetchUtilizationData = async () => {
    try {
      setTabLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const data = await getCapacityUtilization(
        restaurantId,
        today,
        thirtyDays
      );
      setUtilizationData(data);
    } finally {
      setTabLoading(false);
    }
  };

  // API 4: Get Capacity Timeline
  const fetchTimelineData = async () => {
    try {
      setTabLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const data = await getCapacityTimeline(restaurantId, today, twoWeeks);
      setTimelineData(data.timeline || []);
    } finally {
      setTabLoading(false);
    }
  };

  // API 5: Update Restaurant Capacity
  const handleUpdateCapacity = async () => {
    const capacity = parseInt(newCapacity);
    if (isNaN(capacity) || capacity < 1) {
      alert("Please enter valid capacity");
      return;
    }
    try {
      const result = await updateRestaurantCapacity(restaurantId, capacity);
      if (result.success) {
        setShowCapacityModal(false);
        setNeedsSetup(false);
        alert(`Capacity updated to ${capacity} seats!`);
        if (result.newWarnings > 0) {
          alert(`Warning: ${result.newWarnings} new conflicts detected!`);
        }
        fetchDashboardData();
      }
    } catch (err) {
      alert(`Failed: ${err.message}`);
    }
  };

  // Helper functions
  const getHealthColor = (status) =>
    ({
      excellent: "text-green-600 bg-green-50",
      good: "text-blue-600 bg-blue-50",
      warning: "text-yellow-600 bg-yellow-50",
      critical: "text-red-600 bg-red-50",
    }[status] || "text-yellow-600 bg-yellow-50");

  const getSeverityBadge = (severity) =>
    severity === "high" ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        High Risk
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
        Medium Risk
      </span>
    );

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  // Loading state
  if (loading && !needsSetup) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading capacity data...</p>
        </div>
      </div>
    );
  }

  // Setup screen
  if (needsSetup) {
    return (
      <div className="max-w-7xl mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              Welcome to Capacity Management! 🎉
            </h2>
            <p className="text-blue-800">
              Please set your restaurant's total seating capacity to get
              started.
            </p>
          </div>
          <div className="bg-white rounded-lg border-2 border-blue-200 p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              Set Your Restaurant Capacity
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Total Seating Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xl font-semibold"
                min="1"
                placeholder="e.g., 50"
              />
            </div>
            <button
              onClick={handleUpdateCapacity}
              disabled={!newCapacity || parseInt(newCapacity) < 1}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg disabled:bg-gray-300"
            >
              {newCapacity
                ? `Set Capacity to ${newCapacity} Seats`
                : "Enter Capacity to Continue"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !needsSetup) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">Error: {error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Capacity Management
          </h1>
          <p className="text-gray-600 mt-1">{dashboardData.restaurant.name}</p>
        </div>
        <button
          onClick={() => setShowCapacityModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Update Capacity
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Capacity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Total Capacity
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {dashboardData.restaurant.totalCapacity}
              </p>
              <p className="text-xs text-gray-500 mt-1">seats available</p>
            </div>
            <Users className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        {/* Card 2: Active Deals */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Deals</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {dashboardData.summary.activeDeals}
              </p>
              <p className="text-xs text-gray-500 mt-1">running now</p>
            </div>
            <Calendar className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        {/* Card 3: Warnings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Capacity Warnings
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {dashboardData.summary.totalWarnings}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {dashboardData.summary.criticalWarnings} critical
              </p>
            </div>
            <AlertTriangle
              className={`w-12 h-12 opacity-20 ${
                dashboardData.summary.totalWarnings > 0
                  ? "text-red-600"
                  : "text-gray-400"
              }`}
            />
          </div>
        </div>

        {/* Card 4: Health Score */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Health Score</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData.summary.healthScore}
                </p>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthColor(
                    dashboardData.summary.healthStatus
                  )}`}
                >
                  {dashboardData.summary.healthStatus}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">out of 100</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {dashboardData.recommendations?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Recommendations
          </h2>
          <div className="space-y-3">
            {dashboardData.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-lg ${
                  rec.type === "warning"
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                {rec.type === "warning" ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                ) : (
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{rec.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    💡 {rec.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <div className="flex gap-4 px-6">
            {["overview", "timeline", "warnings", "deals"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium border-b-2 ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {tabLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && !tabLoading && utilizationData && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Utilization Statistics (Next 30 Days)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-medium text-gray-700">
                    Average Capacity Offered
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {utilizationData.utilization.averageCapacityOffered}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">seats per slot</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <p className="text-sm font-medium text-gray-700">
                    Utilization Rate
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {utilizationData.utilization.utilizationRate}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    bookings vs capacity
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                  <p className="text-sm font-medium text-gray-700">
                    Over-Capacity Slots
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {utilizationData.utilization.overCapacitySlots}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {utilizationData.utilization.overCapacityPercentage}% of{" "}
                    {utilizationData.utilization.totalTimeSlots} slots
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && !tabLoading && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Hour-by-Hour Capacity Timeline
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border flex gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Under Capacity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Near Capacity (80%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Over Capacity</span>
                </div>
              </div>
              {timelineData.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium">No Timeline Data</p>
                </div>
              ) : (
                timelineData.map((slot, idx) => {
                  const barColor = slot.isOverCapacity
                    ? "bg-red-500"
                    : parseFloat(slot.utilizationRate) >= 80
                    ? "bg-yellow-500"
                    : "bg-green-500";
                  const barWidth = Math.min(
                    100,
                    (slot.totalCapacity /
                      dashboardData.restaurant.totalCapacity) *
                      100
                  );
                  return (
                    <div key={idx} className="bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-semibold">
                              {formatDate(slot.timestamp)} •{" "}
                              {formatTime(slot.timestamp)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {slot.slots.length} deal(s) overlapping
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {slot.totalCapacity} / {slot.restaurantCapacity}{" "}
                            seats
                          </p>
                          <p className="text-xs text-gray-500">
                            {slot.totalBooked} booked
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className={`${barColor} h-6 rounded-full flex items-center justify-end pr-2`}
                            style={{ width: `${barWidth}%` }}
                          >
                            <span className="text-xs font-medium text-white">
                              {slot.utilizationRate}%
                            </span>
                          </div>
                        </div>
                        {slot.isOverCapacity && (
                          <AlertTriangle className="w-5 h-5 text-red-600 absolute -top-1 -right-1" />
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                        {slot.slots.map((deal, dealIdx) => (
                          <div
                            key={dealIdx}
                            className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-xs"
                          >
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="font-medium">
                              {deal.dealTitle}
                            </span>
                            <span className="text-gray-600">
                              {deal.capacity} seats ({deal.booked} booked)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Warnings Tab */}
          {activeTab === "warnings" && !tabLoading && (
            <div className="space-y-4">
              {!warningsData?.warnings || warningsData.warnings.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-medium">No Capacity Conflicts</p>
                  <p className="text-gray-600 mt-2">
                    All your deals fit within restaurant capacity!
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>
                        {warningsData.warnings.length} capacity conflicts
                      </strong>{" "}
                      detected
                    </p>
                  </div>
                  {warningsData.warnings.map((warning, idx) => (
                    <div
                      key={idx}
                      className="border border-red-200 rounded-lg p-5 bg-red-50"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-lg">
                              {new Date(
                                warning.timeSlot.date
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            {getSeverityBadge(warning.severity)}
                          </div>
                          <p className="text-sm text-gray-600">
                            ⏰ {warning.timeSlot.time}
                          </p>
                          <div className="mt-2 flex gap-4 text-sm">
                            <span className="text-red-700 font-medium">
                              ⚠️ Over by {warning.capacity.excess} seats
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 mt-3 border border-red-200">
                        <p className="text-xs font-semibold text-gray-700 mb-3 uppercase">
                          Overlapping Deals
                        </p>
                        <div className="space-y-2">
                          {warning.affectedDeals.map((deal, dealIdx) => (
                            <div
                              key={dealIdx}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <span className="text-sm font-medium">
                                {deal.title}
                              </span>
                              <span className="text-sm font-semibold">
                                {deal.capacity} seats ({deal.booked} booked)
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t flex justify-between">
                          <span className="text-sm font-semibold">
                            Current Bookings
                          </span>
                          <span className="text-sm text-green-600 font-medium">
                            {warning.capacity.booked} / {warning.capacity.total}{" "}
                            filled
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Deals Tab */}
          {activeTab === "deals" && !tabLoading && (
            <div className="space-y-3">
              {!dashboardData.deals || dashboardData.deals.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium">No Active Deals</p>
                </div>
              ) : (
                dashboardData.deals.map((deal, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-5 hover:border-blue-400 hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{deal.title}</h4>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                            <Users className="w-4 h-4" />
                            {deal.capacity} seats
                          </span>
                          <span className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                            <Clock className="w-4 h-4" />
                            {deal.dailyHours} daily
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          📅{" "}
                          {new Date(deal.dateRange.start).toLocaleDateString()}{" "}
                          - {new Date(deal.dateRange.end).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">
                          {deal.utilizationPercentage}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          of capacity
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Capacity Usage</span>
                        <span>
                          {deal.capacity} /{" "}
                          {dashboardData.restaurant.totalCapacity} seats
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full ${
                            parseFloat(deal.utilizationPercentage) > 100
                              ? "bg-red-600"
                              : parseFloat(deal.utilizationPercentage) >= 80
                              ? "bg-yellow-500"
                              : "bg-green-600"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              parseFloat(deal.utilizationPercentage)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Update Capacity Modal */}
      {showCapacityModal && !needsSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold mb-4">
              Update Restaurant Capacity
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Total Seating Capacity
              </label>
              <input
                type="number"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                💡 Set this accurately to prevent overbooking
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCapacityModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCapacity}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapacityDashboard;
