// src/components/Dashboard/Customergraphs.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { getMonthlyDealRating } from "../../../api/services/Analyticsservice";
import { useRestaurant } from "../../../context/RestaurantContext";
import Loader from "../Common/Loader";

const months = [
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
];

const Customergraphs = () => {
  const { restaurantId } = useRestaurant();
  const [data, setData] = useState([]);
  const [avgRatingThisYear, setAvgRatingThisYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to build month-averages across deals
  const buildMonthlyAverages = (apiResponseDeals) => {
    // apiResponseDeals: [{ dealId, dealTitle, monthlyRatings: [{ month, totalRating, avgRating }, ...] }, ...]
    if (!Array.isArray(apiResponseDeals) || apiResponseDeals.length === 0) {
      return months.map((m) => ({ month: m, rating: 0 }));
    }

    // For each month index, compute average of avgRating across deals
    const monthAggregates = months.map(() => ({ sum: 0, count: 0 }));

    apiResponseDeals.forEach((deal) => {
      const monthlyRatings = deal.monthlyRatings || [];
      monthlyRatings.forEach((mr, idx) => {
        // mr.avgRating might be Number or string; coerce to Number and ignore invalid
        const val = Number(mr.avgRating);
        if (!Number.isNaN(val) && val !== 0) {
          monthAggregates[idx].sum += val;
          monthAggregates[idx].count += 1;
        }
      });
    });

    const result = monthAggregates.map((agg, idx) => {
      const rating = agg.count > 0 ? +(agg.sum / agg.count).toFixed(2) : 0;
      return { month: months[idx], rating };
    });

    return result;
  };

  useEffect(() => {
    const fetchData = async () => {
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
          setData(months.map((m) => ({ month: m, rating: 0 })));
          setAvgRatingThisYear(0);
          return;
        }

        const resp = await getMonthlyDealRating(idToUse);
        const deals = resp?.deals ?? [];

        const monthlyData = buildMonthlyAverages(deals);
        setData(monthlyData);

        // compute yearly average (avg of non-zero months)
        const validMonths = monthlyData.filter((d) => d.rating > 0);
        const yearlyAvg =
          validMonths.length > 0
            ? +(
                validMonths.reduce((s, it) => s + it.rating, 0) /
                validMonths.length
              ).toFixed(2)
            : 0;
        setAvgRatingThisYear(yearlyAvg);
      } catch (err) {
        console.error("Failed to fetch monthly deal ratings:", err);
        setError("Failed to load data");
        // fallback placeholder (graceful fallback)
        setData(months.map((m) => ({ month: m, rating: 0 })));
        setAvgRatingThisYear(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Customer Satisfaction Trends
        </h3>

        <div className="text-sm text-gray-600">
          {!loading && !error && (
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500">Avg (year)</div>
              <div className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                {avgRatingThisYear ?? "0"}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-64">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader size="md" text="Loading satisfaction data..." />
          </div>
        ) : error ? (
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
              No satisfaction data available
            </p>
            <p className="text-xs text-gray-400">
              Data will appear once you have rated deals
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
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
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
              />

              <ReferenceLine x="Jun" stroke="#E5E7EB" strokeDasharray="2 2" />

              <Tooltip
                formatter={(value) =>
                  typeof value === "number" ? value.toFixed(2) : value
                }
              />

              <Line
                type="monotone"
                dataKey="rating"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {!loading && !error && (
        <div className="mt-4 flex justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Peak month (approx)</p>
            <p className="text-lg font-semibold text-gray-800">
              {data && data.length
                ? (() => {
                    const max = data.reduce(
                      (mx, d) => (d.rating > mx.rating ? d : mx),
                      { month: "-", rating: -1 }
                    );
                    return `${max.month} — ${max.rating || 0}`;
                  })()
                : "-"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customergraphs;
