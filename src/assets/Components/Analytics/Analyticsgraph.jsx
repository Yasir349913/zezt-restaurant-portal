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

const Analyticsgraph = () => {
  const { restaurantId } = useRestaurant();
  const [chartData, setChartData] = useState([]);
  const [dealNames, setDealNames] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getRestaurantDealsPerformance(restaurantId);
        // data.deals -> [{ dealId, dealTitle, performance: [{ day, totalBookings }] }]
        const deals = data.deals || [];

        // Take up to 2 deals for the chart (or dynamically handle more if you want)
        const selected = deals.slice(0, 2);
        setDealNames(selected.map((d) => d.dealTitle || "Deal"));

        // Build chart rows keyed by day name (Monday..Sunday)
        // performance arrays are assumed to be in order Monday -> Sunday.
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
      </div>

      <div className="h-64">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            Loading chart…
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
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
