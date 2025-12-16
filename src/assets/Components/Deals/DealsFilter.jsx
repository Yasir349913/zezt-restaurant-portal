import React, { useState, useEffect } from "react";
import { Filter, ChevronDown, X } from "lucide-react";
import {
  getAllDealsUsingPortalFilters,
  getAllDealsForCurrentMonth,
} from "../../../api/services/Dealsservice";
import { useRestaurant } from "../../../context/RestaurantContext";

const DealsFilter = ({ onFilterApplied, refreshTrigger }) => {
  const { restaurantId } = useRestaurant();

  const [filters, setFilters] = useState({
    dateRange: "All Time",
    deal: "All Deals",
    status: "All",
  });

  const [dropdownStates, setDropdownStates] = useState({
    dateRange: false,
    deal: false,
    status: false,
  });

  const [dealOptions, setDealOptions] = useState(["All Deals"]);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const statusOptions = ["All", "Active", "Inactive"];

  // Generate last 12 months + "All Time"
  const generateMonthOptions = () => {
    const months = ["All Time"];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      months.push(monthName);
    }
    return months;
  };
  const dateRangeOptions = generateMonthOptions();

  // Fetch deals for dropdown
  useEffect(() => {
    if (!restaurantId) return;

    getAllDealsForCurrentMonth(restaurantId)
      .then((data) => {
        const dealsArray = Array.isArray(data) ? data : data?.deals || [];
        const uniqueTitles = ["All Deals"];

        dealsArray.forEach((deal) => {
          if (deal.deal_title && !uniqueTitles.includes(deal.deal_title))
            uniqueTitles.push(deal.deal_title);
        });

        setDealOptions(uniqueTitles);
      })
      .catch((err) => console.error("Failed to fetch deals for filters:", err));
  }, [restaurantId, refreshTrigger]);

  const toggleDropdown = (filterType) => {
    setDropdownStates((prev) => ({ ...prev, [filterType]: !prev[filterType] }));
  };

  const selectOption = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    setDropdownStates((prev) => ({ ...prev, [filterType]: false }));
  };

  // Reset filters
  const resetFilters = async () => {
    const reset = {
      dateRange: "All Time",
      deal: "All Deals",
      status: "All",
    };
    setFilters(reset);
    setFiltersApplied(false);

    // Apply reset filters
    await applyFilters(reset, true);
  };

  // Convert dateRange string to startDate/endDate
  const getStartAndEndDate = (dateRange) => {
    if (dateRange === "All Time") return {};
    const [monthName, year] = dateRange.split(" ");
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0);
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  // Apply filters
  const applyFilters = async (customFilters, isReset = false) => {
    if (!restaurantId) return;
    const activeFilters = customFilters || filters;

    const { startDate, endDate } = getStartAndEndDate(activeFilters.dateRange);
    const payload = { restaurant_id: restaurantId };

    if (activeFilters.deal !== "All Deals")
      payload.dealTitle = activeFilters.deal;

    if (activeFilters.status !== "All")
      payload.status = activeFilters.status.toLowerCase();

    if (startDate) payload.startDate = startDate;
    if (endDate) payload.endDate = endDate;

    try {
      const res = await getAllDealsUsingPortalFilters(payload);
      const dealsArray = (res && (res.data ?? res)) || [];

      if (onFilterApplied) onFilterApplied(dealsArray);

      // Show Reset button whenever a filter is applied manually
      if (!isReset) setFiltersApplied(true);
    } catch (err) {
      console.error("Error applying filters:", err);
      if (onFilterApplied) onFilterApplied([]);
    }
  };

  const FilterDropdown = ({ label, value, options, filterType, isOpen }) => (
    <div className="relative w-full sm:w-1/2 md:w-1/3 lg:w-[180px]">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => toggleDropdown(filterType)}
          className="w-full bg-white border border-gray-200 rounded px-3 text-left text-sm text-gray-700 hover:border-gray-300 focus:outline-none transition-colors h-9 text-[13px]"
        >
          <div className="flex items-center justify-between">
            <span className="truncate">{value}</span>
            <ChevronDown
              className={`w-[14px] h-[14px] text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectOption(filterType, option)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors text-[13px]"
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
    <div className="bg-white rounded-md p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-[13px] font-medium text-gray-700">
          Filter Deals
        </span>
      </div>
      <div className="flex flex-wrap gap-4 mb-4">
        <FilterDropdown
          label="Date Range"
          value={filters.dateRange}
          options={dateRangeOptions}
          filterType="dateRange"
          isOpen={dropdownStates.dateRange}
        />
        <FilterDropdown
          label="Deal"
          value={filters.deal}
          options={dealOptions}
          filterType="deal"
          isOpen={dropdownStates.deal}
        />
        <FilterDropdown
          label="Status"
          value={filters.status}
          options={statusOptions}
          filterType="status"
          isOpen={dropdownStates.status}
        />
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        {filtersApplied && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[13px] text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-[6px] rounded font-medium border border-gray-300"
          >
            <X className="w-[14px] h-[14px]" /> Reset
          </button>
        )}
        <button
          onClick={() => applyFilters()}
          className="text-white bg-[#e57272] hover:opacity-90 transition-opacity text-[13px] px-4 py-[6px] rounded font-medium"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default DealsFilter;
