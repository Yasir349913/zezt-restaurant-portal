// src/assets/Components/Deals/CreateDealModal.jsx
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { createNewDeal } from "../../../api/services/Dealsservice";
import { useRestaurant } from "../../../context/RestaurantContext";

const CreateDealModal = ({ isOpen, onClose, onDealCreated }) => {
  const { restaurantId } = useRestaurant();

  // Form state including all required & optional fields
  const [formData, setFormData] = useState({
    deal_title: "",
    deal_start_date: "",
    deal_expires_at: "",
    deal_status: "active",
    deal_price: 0, // Will be auto-calculated
    slot_duration: "",
    max_capacity: "",
    deal_description: "",
    deal_discount: "",
    deal_menu: [],
    deal_expires_in: 0,
  });

  // Local datetime inputs (will be converted to UTC)
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  const [menuItems, setMenuItems] = useState([
    { item_name: "", item_price: "", item_description: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Comprehensive error states for all fields
  const [errors, setErrors] = useState({
    deal_title: "",
    deal_start_date: "",
    deal_expires_at: "",
    slot_duration: "",
    max_capacity: "",
    deal_discount: "",
    deal_description: "",
    menuItems: {}, // For individual menu item errors
    menuItemNames: {}, // For menu item name errors
    menuItemDescriptions: {}, // For menu item description errors
  });

  // Calculate deal_expires_in (daily duration in hours) whenever dates change
  useEffect(() => {
    if (startDateTime && endDateTime) {
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);
      // Extract time components
      const startHours = start.getHours();
      const startMinutes = start.getMinutes();
      const endHours = end.getHours();
      const endMinutes = end.getMinutes();

      // Calculate daily duration in hours
      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;

      let dailyDurationMinutes = endTimeInMinutes - startTimeInMinutes;

      // Handle cases where end time is on next day
      if (dailyDurationMinutes < 0) {
        dailyDurationMinutes += 24 * 60;
      }

      const dailyDurationHours = dailyDurationMinutes / 60;

      if (dailyDurationHours > 0) {
        setFormData((prev) => ({
          ...prev,
          deal_expires_in: Math.round(dailyDurationHours),
        }));
      }
    }
  }, [startDateTime, endDateTime]);

  // ✅ AUTO-CALCULATE deal price from menu items
  useEffect(() => {
    const validMenuItems = menuItems.filter(
      (item) =>
        item.item_name &&
        item.item_price !== "" &&
        item.item_price !== null &&
        item.item_description
    );

    if (validMenuItems.length > 0) {
      const totalPrice = validMenuItems.reduce(
        (sum, item) => sum + Number(item.item_price || 0),
        0
      );

      setFormData((prev) => ({
        ...prev,
        deal_price: totalPrice,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        deal_price: 0,
      }));
    }
  }, [menuItems]);

  // Convert local datetime to UTC ISO string
  const convertToUTC = (localDateTime) => {
    if (!localDateTime) return "";
    const date = new Date(localDateTime);
    return date.toISOString();
  };

  // ✅ Validate deal title
  const validateDealTitle = (value) => {
    if (!value || value.trim() === "") {
      return "Deal title is required";
    }
    if (value.trim().length < 3) {
      return "Deal title must be at least 3 characters";
    }
    if (value.length > 100) {
      return "Deal title must not exceed 100 characters";
    }
    // Allow letters, numbers, spaces, and common punctuation
    if (!/^[a-zA-Z0-9\s,.'&!%-]+$/.test(value)) {
      return "Deal title contains invalid characters";
    }
    return "";
  };

  // ✅ Validate deal description
  const validateDescription = (value) => {
    if (!value || value.trim() === "") {
      return "Description is required";
    }
    if (value.trim().length < 10) {
      return "Description must be at least 10 characters";
    }
    if (value.length > 500) {
      return "Description must not exceed 500 characters";
    }
    return "";
  };

  // ✅ Validate menu item name
  const validateMenuItemName = (value) => {
    if (!value || value.trim() === "") {
      return "Item name is required";
    }
    if (value.trim().length < 2) {
      return "Item name must be at least 2 characters";
    }
    if (value.length > 50) {
      return "Item name must not exceed 50 characters";
    }
    // Allow letters, numbers, spaces, and common punctuation
    if (!/^[a-zA-Z0-9\s,.'&!%-]+$/.test(value)) {
      return "Item name contains invalid characters";
    }
    return "";
  };

  // ✅ Validate menu item description
  const validateMenuItemDescription = (value) => {
    if (!value || value.trim() === "") {
      return "Item description is required";
    }
    if (value.trim().length < 5) {
      return "Item description must be at least 5 characters";
    }
    if (value.length > 200) {
      return "Item description must not exceed 200 characters";
    }
    return "";
  };

  // ✅ FIXED: Validate dates and times - same date allowed but end time must be after start time
  const validateDateTime = (startDT, endDT) => {
    if (!startDT || !endDT) return null;

    const startDate = new Date(startDT);
    const endDate = new Date(endDT);

    // Get date parts (without time)
    const startDateOnly = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const endDateOnly = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

    // Check if end date is before start date
    if (endDateOnly < startDateOnly) {
      return "End date cannot be before start date";
    }

    // If same date, check times
    if (startDateOnly.getTime() === endDateOnly.getTime()) {
      // Same date - compare times
      const startTime = startDate.getHours() * 60 + startDate.getMinutes();
      const endTime = endDate.getHours() * 60 + endDate.getMinutes();

      if (endTime <= startTime) {
        return "End time must be after start time";
      }
    }

    // If different dates, end date must be after start date (already checked above)
    return null; // No error
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setStartDateTime(value);
    setFormData((prev) => ({
      ...prev,
      deal_start_date: convertToUTC(value),
    }));

    // ✅ Validate start date
    if (!value) {
      setErrors((prev) => ({
        ...prev,
        deal_start_date: "Start date & time is required",
        deal_expires_at: prev.deal_expires_at, // Keep end date error if exists
      }));
    } else {
      const startDate = new Date(value);
      const now = new Date();

      if (startDate < now) {
        setErrors((prev) => ({
          ...prev,
          deal_start_date: "Start date cannot be in the past",
        }));
      } else {
        setErrors((prev) => ({ ...prev, deal_start_date: "" }));

        // ✅ Check against end date if it exists
        if (endDateTime) {
          const dateTimeError = validateDateTime(value, endDateTime);
          if (dateTimeError) {
            setErrors((prev) => ({
              ...prev,
              deal_expires_at: dateTimeError,
            }));
          } else {
            setErrors((prev) => ({ ...prev, deal_expires_at: "" }));
          }
        }
      }
    }
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    setEndDateTime(value);
    setFormData((prev) => ({
      ...prev,
      deal_expires_at: convertToUTC(value),
    }));

    // ✅ Validate end date
    if (!value) {
      setErrors((prev) => ({
        ...prev,
        deal_expires_at: "End date & time is required",
      }));
    } else if (startDateTime) {
      const dateTimeError = validateDateTime(startDateTime, value);
      if (dateTimeError) {
        setErrors((prev) => ({
          ...prev,
          deal_expires_at: dateTimeError,
        }));
      } else {
        setErrors((prev) => ({ ...prev, deal_expires_at: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, deal_expires_at: "" }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // ✅ Handle deal title validation
    if (name === "deal_title") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      const error = validateDealTitle(value);
      setErrors((prev) => ({ ...prev, deal_title: error }));
      return;
    }

    // ✅ Handle description validation
    if (name === "deal_description") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      const error = validateDescription(value);
      setErrors((prev) => ({ ...prev, deal_description: error }));
      return;
    }

    // ✅ Validation for numeric fields - FIXED to allow typing
    if (["slot_duration", "max_capacity", "deal_discount"].includes(name)) {
      // Allow empty string
      if (value === "") {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        return;
      }

      const numValue = Number(value);

      // ✅ FIXED: Always update the value first so user can type
      setFormData((prev) => ({ ...prev, [name]: numValue }));

      // Clear previous error
      setErrors((prev) => ({ ...prev, [name]: "" }));

      // Validate and show errors (but don't prevent input)
      // Prevent negative values for all numeric fields
      if (numValue < 0) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Cannot be negative",
        }));
        return;
      }

      // Prevent zero for slot_duration and max_capacity (discount can be 0)
      if (name !== "deal_discount" && numValue === 0) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Must be greater than 0",
        }));
        return;
      }

      // ✅ Additional validation for slot_duration
      if (name === "slot_duration") {
        if (numValue > 1440) {
          setErrors((prev) => ({
            ...prev,
            slot_duration: "Cannot exceed 1440 minutes (24 hours)",
          }));
          return;
        }
        if (numValue < 15) {
          setErrors((prev) => ({
            ...prev,
            slot_duration: "Minimum slot duration is 15 minutes",
          }));
          return;
        }
      }

      // ✅ Additional validation for max_capacity
      if (name === "max_capacity") {
        if (numValue > 1000) {
          setErrors((prev) => ({
            ...prev,
            max_capacity: "Cannot exceed 1000",
          }));
          return;
        }
      }

      // ✅ Additional validation for discount
      if (name === "deal_discount") {
        if (numValue > 100000) {
          setErrors((prev) => ({
            ...prev,
            deal_discount: "Discount amount seems too high",
          }));
          return;
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle menu item changes with validation
  const handleMenuItemChange = (index, field, value) => {
    const updatedItems = [...menuItems];

    if (field === "item_name") {
      updatedItems[index][field] = value;
      setMenuItems(updatedItems);

      // ✅ Validate item name
      const error = validateMenuItemName(value);
      setErrors((prev) => ({
        ...prev,
        menuItemNames: {
          ...prev.menuItemNames,
          [index]: error,
        },
      }));
      return;
    }

    if (field === "item_description") {
      updatedItems[index][field] = value;
      setMenuItems(updatedItems);

      // ✅ Validate item description
      const error = validateMenuItemDescription(value);
      setErrors((prev) => ({
        ...prev,
        menuItemDescriptions: {
          ...prev.menuItemDescriptions,
          [index]: error,
        },
      }));
      return;
    }

    if (field === "item_price") {
      // Allow empty string
      if (value === "") {
        updatedItems[index][field] = "";
        setMenuItems(updatedItems);
        setErrors((prev) => ({
          ...prev,
          menuItems: {
            ...prev.menuItems,
            [index]: "",
          },
        }));
        return;
      }

      const numValue = Number(value);

      // Clear previous error for this item
      setErrors((prev) => ({
        ...prev,
        menuItems: {
          ...prev.menuItems,
          [index]: "",
        },
      }));

      // ✅ Prevent negative prices for menu items
      if (numValue < 0) {
        setErrors((prev) => ({
          ...prev,
          menuItems: {
            ...prev.menuItems,
            [index]: "Item price cannot be negative",
          },
        }));
        return;
      }

      // ✅ Prevent zero price
      if (numValue === 0) {
        setErrors((prev) => ({
          ...prev,
          menuItems: {
            ...prev.menuItems,
            [index]: "Item price must be greater than 0",
          },
        }));
        return;
      }

      // ✅ Maximum price validation
      if (numValue > 100000) {
        setErrors((prev) => ({
          ...prev,
          menuItems: {
            ...prev.menuItems,
            [index]: "Item price seems too high",
          },
        }));
        return;
      }

      updatedItems[index][field] = numValue;
    }

    setMenuItems(updatedItems);
  };

  // Add new menu item
  const addMenuItem = () => {
    setMenuItems([
      ...menuItems,
      { item_name: "", item_price: "", item_description: "" },
    ]);
  };

  // Remove menu item
  const removeMenuItem = (index) => {
    if (menuItems.length > 1) {
      setMenuItems(menuItems.filter((_, i) => i !== index));

      // Clear errors for this item
      setErrors((prev) => {
        const newMenuErrors = { ...prev.menuItems };
        const newNameErrors = { ...prev.menuItemNames };
        const newDescErrors = { ...prev.menuItemDescriptions };

        delete newMenuErrors[index];
        delete newNameErrors[index];
        delete newDescErrors[index];

        return {
          ...prev,
          menuItems: newMenuErrors,
          menuItemNames: newNameErrors,
          menuItemDescriptions: newDescErrors,
        };
      });
    }
  };

  const handleCreateDeal = async () => {
    if (!restaurantId) {
      alert("Cannot create deal: Restaurant ID is missing.");
      return;
    }

    // ✅ Validate all fields before submission
    let hasErrors = false;
    const newErrors = { ...errors };

    // Validate title
    const titleError = validateDealTitle(formData.deal_title);
    if (titleError) {
      newErrors.deal_title = titleError;
      hasErrors = true;
    }

    // Validate description
    const descError = validateDescription(formData.deal_description);
    if (descError) {
      newErrors.deal_description = descError;
      hasErrors = true;
    }

    // Validate dates
    if (!startDateTime) {
      newErrors.deal_start_date = "Start date & time is required";
      hasErrors = true;
    }
    if (!endDateTime) {
      newErrors.deal_expires_at = "End date & time is required";
      hasErrors = true;
    }

    // ✅ Validate date/time relationship
    if (startDateTime && endDateTime) {
      const dateTimeError = validateDateTime(startDateTime, endDateTime);
      if (dateTimeError) {
        newErrors.deal_expires_at = dateTimeError;
        hasErrors = true;
      }
    }

    // Validate numeric fields
    if (!formData.slot_duration || formData.slot_duration === "") {
      newErrors.slot_duration = "Slot duration is required";
      hasErrors = true;
    }
    if (!formData.max_capacity || formData.max_capacity === "") {
      newErrors.max_capacity = "Max capacity is required";
      hasErrors = true;
    }

    // ✅ Check if there are any existing validation errors
    if (
      errors.deal_title ||
      errors.deal_start_date ||
      errors.deal_expires_at ||
      errors.slot_duration ||
      errors.max_capacity ||
      errors.deal_discount ||
      errors.deal_description ||
      Object.keys(errors.menuItems).some((key) => errors.menuItems[key]) ||
      Object.keys(errors.menuItemNames).some(
        (key) => errors.menuItemNames[key]
      ) ||
      Object.keys(errors.menuItemDescriptions).some(
        (key) => errors.menuItemDescriptions[key]
      )
    ) {
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      alert("Please fix all validation errors before submitting.");
      return;
    }

    // Validate menu items
    const validMenuItems = menuItems.filter(
      (item) =>
        item.item_name &&
        item.item_price !== "" &&
        item.item_price !== null &&
        item.item_description
    );

    if (validMenuItems.length === 0) {
      alert("Please add at least one complete menu item.");
      return;
    }

    // ✅ Validate deal_price is greater than 0
    if (formData.deal_price <= 0) {
      alert("Deal price must be greater than 0. Please add valid menu items.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      restaurant_id: restaurantId,
      deal_title: formData.deal_title.trim(),
      deal_start_date: formData.deal_start_date,
      deal_expires_at: formData.deal_expires_at,
      deal_expires_in: formData.deal_expires_in,
      deal_status: formData.deal_status,
      deal_description: formData.deal_description.trim(),
      deal_price: Number(formData.deal_price),
      deal_discount: Number(formData.deal_discount || 0),
      deal_menu: validMenuItems.map((item) => ({
        item_name: item.item_name.trim(),
        item_price: Number(item.item_price),
        item_description: item.item_description.trim(),
      })),
      slot_duration: Number(formData.slot_duration),
      max_capacity: Number(formData.max_capacity),
    };

    try {
      const response = await createNewDeal(payload);
      console.log("Deal created:", response);
      alert("Deal created successfully!");

      if (onDealCreated) {
        onDealCreated();
      }

      onClose();

      // Reset form
      setFormData({
        deal_title: "",
        deal_start_date: "",
        deal_expires_at: "",
        deal_status: "active",
        deal_price: 0,
        slot_duration: "",
        max_capacity: "",
        deal_description: "",
        deal_discount: "",
        deal_menu: [],
        deal_expires_in: 0,
      });
      setStartDateTime("");
      setEndDateTime("");
      setMenuItems([{ item_name: "", item_price: "", item_description: "" }]);
      setErrors({
        deal_title: "",
        deal_start_date: "",
        deal_expires_at: "",
        slot_duration: "",
        max_capacity: "",
        deal_discount: "",
        deal_description: "",
        menuItems: {},
        menuItemNames: {},
        menuItemDescriptions: {},
      });
    } catch (err) {
      console.error("Failed to create deal:", err);
      alert(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to create deal"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create New Deal
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the required details
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Deal Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal Title *
            </label>
            <input
              type="text"
              name="deal_title"
              value={formData.deal_title}
              onChange={handleInputChange}
              placeholder="Enter deal title (3-100 characters)"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272] ${
                errors.deal_title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.deal_title && (
              <p className="text-xs text-red-500 mt-1">{errors.deal_title}</p>
            )}
          </div>

          {/* Start & End DateTime */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={handleStartDateChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272] ${
                  errors.deal_start_date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.deal_start_date && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.deal_start_date}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Your local time (converts to UTC)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={endDateTime}
                onChange={handleEndDateChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272] ${
                  errors.deal_expires_at ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.deal_expires_at && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.deal_expires_at}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Your local time (converts to UTC)
              </p>
            </div>
          </div>

          {/* Duration Display */}
          {formData.deal_expires_in > 0 && (
            <div className="bg-[#FFF5F5] border border-[#E57272] rounded-md p-3">
              <p className="text-sm text-[#E57272] font-medium">
                Daily Deal Duration: {formData.deal_expires_in} hours per day
              </p>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="deal_status"
              value={formData.deal_status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Slot Duration & Max Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slot Duration (min) *
              </label>
              <input
                type="number"
                name="slot_duration"
                value={formData.slot_duration}
                onChange={handleInputChange}
                placeholder="How long each dining experience lasts (15-1440 min)"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272] no-arrows ${
                  errors.slot_duration ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.slot_duration && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.slot_duration}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Capacity *
              </label>
              <input
                type="number"
                name="max_capacity"
                value={formData.max_capacity}
                onChange={handleInputChange}
                placeholder="1-1000"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272] no-arrows ${
                  errors.max_capacity ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.max_capacity && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.max_capacity}
                </p>
              )}
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Amount *
            </label>
            <input
              type="number"
              name="deal_discount"
              value={formData.deal_discount}
              onChange={handleInputChange}
              placeholder="Enter discount amount (can be 0)"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272] ${
                errors.deal_discount ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.deal_discount && (
              <p className="text-xs text-red-500 mt-1">
                {errors.deal_discount}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="deal_description"
              value={formData.deal_description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter deal description (10-500 characters)"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272] ${
                errors.deal_description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.deal_description && (
              <p className="text-xs text-red-500 mt-1">
                {errors.deal_description}
              </p>
            )}
          </div>

          {/* Deal Menu Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Deal Menu Items *
              </label>
              <button
                type="button"
                onClick={addMenuItem}
                className="text-[#E57272] hover:text-[#d66060] text-sm flex items-center gap-1"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            {menuItems.map((item, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-md p-4 mb-3"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Item {index + 1}
                  </span>
                  {menuItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Item Name */}
                  <div>
                    <input
                      type="text"
                      placeholder="Item Name (2-50 characters)"
                      value={item.item_name}
                      onChange={(e) =>
                        handleMenuItemChange(index, "item_name", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272] ${
                        errors.menuItemNames[index]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.menuItemNames[index] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.menuItemNames[index]}
                      </p>
                    )}
                  </div>

                  {/* Item Price */}
                  <div>
                    <input
                      type="number"
                      placeholder="Item Price (must be > 0)"
                      value={item.item_price}
                      onChange={(e) =>
                        handleMenuItemChange(
                          index,
                          "item_price",
                          e.target.value
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272] ${
                        errors.menuItems[index]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.menuItems[index] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.menuItems[index]}
                      </p>
                    )}
                  </div>

                  {/* Item Description */}
                  <div>
                    <textarea
                      placeholder="Item Description (5-200 characters)"
                      value={item.item_description}
                      onChange={(e) =>
                        handleMenuItemChange(
                          index,
                          "item_description",
                          e.target.value
                        )
                      }
                      rows={2}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272] ${
                        errors.menuItemDescriptions[index]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.menuItemDescriptions[index] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.menuItemDescriptions[index]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Display auto-calculated total price */}
            {formData.deal_price > 0 && (
              <div className="bg-green-50 border border-green-300 rounded-md p-3 mt-2">
                <p className="text-sm font-medium text-green-700">
                  Total Deal Price: ${formData.deal_price.toFixed(2)}
                </p>
                {/* <p className="text-xs text-green-600 mt-1">
                  (Auto-calculated from menu items)
                </p> */}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleCreateDeal}
            disabled={!restaurantId || isSubmitting}
            className={`w-full py-3 rounded-lg font-medium text-white ${
              !restaurantId || isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#E57272] hover:opacity-90"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Deal"}
          </button>
        </div>
      </div>

      {/* CSS to hide number input arrows */}
      <style jsx>{`
        .no-arrows::-webkit-inner-spin-button,
        .no-arrows::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-arrows[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default CreateDealModal;
