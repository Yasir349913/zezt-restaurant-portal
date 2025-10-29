// src/assets/Components/Revenue/CardItem.jsx
import React from "react";

const Carditem = ({ name, number, percentage, subtitle }) => {
  const isPositive = percentage > 0;
  const isNegative = percentage < 0;
  const hasPercentage = percentage !== 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-h-[117px] flex flex-col justify-between hover:shadow-md transition-shadow">
      {/* Header with title and percentage badge */}
      <div className="flex justify-between items-start mb-3">
        <span className="text-gray-600 text-xs font-medium">{name}</span>

        {/* Show percentage badge only if it's not zero */}
        {hasPercentage && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              isPositive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {isPositive ? "↑" : "↓"} {Math.abs(percentage).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Main number */}
      <div className="flex-1 flex items-center">
        <span className="text-gray-900 text-2xl font-semibold break-words">
          {number}
        </span>
      </div>

      {/* Bottom text - show percentage description OR subtitle */}
      <div className="mt-2">
        {hasPercentage ? (
          <span className="text-gray-400 text-[10px] font-normal">
            {isPositive ? "+" : ""}
            {percentage.toFixed(1)}% vs last month
          </span>
        ) : subtitle ? (
          <span className="text-gray-400 text-[10px] font-normal">
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default Carditem;
