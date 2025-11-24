import React from "react";
const BookingCard = ({ name, number, percentage }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <span className="text-sm md:text-base text-gray-600 font-medium">
        {name}
      </span>
    </div>
    <div className="flex-1 flex items-center mb-2">
      <span className="text-2xl md:text-3xl font-semibold text-gray-900">
        {number}
      </span>
    </div>
    {percentage !== undefined && <div></div>}
  </div>
);

const Bookingcards = ({ stats }) => {
  // Loading state
  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg h-32 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Cards data from API
  const cardsData = [
    {
      name: "Total Bookings",
      number: stats.totalBookings || 0,
      percentage: 0,
    },
    {
      name: "Confirmed",
      number: stats.confirmedCount || 0,
      percentage: 0,
    },
    {
      name: "Pending",
      number: stats.pendingCount || 0,
      percentage: 0,
    },
    {
      name: "Cancelled",
      number: stats.cancelledCount || 0,
      percentage: 0,
    },
    {
      name: "No-Show",
      number: stats.noshowCount || 0,
      percentage: 0,
    },
    {
      name: "Total Guests",
      number: stats.totalPartySize || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
        {cardsData.map((item, idx) => (
          <BookingCard
            key={idx}
            name={item.name}
            number={item.number}
            percentage={item.percentage}
          />
        ))}
      </div>
    </div>
  );
};

export default Bookingcards;
