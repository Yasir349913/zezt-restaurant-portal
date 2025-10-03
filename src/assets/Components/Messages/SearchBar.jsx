import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({
  placeholder = "Search conversations...",
  onSearch,
  value,
  onChange,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    if (onChange) {
      onChange(newValue);
    }

    if (onSearch) {
      onSearch(newValue);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    if (onChange) {
      onChange("");
    }
    if (onSearch) {
      onSearch("");
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search
          size={16}
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
            isFocused ? "text-blue-500" : "text-gray-400"
          }`}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-all duration-200 border-0 ${
            disabled
              ? "bg-gray-200 cursor-not-allowed text-gray-500"
              : isFocused
              ? "bg-white ring-2 ring-blue-500 shadow-sm"
              : "bg-gray-100 hover:bg-gray-50"
          } focus:outline-none placeholder-gray-500`}
        />
        {searchTerm && !disabled && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
            title="Clear search"
          >
            <X size={14} className="text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
