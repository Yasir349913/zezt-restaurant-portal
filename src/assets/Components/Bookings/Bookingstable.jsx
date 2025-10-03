import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { fetchBookingDashboardData } from "../../../api/services/Bookingsservice";
import { useRestaurant } from "../../../context/RestaurantContext";

const BookingTable = () => {
  const { restaurantId } = useRestaurant();
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const totalPages = 5;

  useEffect(() => {
    if (!restaurantId) return;

    fetchBookingDashboardData(restaurantId).then((data) => {
      setBookings(data.bookings); // use `bookings` array from API
    });
  }, [restaurantId]);

  const toggleDropdown = (id) =>
    setActiveDropdown(activeDropdown === id ? null : id);

  const StatusBadge = ({ status }) => {
    const style =
      {
        confirmed: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        cancelled: "bg-red-100 text-red-800",
      }[status.toLowerCase()] || "bg-gray-100 text-gray-800";

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${style}`}>
        {status}
      </span>
    );
  };

  const PaginationButton = ({
    page,
    isActive,
    onClick,
    disabled,
    children,
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 text-sm border transition-colors rounded-md ${
        isActive
          ? "bg-blue-50 border-blue-200 text-blue-600"
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children || page}
    </button>
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-sm">
              {[
                "Customer",
                "Date",
                "Time",
                "Party Size",
                "Special Requests",
                "Status",
                "Actions",
              ].map((th) => (
                <th key={th} className="text-left py-4 px-4 text-gray-700">
                  {th}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr
                key={b._id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4">{b.customer}</td>
                <td className="py-4 px-4">{b.date}</td>
                <td className="py-4 px-4">{b.time}</td>
                <td className="py-4 px-4">{b.party_size}</td>
                <td className="py-4 px-4">{b.specialRequests}</td>
                <td className="py-4 px-4">
                  <StatusBadge status={b.status} />
                </td>
                <td className="py-4 px-4">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(b._id)}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                    {activeDropdown === b._id && (
                      <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        {["Edit", "Duplicate", "Delete"].map((action) => (
                          <button
                            key={action}
                            onClick={() => console.log(action, b._id)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 gap-4 border-t border-gray-200 text-sm">
        <div className="text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex flex-wrap gap-2">
          <PaginationButton
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </PaginationButton>
          {[...Array(totalPages)].map((_, i) => (
            <PaginationButton
              key={i + 1}
              page={i + 1}
              isActive={currentPage === i + 1}
              onClick={() => goToPage(i + 1)}
            />
          ))}
          <PaginationButton
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight className="w-4 h-4" />
          </PaginationButton>
        </div>
      </div>
    </div>
  );
};

export default BookingTable;
