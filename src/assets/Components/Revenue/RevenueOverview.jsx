// src/assets/Components/Revenue/RevenueOverview.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getRevenueOverview,
  getBillingInfo,
} from "../../../api/services/Revenueservices";
import { useRestaurant } from "../../../context/RestaurantContext";
import Loader from "../Common/Loader";

const RevenueOverviewgraphs = () => {
  const { restaurantId } = useRestaurant();
  const [timingData, setTimingData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
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
          setTimingData([]);
          setPredictionData([]);
          return;
        }

        // ✅ Fetch timing data from revenue overview
        const revenueData = await getRevenueOverview(idToUse);
        const dailyRevenue = revenueData?.data?.dailyRevenue || [];

        if (dailyRevenue.length > 0) {
          const timing = dailyRevenue.slice(0, 7).map((day) => ({
            time: `Day ${day.day}`,
            bookings: Math.round(day.revenue / 100) || 0,
          }));
          setTimingData(timing);
        } else {
          setTimingData([]);
        }

        // ✅ Fetch prediction data from billing info
        const billingData = await getBillingInfo(idToUse);
        const current = billingData?.data?.currentMonth;

        if (current) {
          const revenue = Number(current.totalCommissionPaid || 0);
          const subscription = Number(current.paidSubscription || 0);
          const total = revenue + subscription;

          if (total > 0) {
            const prediction = [
              {
                name: "Revenue",
                value: Math.round((revenue / total) * 100),
                color: "#EF4444",
              },
              {
                name: "Subscription",
                value: Math.round((subscription / total) * 100),
                color: "#FCA5A5",
              },
            ];
            setPredictionData(prediction);
          } else {
            setPredictionData([]);
          }
        } else {
          setPredictionData([]);
        }
      } catch (error) {
        console.error("Error loading graph data:", error);
        // On error, show empty data (graceful fallback)
        setTimingData([]);
        setPredictionData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [restaurantId]);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const EmptyState = ({ title }) => (
    <div className="h-56 flex flex-col items-center justify-center">
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
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <p className="text-xs text-gray-400">
        Data will appear once you have activity
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Revenue Overview Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 w-full h-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Daily Revenue Overview
        </h3>
        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <Loader size="md" text="Loading daily revenue..." />
          </div>
        ) : timingData.length > 0 ? (
          <div className="relative h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timingData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#EF4444", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No revenue data available" />
        )}
      </div>

      {/* Revenue Distribution Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 w-full h-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Revenue Distribution
        </h3>
        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <Loader size="md" text="Loading distribution..." />
          </div>
        ) : predictionData.length > 0 ? (
          <div className="relative flex flex-col sm:flex-row items-center justify-center h-56 sm:h-64">
            <div className="w-full sm:w-2/3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={predictionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    innerRadius={40}
                    dataKey="value"
                  >
                    {predictionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl font-bold text-gray-800">
                  {predictionData.reduce((sum, item) => sum + item.value, 0)}%
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 sm:ml-6 space-y-2">
              {predictionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {item.name} {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="No distribution data available" />
        )}
      </div>
    </div>
  );
};

export default RevenueOverviewgraphs;
