// src/components/Analytics/Analyticsgraph.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  Legend,
} from "recharts";
import { getRestaurantDealsPerformance } from "../../../api/services/Analyticsservice";
import { useRestaurant } from "../../../context/RestaurantContext";
import Loader from "../Common/Loader";
const Analyticsgraph = () => {
  const { restaurantId } = useRestaurant();
  const [chartData, setChartData] = useState([]);
  const [dealNames, setDealNames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Check localStorage fallback
      const fallbackId =
        typeof window !== "undefined"
          ? localStorage.getItem("restaurantId")
          : null;
      const idToUse = restaurantId || fallbackId;

      try {
        if (!idToUse) {
          // No restaurant - set empty data
          setChartData([]);
          setDealNames([]);
          return;
        }

        const data = await getRestaurantDealsPerformance(idToUse);
        // data.deals -> [{ dealId, dealTitle, performance: [{ day, totalBookings }] }]
        const deals = data.deals || [];

        // Take up to 2 deals for the chart
        const selected = deals.slice(0, 2);
        setDealNames(selected.map((d) => d.dealTitle || "Deal"));

        // Build chart rows keyed by day name (Monday..Sunday)
        const days =
          selected.length > 0 ? selected[0].performance.map((p) => p.day) : [];
        const rows = days.map((day, idx) => {
          const row = { day };
          selected.forEach((d, di) => {
            row[`deal${di + 1}`] = d.performance[idx]?.totalBookings ?? 0;
          });
          return row;
        });

        setChartData(rows);
      } catch (err) {
        console.error("Failed to load deals performance:", err);
        // On error, show empty data (graceful fallback)
        setChartData([]);
        setDealNames([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [restaurantId]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Deal Performance Comparison
        </h3>
        {!loading && dealNames.length > 0 && (
          <div className="flex items-center gap-6 text-sm">
            {dealNames.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    i === 0 ? "bg-red-500" : "bg-blue-500"
                  }`}
                />
                <span className="text-gray-600">{name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-64">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader size="md" text="Loading performance data..." />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-300 mb-3"
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
            <p className="text-sm text-gray-500 font-medium mb-1">
              No performance data available
            </p>
            <p className="text-xs text-gray-400">
              Data will appear once you have deals with bookings
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
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
              <Tooltip />
              <Legend />
              <ReferenceLine y={0} stroke="#e5e7eb" />
              <Line
                type="monotone"
                dataKey="deal1"
                stroke="#EF4444"
                strokeWidth={2}
                dot
              />
              {dealNames[1] && (
                <Line
                  type="monotone"
                  dataKey="deal2"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Analyticsgraph;
