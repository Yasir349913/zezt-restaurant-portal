import React, { useEffect, useState } from "react";
import { fetchBookingItems } from "../../../api/services/Bookingsservice";

// Card Component
const Bookingcardslist = ({ name, number, percentage }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm md:text-base text-gray-600 font-medium">
          {name}
        </span>
      </div>

      {/* Main number */}
      <div className="flex-1 flex items-center mb-2">
        <span className="text-2xl md:text-3xl font-semibold text-gray-900">
          {number}
        </span>
      </div>

      {/* Bottom text */}
      <div></div>
    </div>
  );
};

// Wrapper Component
const Bookingcards = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookingItems().then((data) => {
      setBookings(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-[21px]">
        {bookings.map((item, index) => (
          <Bookingcardslist key={index} name={item.name} number={item.number} />
        ))}
      </div>
    </div>
  );
};

export default Bookingcards;
