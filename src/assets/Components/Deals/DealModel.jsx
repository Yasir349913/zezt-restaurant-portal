// src/assets/Components/Deals/DealModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Lock,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { createNewDeal, updateDeal } from "../../../api/services/Dealsservice";
import { useRestaurant } from "../../../context/RestaurantContext";

const DealModal = ({ isOpen, onClose, initialData = null, onSaved }) => {
  const { restaurantId } = useRestaurant();
  const isEditMode = !!initialData;

  // Check if deal has bookings (affects what can be edited)
  const hasBookings = isEditMode && initialData?.bookingCount > 0;

  // ✅ Store original data for comparison
  const [originalData, setOriginalData] = useState(null);

  const [formData, setFormData] = useState({
    deal_title: "",
    deal_start_date: "",
    deal_expires_at: "",
    deal_status: "active",
    deal_price: "",
    deal_description: "",
    deal_discount: "",
    deal_menu: [],
    deal_expires_in: 0,
  });

  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [menuItems, setMenuItems] = useState([
    { item_name: "", item_price: "", item_description: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Comprehensive error states
  const [errors, setErrors] = useState({
    deal_title: "",
    deal_description: "",
    deal_price: "",
    deal_discount: "",
    deal_start_date: "",
    deal_expires_at: "",
    menuItems: {}, // For item prices
    menuItemNames: {}, // For item names
    menuItemDescriptions: {}, // For item descriptions
  });

  // Protected fields (cannot change if bookings exist)
  const protectedFields = {
    deal_start_date: "Start Date & Time",
    deal_expires_at: "End Date & Time",
    deal_expires_in: "Daily Duration",
  };

  // ✅ Validation functions
  const validateDealTitle = (value) => {
    if (!value || value.trim() === "") {
      return "Deal title is required";
    }
    if (value.trim().length < 5) {
      return "Deal title must be at least 5 characters";
    }
    if (value.length > 100) {
      return "Deal title must not exceed 100 characters";
    }
    // Allow letters, numbers, spaces, and common punctuation
    if (!/^[a-zA-Z0-9\s,.'&!%\-()]+$/.test(value)) {
      return "Deal title contains invalid characters";
    }
    return "";
  };

  const validateDescription = (value) => {
    if (!value || value.trim() === "") {
      return "Description is required";
    }
    if (value.trim().length < 5) {
      return "Description must be at least 5 characters";
    }
    if (value.length > 500) {
      return "Description must not exceed 500 characters";
    }
    // Allow letters, numbers, spaces, and common punctuation
    if (!/^[a-zA-Z0-9\s,.'&!%\-()]+$/.test(value)) {
      return "Description contains invalid characters";
    }
    return "";
  };

  const validatePrice = (value) => {
    if (value === "" || value === null || value === undefined) {
      return "Price is required";
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return "Price must be a valid number";
    }
    
    if (numValue < 0) {
      return "Price cannot be negative";
    }
    
    if (numValue === 0) {
      return "Price must be greater than 0";
    }

    // Check for valid decimal format (max 2 decimal places)
    if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
      return "Price can have maximum 2 decimal places";
    }

    if (numValue > 999999) {
      return "Price seems too high";
    }
    
    return "";
  };

  const validateDiscount = (value) => {
    // Discount is optional, can be 0
    if (value === "" || value === null || value === undefined) {
      return ""; // No error - discount is optional
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return "Discount must be a valid number";
    }
    
    if (numValue < 0) {
      return "Discount cannot be negative";
    }

    // Check for valid decimal format (max 2 decimal places)
    if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
      return "Discount can have maximum 2 decimal places";
    }

    if (numValue > 100000) {
      return "Discount seems too high";
    }
    
    return "";
  };

  const validateMenuItemName = (value) => {
    if (!value || value.trim() === "") {
      return "Item name is required";
    }
    if (value.trim().length < 5) {
      return "Item name must be at least 5 characters";
    }
    if (value.length > 100) {
      return "Item name must not exceed 100 characters";
    }
    // Allow letters, numbers, spaces, and common punctuation
    if (!/^[a-zA-Z0-9\s,.'&!%\-()]+$/.test(value)) {
      return "Item name contains invalid characters";
    }
    return "";
  };

  const validateMenuItemDescription = (value) => {
    if (!value || value.trim() === "") {
      return "Item description is required";
    }
    if (value.trim().length < 5) {
      return "Item description must be at least 5 characters";
    }
    if (value.length > 300) {
      return "Item description must not exceed 300 characters";
    }
    // Allow letters, numbers, spaces, and common punctuation
    if (!/^[a-zA-Z0-9\s,.'&!%\-()]+$/.test(value)) {
      return "Item description contains invalid characters";
    }
    return "";
  };

  const validateMenuItemPrice = (value) => {
    if (value === "" || value === null || value === undefined) {
      return "Item price is required";
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return "Item price must be a valid number";
    }
    
    if (numValue < 0) {
      return "Item price cannot be negative";
    }
    
    if (numValue === 0) {
      return "Item price must be greater than 0";
    }

    // Check for valid decimal format (max 2 decimal places)
    if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
      return "Item price can have maximum 2 decimal places";
    }

    if (numValue > 999999) {
      return "Item price seems too high";
    }
    
    return "";
  };

  // ✅ Validate date/time - same date allowed, but end time must be after start time
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

    return null; // No error
  };

  useEffect(() => {
    if (initialData && isOpen) {
      const convertToLocalDateTime = (utcDate) => {
        if (!utcDate) return "";
        const date = new Date(utcDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      const localStart = convertToLocalDateTime(initialData.deal_start_date);
      const localEnd = convertToLocalDateTime(initialData.deal_expires_at);

      setStartDateTime(localStart);
      setEndDateTime(localEnd);

      const loadedData = {
        deal_title: initialData.deal_title || "",
        deal_start_date: initialData.deal_start_date || "",
        deal_expires_at: initialData.deal_expires_at || "",
        deal_status: initialData.deal_status || "active",
        deal_price: initialData.deal_price || "",
        deal_description: initialData.deal_description || "",
        deal_discount: initialData.deal_discount || "",
        deal_expires_in: initialData.deal_expires_in || 0,
      };

      setFormData(loadedData);
      setOriginalData(loadedData);

      if (initialData.deal_menu && initialData.deal_menu.length > 0) {
        setMenuItems(initialData.deal_menu);
      }
    } else if (!isOpen) {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({
      deal_title: "",
      deal_start_date: "",
      deal_expires_at: "",
      deal_status: "active",
      deal_price: "",
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
      deal_description: "",
      deal_price: "",
      deal_discount: "",
      deal_start_date: "",
      deal_expires_at: "",
      menuItems: {},
      menuItemNames: {},
      menuItemDescriptions: {},
    });
    setOriginalData(null);
  };

  // Calculate daily duration whenever dates change
  useEffect(() => {
    if (startDateTime && endDateTime) {
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);

      const startHours = start.getHours();
      const startMinutes = start.getMinutes();
      const endHours = end.getHours();
      const endMinutes = end.getMinutes();

      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;

      let dailyDurationMinutes = endTimeInMinutes - startTimeInMinutes;

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

  const convertToUTC = (localDateTime) => {
    if (!localDateTime) return "";
    const date = new Date(localDateTime);
    return date.toISOString();
  };

  const handleStartDateChange = (e) => {
    if (hasBookings) return;
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

        // Check against end date if it exists
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
    if (hasBookings) return;
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

    // ✅ Handle price validation
    if (name === "deal_price") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      const error = validatePrice(value);
      setErrors((prev) => ({ ...prev, deal_price: error }));
      return;
    }

    // ✅ Handle discount validation
    if (name === "deal_discount") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      const error = validateDiscount(value);
      setErrors((prev) => ({ ...prev, deal_discount: error }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMenuItemChange = (index, field, value) => {
    const updatedItems = [...menuItems];

    if (field === "item_name") {
      updatedItems[index][field] = value;
      setMenuItems(updatedItems);

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
      updatedItems[index][field] = value;
      setMenuItems(updatedItems);

      const error = validateMenuItemPrice(value);
      setErrors((prev) => ({
        ...prev,
        menuItems: {
          ...prev.menuItems,
          [index]: error,
        },
      }));
      return;
    }

    updatedItems[index][field] = value;
    setMenuItems(updatedItems);
  };

  const addMenuItem = () => {
    setMenuItems([
      ...menuItems,
      { item_name: "", item_price: "", item_description: "" },
    ]);
  };

  const removeMenuItem = (index) => {
    if (menuItems.length > 1) {
      setMenuItems(menuItems.filter((_, i) => i !== index));

      // Clear errors for removed item
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

  const getChangedFields = () => {
    const validMenuItems = menuItems.filter(
      (item) =>
        item.item_name &&
        item.item_price !== "" &&
        item.item_price !== null &&
        item.item_description
    );

    if (!isEditMode || !originalData) {
      // Create mode: return all fields
      return {
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
      };
    }

    // Edit mode: return only changed fields
    const changes = {};

    if (formData.deal_title !== originalData.deal_title) {
      changes.deal_title = formData.deal_title.trim();
    }
    if (formData.deal_start_date !== originalData.deal_start_date) {
      changes.deal_start_date = formData.deal_start_date;
    }
    if (formData.deal_expires_at !== originalData.deal_expires_at) {
      changes.deal_expires_at = formData.deal_expires_at;
    }
    if (formData.deal_expires_in !== originalData.deal_expires_in) {
      changes.deal_expires_in = formData.deal_expires_in;
    }
    if (formData.deal_status !== originalData.deal_status) {
      changes.deal_status = formData.deal_status;
    }
    if (formData.deal_description !== originalData.deal_description) {
      changes.deal_description = formData.deal_description.trim();
    }
    if (Number(formData.deal_price) !== Number(originalData.deal_price)) {
      changes.deal_price = Number(formData.deal_price);
    }
    if (Number(formData.deal_discount || 0) !== Number(originalData.deal_discount || 0)) {
      changes.deal_discount = Number(formData.deal_discount || 0);
    }

    // Compare menu items
    const formattedMenuItems = validMenuItems.map((item) => ({
      item_name: item.item_name.trim(),
      item_price: Number(item.item_price),
      item_description: item.item_description.trim(),
    }));

    if (
      JSON.stringify(formattedMenuItems) !==
      JSON.stringify(initialData?.deal_menu || [])
    ) {
      changes.deal_menu = formattedMenuItems;
    }

    console.log("📝 Changed fields:", changes);
    return changes;
  };

  const handleSubmit = async () => {
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

    // Validate price
    const priceError = validatePrice(formData.deal_price);
    if (priceError) {
      newErrors.deal_price = priceError;
      hasErrors = true;
    }

    // Validate discount (optional)
    if (formData.deal_discount) {
      const discountError = validateDiscount(formData.deal_discount);
      if (discountError) {
        newErrors.deal_discount = discountError;
        hasErrors = true;
      }
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

    // Validate date/time relationship
    if (startDateTime && endDateTime) {
      const dateTimeError = validateDateTime(startDateTime, endDateTime);
      if (dateTimeError) {
        newErrors.deal_expires_at = dateTimeError;
        hasErrors = true;
      }
    }

    // Check existing validation errors
    if (
      errors.deal_title ||
      errors.deal_description ||
      errors.deal_price ||
      errors.deal_discount ||
      errors.deal_start_date ||
      errors.deal_expires_at ||
      Object.values(errors.menuItems).some((err) => err) ||
      Object.values(errors.menuItemNames).some((err) => err) ||
      Object.values(errors.menuItemDescriptions).some((err) => err)
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

    if (!restaurantId && !isEditMode) {
      alert("Cannot create deal: Restaurant ID is missing.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        const changes = getChangedFields();

        if (Object.keys(changes).length === 0) {
          alert("No changes detected!");
          setIsSubmitting(false);
          return;
        }

        console.log("🔄 Updating deal with changes:", changes);
        const response = await updateDeal(initialData._id, changes);
        console.log("✅ Deal updated successfully:", response);
        alert("Deal updated successfully!");
      } else {
        const payload = getChangedFields();
        console.log("🆕 Creating new deal:", payload);
        const response = await createNewDeal(payload);
        console.log("✅ Deal created successfully:", response);
        alert("Deal created successfully!");
      }

      if (onSaved) {
        onSaved();
      }

      onClose();
      resetForm();
    } catch (err) {
      console.error("❌ Error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (isEditMode ? "Failed to update deal" : "Failed to create deal");
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-4xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? "Edit Deal" : "Create New Deal"}
              </h2>
              {hasBookings && (
                <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    This deal has {initialData.bookingCount} active booking(s)
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Bookings Warning Banner */}
          {hasBookings && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900 mb-1">
                    Booking Protection Active
                  </h3>
                  <p className="text-sm text-amber-800">
                    Some fields are locked because this deal has active
                    bookings. You can still update: title, description, price,
                    discount, menu items, and status.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b">
              Basic Information
            </h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deal Title *
              </label>
              <input
                type="text"
                name="deal_title"
                value={formData.deal_title}
                onChange={handleInputChange}
                placeholder="e.g. Weekend Special Dinner (min 5 characters)"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.deal_title ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.deal_title && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.deal_title}
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
                placeholder="Describe your deal (min 5 characters, max 500 characters)"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.deal_description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.deal_description && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.deal_description}
                </p>
              )}
            </div>

            {/* Price & Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal Price * (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="deal_price"
                  value={formData.deal_price}
                  onChange={handleInputChange}
                  placeholder="e.g. 25.99"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.deal_price ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.deal_price && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.deal_price}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (£) - Optional
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="deal_discount"
                  value={formData.deal_discount}
                  onChange={handleInputChange}
                  placeholder="e.g. 5.00 (optional)"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.deal_discount ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.deal_discount && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.deal_discount}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date/Time Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-800 pb-2">
              Schedule & Timing
            </h3>

            {/* Start & End DateTime */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date & Time *
                  {hasBookings && (
                    <span className="ml-2 text-xs text-red-600">🔒 Locked</span>
                  )}
                </label>
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={handleStartDateChange}
                  disabled={hasBookings}
                  className={`w-full px-3 py-2 border rounded-md ${
                    hasBookings
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                      : errors.deal_start_date
                      ? "border-red-500 focus:ring-2 focus:ring-blue-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }`}
                />
                {errors.deal_start_date && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.deal_start_date}
                  </p>
                )}
                {hasBookings && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Locked to protect existing bookings
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date & Time *
                  {hasBookings && (
                    <span className="ml-2 text-xs text-red-600">🔒 Locked</span>
                  )}
                </label>
                <input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={handleEndDateChange}
                  disabled={hasBookings}
                  className={`w-full px-3 py-2 border rounded-md ${
                    hasBookings
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                      : errors.deal_expires_at
                      ? "border-red-500 focus:ring-2 focus:ring-blue-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }`}
                />
                {errors.deal_expires_at && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.deal_expires_at}
                  </p>
                )}
                {hasBookings && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Locked to protect existing bookings
                  </p>
                )}
                {!hasBookings && (
                  <p className="text-xs text-gray-500 mt-1">
                    Time must be after start time (same date allowed)
                  </p>
                )}
              </div>
            </div>

            {/* Duration Display */}
            {formData.deal_expires_in > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Daily Deal Duration: {formData.deal_expires_in} hours per day
                  {hasBookings && " (Locked)"}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.deal_status === "active"
                  ? "Customers can book this deal"
                  : "Deal is paused - no new bookings accepted"}
              </p>
            </div>
          </div>

          {/* Deal Menu Items */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Deal Menu Items * (Minimum 1 item required)
              </h3>
              <button
                type="button"
                onClick={addMenuItem}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 font-medium"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-md p-4"
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
                        placeholder="Item Name (min 5 characters)"
                        value={item.item_name}
                        onChange={(e) =>
                          handleMenuItemChange(index, "item_name", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.menuItemNames?.[index]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.menuItemNames?.[index] && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.menuItemNames[index]}
                        </p>
                      )}
                    </div>

                    {/* Item Price */}
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Item Price (£) e.g. 12.99"
                        value={item.item_price}
                        onChange={(e) =>
                          handleMenuItemChange(
                            index,
                            "item_price",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.menuItems?.[index]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.menuItems?.[index] && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.menuItems[index]}
                        </p>
                      )}
                    </div>

                    {/* Item Description */}
                    <div>
                      <textarea
                        placeholder="Item Description (min 5 characters)"
                        value={item.item_description}
                        onChange={(e) =>
                          handleMenuItemChange(
                            index,
                            "item_description",
                            e.target.value
                          )
                        }
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.menuItemDescriptions?.[index]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.menuItemDescriptions?.[index] && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.menuItemDescriptions[index]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info for Bookings */}
          {hasBookings && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Need to change dates or times?
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Since this deal has active bookings, you cannot modify date/time
                fields. Here are your options:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 ml-2">
                <li>Create a new deal with the desired settings</li>
                <li>
                  Mark this deal as inactive and let bookings complete naturally
                </li>
                <li>Contact customers and issue refunds (not recommended)</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-3 rounded-lg font-medium text-white transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Deal"
                : "Create Deal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealModal;