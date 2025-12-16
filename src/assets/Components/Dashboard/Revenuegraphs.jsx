// src/assets/Components/Settings/Dashboard/Revenuegraphs.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
} from "recharts";
import { useRestaurant } from "../../../context/RestaurantContext";
import { getDashboardData } from "../../../api/Dashbord";
import Loader from "../Common/Loader";

// helpers
const dowLabel = (n) =>
  ({ 1: "Sun", 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat" }[
    n
  ] || "");

const monthName = (m) =>
  [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][(m - 1 + 12) % 12];

const Revenuegraphs = () => {
  const { restaurantId } = useRestaurant();
  const [loading, setLoading] = useState(true);
  const [dash, setDash] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      // fallback to localStorage if context is empty
      const fallbackId =
        typeof window !== "undefined"
          ? localStorage.getItem("restaurantId")
          : null;
      const idToUse = restaurantId || fallbackId;

      console.log("[Revenuegraphs] restaurantId (context):", restaurantId);
      console.log(
        "[Revenuegraphs] fallback localStorage restaurantId:",
        fallbackId
      );
      console.log("[Revenuegraphs] using id:", idToUse);

      try {
        if (!idToUse) {
          // No restaurant - set empty dash data
          if (mounted) {
            setDash({
              monthlyRevenue: [],
              bookingsByDayOfWeek: [],
            });
          }
          return;
        }

        const data = await getDashboardData(idToUse);
        if (mounted) setDash(data);
      } catch (e) {
        console.error("Revenuegraphs load error:", e);
        // Even on error, show empty graphs instead of error message
        if (mounted) {
          setDash({
            monthlyRevenue: [],
            bookingsByDayOfWeek: [],
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [restaurantId]);

  const revenueData = useMemo(() => {
    if (!dash?.monthlyRevenue) return [];
    return dash.monthlyRevenue.map((row) => ({
      month: monthName(row._id?.month),
      totalRevenue: row.revenue || 0,
    }));
  }, [dash]);

  const bookingData = useMemo(() => {
    if (!dash?.bookingsByDayOfWeek) return [];
    return dash.bookingsByDayOfWeek.map((row) => ({
      day: dowLabel(row._id?.dayOfWeek),
      bookings: row.bookings || 0,
    }));
  }, [dash]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
          <p className="font-medium">{label}</p>
          {"bookings" in data && <p>Bookings: {data.bookings}</p>}
          {"totalRevenue" in data && (
            <p>Revenue: Rs {Number(data.totalRevenue).toLocaleString()}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const EmptyState = ({ title, icon }) => (
    <div className="h-64 flex flex-col items-center justify-center">
      <div className="text-gray-300 mb-3">{icon}</div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-gray-400 text-xs mt-1">
        Data will appear once you have activity
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
        <div className="bg-white rounded-lg p-6 flex items-center justify-center h-80">
          <Loader size="md" text="Loading revenue data..." />
        </div>
        <div className="bg-white rounded-lg p-6 flex items-center justify-center h-80">
          <Loader size="md" text="Loading booking data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
      {/* Revenue */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Monthly Revenue
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-gray-600">Total revenue</span>
            </div>
          </div>
        </div>

        {revenueData.length === 0 ? (
          <EmptyState
            title="No revenue data available"
            icon={
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
          />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="#F87171"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#F87171" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Weekly Booking Trends */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Weekly Booking Trends
          </h3>
        </div>

        {bookingData.length === 0 ? (
          <EmptyState
            title="No booking data available"
            icon={
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bookingData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="bookings"
                  fill="#E57272"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Revenuegraphs;
