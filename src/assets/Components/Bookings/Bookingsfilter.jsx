import React, { useState } from "react";
import { Filter, ChevronDown, X } from "lucide-react";

const Bookingsfilter = () => {
  const [filters, setFilters] = useState({
    dateRange: "Apr 21 - May 5",
    partySize: "4 guests",
    time: "19:00",
    status: "Confirmed",
  });

  const [dropdownStates, setDropdownStates] = useState({
    dateRange: false,
    partySize: false,
    time: false,
    status: false,
  });

  const dateRangeOptions = [
    "Apr 21 - May 5",
    "May 6 - May 20",
    "May 21 - Jun 5",
    "Last 7 days",
    "Last 30 days",
    "Custom Range",
  ];

  const partySizeOptions = [
    "4 guests",
    "6 guests",
    "8 guests",
    "10 guests",
    "12 guests",
    "14 guests",
  ];

  const timeOptions = ["19:00", "20:00", "21:00", "22:00", "23:00", "24:00"];
  const statusOptions = ["Confirmed", "Pending", "Cancelled", "Completed"];

  const toggleDropdown = (filterType) => {
    setDropdownStates((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const selectOption = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setDropdownStates((prev) => ({
      ...prev,
      [filterType]: false,
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: "Apr 21 - May 5",
      partySize: "4 guests",
      time: "19:00",
      status: "Confirmed",
    });
  };

  const applyFilters = () => {
    console.log("Applying filters:", filters);
  };

  const FilterDropdown = ({
    label,
    value,
    options,
    filterType,
    isOpen,
    onToggle,
    onSelect,
  }) => (
    <div className="flex flex-col w-full">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <button
          onClick={() => onToggle(filterType)}
          className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md text-left text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-center justify-between">
            <span className="truncate">{value}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => onSelect(filterType, option)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filter Deals</span>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <FilterDropdown
          label="Date Range"
          value={filters.dateRange}
          options={dateRangeOptions}
          filterType="dateRange"
          isOpen={dropdownStates.dateRange}
          onToggle={toggleDropdown}
          onSelect={selectOption}
        />
        <FilterDropdown
          label="Party Size"
          value={filters.partySize}
          options={partySizeOptions}
          filterType="partySize"
          isOpen={dropdownStates.partySize}
          onToggle={toggleDropdown}
          onSelect={selectOption}
        />
        <FilterDropdown
          label="Time"
          value={filters.time}
          options={timeOptions}
          filterType="time"
          isOpen={dropdownStates.time}
          onToggle={toggleDropdown}
          onSelect={selectOption}
        />
        <FilterDropdown
          label="Status"
          value={filters.status}
          options={statusOptions}
          filterType="status"
          isOpen={dropdownStates.status}
          onToggle={toggleDropdown}
          onSelect={selectOption}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <X className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default Bookingsfilter;
