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
  fetchPredictionData,
  fetchTimingData,
} from "../../../api/services/Analyticsservices";

const Aurainsightgraphs = () => {
  const [timingData, setTimingData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);

  useEffect(() => {
    fetchTimingData().then((data) => setTimingData(data));
    fetchPredictionData().then((data) => setPredictionData(data));
  }, []);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Optimal Deal Timing Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 w-full h-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Optimal Deal Timing
        </h3>
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
                domain={[0, 40]}
                ticks={[0, 10, 20, 30, 40]}
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
          <div className="absolute bg-red-500 text-white px-2 py-1 rounded text-xs font-medium left-1/2 top-[60px] -translate-x-1/2">
            18 Bookings
          </div>
        </div>
      </div>

      {/* Prediction Accuracy Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 w-full h-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Prediction Accuracy
        </h3>
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
              <div className="text-2xl font-bold text-gray-800">40%</div>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 sm:ml-6 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Occupancy 60%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-300"></div>
              <span className="text-sm text-gray-600">Revenue 40%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Aurainsightgraphs;
