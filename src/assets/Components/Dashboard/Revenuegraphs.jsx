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
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

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
          throw new Error("No restaurant selected");
        }

        const data = await getDashboardData(idToUse);
        if (mounted) setDash(data);
      } catch (e) {
        console.error("Revenuegraphs load error:", e);
        setError(
          e?.response?.data?.message || e?.message || "Failed to load graphs"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (restaurantId || localStorage.getItem("restaurantId")) load();
    else {
      setLoading(false);
      setError("No restaurant selected. Create or select a restaurant first.");
    }

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

  if (loading)
    return <div className="text-sm text-gray-500">Loading graphs…</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
      {/* Revenue */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Revenue</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-gray-600">Total revenue</span>
            </div>
          </div>
        </div>

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
      </div>

      {/* Weekly Booking Trends */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Weekly Booking Trends
          </h3>
        </div>

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
              <Bar dataKey="bookings" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Revenuegraphs;
