import React, { useState, useEffect } from "react";
import { Filter, ChevronDown, X, Calendar } from "lucide-react";

const Bookingsfilter = ({ onFilterChange, currentFilters }) => {
  const [filters, setFilters] = useState({
    startDate: currentFilters?.startDate || "",
    endDate: currentFilters?.endDate || "",
    status: currentFilters?.status || "",
  });

  const [dropdownStates, setDropdownStates] = useState({
    status: false,
    dateRange: false,
  });

  const [filtersApplied, setFiltersApplied] = useState(false);

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
    { value: "noshow", label: "No-Show" },
  ];

  const dateRangePresets = [
    {
      label: "Today",
      getValue: () => {
        const today = new Date().toISOString().split("T")[0];
        return { startDate: today, endDate: today };
      },
    },
    {
      label: "This Week",
      getValue: () => {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return {
          startDate: monday.toISOString().split("T")[0],
          endDate: sunday.toISOString().split("T")[0],
        };
      },
    },
    {
      label: "Last 7 Days",
      getValue: () => {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return {
          startDate: weekAgo.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      },
    },
    {
      label: "Last 30 Days",
      getValue: () => {
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);
        return {
          startDate: monthAgo.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      },
    },
  ];

  const toggleDropdown = (filterType) => {
    setDropdownStates((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const selectStatus = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setDropdownStates((prev) => ({ ...prev, status: false }));
  };

  const selectDateRange = (preset) => {
    const dates = preset.getValue();
    setFilters((prev) => ({ ...prev, ...dates }));
    setDropdownStates((prev) => ({ ...prev, dateRange: false }));
  };

  const resetFilters = () => {
    const reset = {
      startDate: "",
      endDate: "",
      status: "",
    };
    setFilters(reset);
    setFiltersApplied(false);

    // Apply reset filters to fetch all data
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const applyFilters = () => {
    const cleanFilters = {};
    if (filters.startDate) cleanFilters.startDate = filters.startDate;
    if (filters.endDate) cleanFilters.endDate = filters.endDate;
    if (filters.status) cleanFilters.status = filters.status;

    setFiltersApplied(true);

    if (onFilterChange) {
      onFilterChange(cleanFilters);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          Filter Bookings
        </span>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Date Range Preset */}
        <div className="flex flex-col w-full">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Quick Date Range
          </label>
          <div className="relative">
            <button
              onClick={() => toggleDropdown("dateRange")}
              className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md text-left text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-center justify-between">
                <span className="truncate">Select Range</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    dropdownStates.dateRange ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
            </button>

            {dropdownStates.dateRange && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                {dateRangePresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => selectDateRange(preset)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Start Date */}
        <div className="flex flex-col w-full">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col w-full">
          <label className="text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col w-full">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <div className="relative">
            <button
              onClick={() => toggleDropdown("status")}
              className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md text-left text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-center justify-between">
                <span className="truncate">
                  {statusOptions.find((opt) => opt.value === filters.status)
                    ?.label || "All Statuses"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    dropdownStates.status ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
            </button>

            {dropdownStates.status && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {statusOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectStatus(option.value)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-2">
        {filtersApplied && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors rounded-md font-medium border border-gray-300"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        )}
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default Bookingsfilter;
