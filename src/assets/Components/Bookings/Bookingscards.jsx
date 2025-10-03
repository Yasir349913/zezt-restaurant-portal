import React, { useEffect, useState } from "react";
import { fetchBookingDashboardData } from "../../../api/services/Bookingsservice";
import { useRestaurant } from "../../../context/RestaurantContext";

const BookingCard = ({ name, number, percentage }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <span className="text-sm md:text-base text-gray-600 font-medium">
        {name}
      </span>
      <span className="text-xs md:text-sm text-green-500 font-medium">
        +{percentage}%
      </span>
    </div>
    <div className="flex-1 flex items-center mb-2">
      <span className="text-2xl md:text-3xl font-semibold text-gray-900">
        {number}
      </span>
    </div>
    <div>
      <span className="text-xs md:text-sm text-gray-400">
        +{percentage}% in the last 1 month
      </span>
    </div>
  </div>
);

const BookingCards = () => {
  const { restaurantId } = useRestaurant();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!restaurantId) return;

    fetchBookingDashboardData(restaurantId).then((data) => {
      // Example: transform stats into cards
      const cardsData = [
        { name: "Total Bookings", number: data.totalBookings, percentage: 0 },
        { name: "Confirmed", number: data.confirmedCount, percentage: 0 },
        { name: "Pending", number: data.pendingCount, percentage: 0 },
        { name: "Cancelled", number: data.cancelledCount, percentage: 0 },
      ];
      setBookings(cardsData);
    });
  }, [restaurantId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
        {bookings.map((item, idx) => (
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

export default BookingCards;
