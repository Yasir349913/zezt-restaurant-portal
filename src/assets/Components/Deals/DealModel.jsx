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
  const maxBooked = initialData?.maxBooked || 0; // Highest booked in any slot

  // ✅ Store original data for comparison
  const [originalData, setOriginalData] = useState(null);

  const [formData, setFormData] = useState({
    deal_title: "",
    deal_start_date: "",
    deal_expires_at: "",
    deal_status: "active",
    deal_price: 0,
    slot_duration: 30,
    max_capacity: 1,
    deal_description: "",
    deal_discount: 0,
    deal_menu: [],
    redemption: 0,
    deal_expires_in: 0,
  });

  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [menuItems, setMenuItems] = useState([
    { item_name: "", item_price: 0, item_description: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showInfo, setShowInfo] = useState(false);

  // Protected fields (cannot change if bookings exist)
  const protectedFields = {
    deal_start_date: "Start Date & Time",
    deal_expires_at: "End Date & Time",
    deal_expires_in: "Daily Duration",
    slot_duration: "Slot Duration",
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
        deal_price: initialData.deal_price || 0,
        slot_duration: initialData.slot_duration || 30,
        max_capacity: initialData.max_capacity || 1,
        deal_description: initialData.deal_description || "",
        deal_discount: initialData.deal_discount || 0,
        redemption: initialData.redemption || 0,
        deal_expires_in: initialData.deal_expires_in || 0,
      };

      setFormData(loadedData);
      // ✅ Store original data for comparison
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
      deal_price: 0,
      slot_duration: 30,
      max_capacity: 1,
      deal_description: "",
      deal_discount: 0,
      deal_menu: [],
      redemption: 0,
      deal_expires_in: 0,
    });
    setStartDateTime("");
    setEndDateTime("");
    setMenuItems([{ item_name: "", item_price: 0, item_description: "" }]);
    setErrors({});
    setShowInfo(false);
    setOriginalData(null);
  };

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
    if (hasBookings) return; // Prevent change if bookings exist
    const value = e.target.value;
    setStartDateTime(value);
    setFormData((prev) => ({
      ...prev,
      deal_start_date: convertToUTC(value),
    }));
  };

  const handleEndDateChange = (e) => {
    if (hasBookings) return; // Prevent change if bookings exist
    const value = e.target.value;
    setEndDateTime(value);
    setFormData((prev) => ({
      ...prev,
      deal_expires_at: convertToUTC(value),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate capacity reduction if bookings exist
    if (name === "max_capacity" && hasBookings) {
      const newCapacity = parseInt(value);
      if (newCapacity < maxBooked) {
        setErrors((prev) => ({
          ...prev,
          max_capacity: `Cannot reduce below ${maxBooked} (highest booked in any slot)`,
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.max_capacity;
          return newErrors;
        });
      }
    }

    // Prevent slot_duration change if bookings exist
    if (name === "slot_duration" && hasBookings) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMenuItemChange = (index, field, value) => {
    const updatedItems = [...menuItems];
    updatedItems[index][field] = field === "item_price" ? Number(value) : value;
    setMenuItems(updatedItems);
  };

  const addMenuItem = () => {
    setMenuItems([
      ...menuItems,
      { item_name: "", item_price: 0, item_description: "" },
    ]);
  };

  const removeMenuItem = (index) => {
    if (menuItems.length > 1) {
      setMenuItems(menuItems.filter((_, i) => i !== index));
    }
  };

  // ✅ NEW: Get only changed fields for update
  const getChangedFields = () => {
    if (!isEditMode || !originalData) {
      // Create mode: return all fields
      const validMenuItems = menuItems.filter(
        (item) => item.item_name && item.item_price && item.item_description
      );

      return {
        restaurant_id: restaurantId,
        deal_title: formData.deal_title,
        deal_start_date: formData.deal_start_date,
        deal_expires_at: formData.deal_expires_at,
        deal_expires_in: formData.deal_expires_in,
        deal_status: formData.deal_status,
        redemption: Number(formData.redemption),
        deal_description: formData.deal_description,
        deal_price: Number(formData.deal_price),
        deal_discount: Number(formData.deal_discount),
        deal_menu: validMenuItems,
        slot_duration: Number(formData.slot_duration),
        max_capacity: Number(formData.max_capacity),
      };
    }

    // Edit mode: return only changed fields
    const changes = {};
    const validMenuItems = menuItems.filter(
      (item) => item.item_name && item.item_price && item.item_description
    );

    // Compare each field
    if (formData.deal_title !== originalData.deal_title) {
      changes.deal_title = formData.deal_title;
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
    if (Number(formData.redemption) !== Number(originalData.redemption)) {
      changes.redemption = Number(formData.redemption);
    }
    if (formData.deal_description !== originalData.deal_description) {
      changes.deal_description = formData.deal_description;
    }
    if (Number(formData.deal_price) !== Number(originalData.deal_price)) {
      changes.deal_price = Number(formData.deal_price);
    }
    if (Number(formData.deal_discount) !== Number(originalData.deal_discount)) {
      changes.deal_discount = Number(formData.deal_discount);
    }
    if (Number(formData.slot_duration) !== Number(originalData.slot_duration)) {
      changes.slot_duration = Number(formData.slot_duration);
    }
    if (Number(formData.max_capacity) !== Number(originalData.max_capacity)) {
      changes.max_capacity = Number(formData.max_capacity);
    }

    // Compare menu items
    if (
      JSON.stringify(validMenuItems) !==
      JSON.stringify(initialData?.deal_menu || [])
    ) {
      changes.deal_menu = validMenuItems;
    }

    console.log("📝 Changed fields:", changes);
    console.log("📊 Original data:", originalData);
    console.log("📊 Current data:", formData);

    return changes;
  };

  const handleSubmit = async () => {
    // Check if there are validation errors
    if (Object.keys(errors).length > 0) {
      alert("Please fix validation errors before submitting");
      return;
    }

    if (!restaurantId && !isEditMode) {
      alert("Cannot create deal: Restaurant ID is missing.");
      return;
    }

    // Validate required fields
    if (
      !formData.deal_title ||
      !formData.deal_start_date ||
      !formData.deal_expires_at ||
      !formData.deal_status ||
      !formData.deal_price ||
      !formData.slot_duration ||
      !formData.max_capacity
    ) {
      alert(
        "Please fill in all required fields: Title, Start Date & Time, End Date & Time, Status, Price, Slot Duration, Max Capacity."
      );
      return;
    }

    // Validate menu items
    const validMenuItems = menuItems.filter(
      (item) => item.item_name && item.item_price && item.item_description
    );

    if (validMenuItems.length === 0) {
      alert("Please add at least one complete menu item.");
      return;
    }

    const startDate = new Date(formData.deal_start_date);
    const endDate = new Date(formData.deal_expires_at);

    if (endDate <= startDate) {
      alert("End date & time must be after the start date & time.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // ✅ UPDATE MODE: Send only changed fields
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
        // ✅ CREATE MODE: Send all fields
        const payload = getChangedFields();
        console.log("🆕 Creating new deal:", payload);
        const response = await createNewDeal(payload);
        console.log("✅ Deal created successfully:", response);
        alert("Deal created successfully!");
      }

      // Trigger refresh in parent component
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
                placeholder="e.g. Weekend Special"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                placeholder="Describe your deal..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  name="deal_price"
                  value={formData.deal_price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount %
                </label>
                <input
                  type="number"
                  name="deal_discount"
                  value={formData.deal_discount}
                  onChange={handleInputChange}
                  placeholder="0-100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Redemption Limit *
                </label>
                <input
                  type="number"
                  name="redemption"
                  value={formData.redemption}
                  onChange={handleInputChange}
                  placeholder="Max redemptions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Capacity
                {hasBookings && maxBooked > 0 && (
                  <span className="ml-2 text-xs text-amber-600">
                    (Min: {maxBooked} - highest booked)
                  </span>
                )}
              </label>
              <input
                type="number"
                name="max_capacity"
                value={formData.max_capacity}
                onChange={handleInputChange}
                min={hasBookings ? maxBooked : 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.max_capacity && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.max_capacity}
                </p>
              )}
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
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }`}
                />
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
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }`}
                />
                {hasBookings && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Locked to protect existing bookings
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

            {/* Slot Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slot Duration (minutes) *
                {hasBookings && (
                  <span className="ml-2 text-xs text-red-600">🔒 Locked</span>
                )}
              </label>
              <input
                type="number"
                name="slot_duration"
                value={formData.slot_duration}
                onChange={handleInputChange}
                disabled={hasBookings}
                className={`w-full px-3 py-2 border rounded-md ${
                  hasBookings
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                }`}
              />
              {hasBookings && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Locked to protect booking time slots
                </p>
              )}
            </div>

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
                Deal Menu Items *
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
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={item.item_name}
                      onChange={(e) =>
                        handleMenuItemChange(index, "item_name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="number"
                      placeholder="Item Price"
                      value={item.item_price}
                      onChange={(e) =>
                        handleMenuItemChange(
                          index,
                          "item_price",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <textarea
                      placeholder="Item Description"
                      value={item.item_description}
                      onChange={(e) =>
                        handleMenuItemChange(
                          index,
                          "item_description",
                          e.target.value
                        )
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
              disabled={isSubmitting || Object.keys(errors).length > 0}
              className={`flex-1 py-3 rounded-lg font-medium text-white transition-colors ${
                isSubmitting || Object.keys(errors).length > 0
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
