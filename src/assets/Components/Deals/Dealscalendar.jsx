import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllDealsForCurrentMonth } from "../../../api/services/Dealsservice";

const Dealscalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11));
  const [events, setEvents] = useState({});
  const [months, setMonths] = useState([
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]);
  const [daysOfWeek, setDaysOfWeek] = useState([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ]);

  useEffect(() => {
    getAllDealsForCurrentMonth().then((deals) => {
      const eventsByDate = {};
      deals.forEach((deal) => {
        const dateKey = deal.deal_start_date.split("T")[0]; // YYYY-MM-DD
        if (!eventsByDate[dateKey]) eventsByDate[dateKey] = [];
        eventsByDate[dateKey].push({
          title: deal.deal_title,
          type: "scheduled",
        });
      });
      setEvents(eventsByDate);
    });
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Adjust so Monday = 0
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-20 border border-gray-200"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayEvents = events[dateKey] || [];

      days.push(
        <div
          key={day}
          className="h-20 border border-gray-200 p-1 relative text-xs sm:text-sm"
        >
          <div className="font-medium text-gray-900">{day}</div>
          {dayEvents.map((event, index) => (
            <div
              key={index}
              className={`px-1 py-0.5 rounded mt-1 truncate ${
                event.type === "scheduled"
                  ? "bg-green-100 text-green-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 bg-white max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>

          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
          <span>AI's Suggested</span>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-medium text-gray-700 bg-gray-50">
        {daysOfWeek.map((day) => (
          <div key={day} className="p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0 border border-gray-200">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default Dealscalendar;
