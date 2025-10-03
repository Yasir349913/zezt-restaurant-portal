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
    redemptions: "All",
    status: "All",
  });

  const [dropdownStates, setDropdownStates] = useState({
    dateRange: false,
    deal: false,
    redemptions: false,
    status: false,
  });

  // Dynamic options from current month deals
  const [dealOptions, setDealOptions] = useState(["All Deals"]);
  const [redemptionOptions, setRedemptionOptions] = useState(["All"]);

  // Generate month options for last 12 months
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
  const statusOptions = ["All", "Active", "Inactive"];

  // Fetch current month deals to populate dropdowns
  useEffect(() => {
    if (!restaurantId) return;

    getAllDealsForCurrentMonth(restaurantId)
      .then((data) => {
        const dealsArray = Array.isArray(data) ? data : data?.deals || [];

        // Extract unique deal titles
        const uniqueTitles = ["All Deals"];
        dealsArray.forEach((deal) => {
          if (deal.deal_title && !uniqueTitles.includes(deal.deal_title)) {
            uniqueTitles.push(deal.deal_title);
          }
        });
        setDealOptions(uniqueTitles);

        // Extract unique redemption values and sort them
        const redemptionSet = new Set(["All"]);
        dealsArray.forEach((deal) => {
          if (deal.redemption !== undefined && deal.redemption !== null) {
            redemptionSet.add(deal.redemption.toString());
          }
        });

        const sortedRedemptions = Array.from(redemptionSet).sort((a, b) => {
          if (a === "All") return -1;
          if (b === "All") return 1;
          return Number(a) - Number(b);
        });

        setRedemptionOptions(sortedRedemptions);
      })
      .catch((err) => console.error("Failed to fetch deals for filters:", err));
  }, [restaurantId, refreshTrigger]);

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
      dateRange: "All Time",
      deal: "All Deals",
      redemptions: "All",
      status: "All",
    });
  };

  const applyFilters = async () => {
    if (!restaurantId) return;

    // Build backend filter params - only include non-default values
    const payload = {
      restaurant_id: restaurantId,
    };

    if (filters.dateRange !== "All Time") {
      payload.dateRange = filters.dateRange;
    }
    if (filters.deal !== "All Deals") {
      payload.deal = filters.deal;
    }
    if (filters.redemptions !== "All") {
      payload.redemptions = filters.redemptions;
    }
    if (filters.status !== "All") {
      payload.status = filters.status.toLowerCase();
    }

    try {
      const data = await getAllDealsUsingPortalFilters(payload);
      if (onFilterApplied) onFilterApplied(data);
    } catch (err) {
      console.error("Error applying filters:", err);
    }
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
    <div className="relative w-full sm:w-1/2 md:w-1/3 lg:w-[180px]">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => onToggle(filterType)}
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
                onClick={() => onSelect(filterType, option)}
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
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-[13px] font-medium text-gray-700">
          Filter Deals
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
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
          label="Deal"
          value={filters.deal}
          options={dealOptions}
          filterType="deal"
          isOpen={dropdownStates.deal}
          onToggle={toggleDropdown}
          onSelect={selectOption}
        />
        <FilterDropdown
          label="Redemptions"
          value={filters.redemptions}
          options={redemptionOptions}
          filterType="redemptions"
          isOpen={dropdownStates.redemptions}
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
      <div className="flex flex-wrap justify-end gap-3">
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-[13px] text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="w-[14px] h-[14px]" />
          Reset
        </button>
        <button
          onClick={applyFilters}
          className="text-white bg-[#e57272] hover:opacity-90 transition-opacity text-[13px] px-4 py-[6px] rounded font-medium"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default DealsFilter;
