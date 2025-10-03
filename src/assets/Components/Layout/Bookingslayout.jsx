import React from "react";
import Bookingcards from "../Bookings/Bookingscards";
import Bookingsfilter from "../Bookings/Bookingsfilter";
import Bookingstable from "../Bookings/Bookingstable";

export default function Bookingslayout() {
  return (
    <div className="bg-gray-100 min-h-screen xl:ml-64 pt-14">
      <div className="p-6 space-y-6">
        {/* Header - Single Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Booking Management
          </h1>
        </div>

        {/* Analytics Cards */}
        <Bookingcards />

        {/* Filter and Table Container */}
        <div>
          {/* Filter */}
          <Bookingsfilter />

          {/* Table with proper wrapper */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Bookingstable />
          </div>
        </div>
      </div>
    </div>
  );
}
