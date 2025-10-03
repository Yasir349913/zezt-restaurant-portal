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
  const [loading, setLoading] = useState(false);
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
      if (!restaurantId) {
        setData(
          months.map((m) => ({
            month: m,
            rating: 0,
          }))
        );
        setAvgRatingThisYear(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const resp = await getMonthlyDealRating(restaurantId);
        // resp.deals is expected as per your API
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
        // fallback placeholder
        setData(
          months.map((m) => ({
            month: m,
            rating: 0,
          }))
        );
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
          {loading ? (
            <span>Loading...</span>
          ) : error ? (
            <span className="text-red-500">{error}</span>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500">Avg (year)</div>
              <div className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                {avgRatingThisYear ?? "-"}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-64">
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
      </div>

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
    </div>
  );
};

export default Customergraphs;
