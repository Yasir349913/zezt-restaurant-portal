import React, { useState } from "react";
import CapacityDashboard from "../Occupancy/CapacityDashboard";

export default function Occupancylayout() {
  return (
    <div className="xl:ml-64 pt-14 bg-gray-100 min-h-screen">
      <div className="p-6 space-y-6">
        {/* Header - Single Title */}
        <h1 className="text-2xl font-bold text-gray-800">Occupancy Tracking</h1>

        {/* Occupancy Tracking Component - Only show once */}
        <CapacityDashboard />
      </div>
    </div>
  );
}
