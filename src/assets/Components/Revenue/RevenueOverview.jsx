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

const RevenueOverviewgraphs = () => {
  const { restaurantId } = useRestaurant();
  const [timingData, setTimingData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // ✅ Fetch timing data from revenue overview
        const revenueData = await getRevenueOverview(restaurantId);
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
        const billingData = await getBillingInfo(restaurantId);
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

  if (!restaurantId) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 h-64 flex items-center justify-center">
          <span className="text-gray-500">Please select a restaurant</span>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200 h-64 flex items-center justify-center">
          <span className="text-gray-500">Please select a restaurant</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200 h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Optimal Deal Timing Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 w-full h-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Daily Revenue Overview
        </h3>
        {timingData.length > 0 ? (
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
          <div className="h-56 flex items-center justify-center text-gray-500">
            No revenue data available
          </div>
        )}
      </div>

      {/* Revenue Distribution Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 w-full h-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Revenue Distribution
        </h3>
        {predictionData.length > 0 ? (
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
          <div className="h-56 flex items-center justify-center text-gray-500">
            No distribution data available
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueOverviewgraphs;
