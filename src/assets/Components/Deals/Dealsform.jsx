// src/assets/Components/Deals/CreateDealModal.jsx
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { createNewDeal } from "../../../api/services/Dealsservice";
import { useRestaurant } from "../../../context/RestaurantContext";

const CreateDealModal = ({ isOpen, onClose, onDealCreated }) => {
  const { restaurantId } = useRestaurant();

  // Form state including all required & optional fields (redemption removed)
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
    deal_expires_in: 0,
  });

  // Local datetime inputs (will be converted to UTC)
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  const [menuItems, setMenuItems] = useState([
    { item_name: "", item_price: 0, item_description: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Convert local datetime to UTC ISO string
  const convertToUTC = (localDateTime) => {
    if (!localDateTime) return "";
    const date = new Date(localDateTime);
    return date.toISOString();
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setStartDateTime(value);
    setFormData((prev) => ({
      ...prev,
      deal_start_date: convertToUTC(value),
    }));
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    setEndDateTime(value);
    setFormData((prev) => ({
      ...prev,
      deal_expires_at: convertToUTC(value),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle menu item changes
  const handleMenuItemChange = (index, field, value) => {
    const updatedItems = [...menuItems];
    updatedItems[index][field] = field === "item_price" ? Number(value) : value;
    setMenuItems(updatedItems);
  };

  // Add new menu item
  const addMenuItem = () => {
    setMenuItems([
      ...menuItems,
      { item_name: "", item_price: 0, item_description: "" },
    ]);
  };

  // Remove menu item
  const removeMenuItem = (index) => {
    if (menuItems.length > 1) {
      setMenuItems(menuItems.filter((_, i) => i !== index));
    }
  };

  const handleCreateDeal = async () => {
    if (!restaurantId) {
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

    const startDate = new Date(formData.deal_start_date);
    const endDate = new Date(formData.deal_expires_at);

    if (endDate <= startDate) {
      alert("End date & time must be after the start date & time.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      restaurant_id: restaurantId,
      deal_title: formData.deal_title,
      deal_start_date: formData.deal_start_date, // UTC ISO string
      deal_expires_at: formData.deal_expires_at, // UTC ISO string
      deal_expires_in: formData.deal_expires_in, // Daily duration in hours
      deal_status: formData.deal_status,
      deal_description: formData.deal_description,
      deal_price: Number(formData.deal_price),
      deal_discount: Number(formData.deal_discount),
      deal_menu: validMenuItems,
      slot_duration: Number(formData.slot_duration),
      max_capacity: Number(formData.max_capacity),
    };

    try {
      const response = await createNewDeal(payload);
      console.log("Deal created:", response);
      alert("Deal created successfully!");

      // ✅ Trigger refresh in parent component
      if (onDealCreated) {
        onDealCreated();
      }

      onClose();

      // ✅ Reset form after successful creation
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
        deal_expires_in: 0,
      });
      setStartDateTime("");
      setEndDateTime("");
      setMenuItems([{ item_name: "", item_price: 0, item_description: "" }]);
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
              placeholder="Enter deal title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272]"
            />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272]"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272]"
              />
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

          {/* Price, Slot Duration & Max Capacity */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                name="deal_price"
                value={formData.deal_price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slot Duration (min) *
              </label>
              <input
                type="number"
                name="slot_duration"
                value={formData.slot_duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272]"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272]"
              />
            </div>
          </div>

          {/* Discount % */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Amount *
            </label>
            <input
              type="number"
              name="deal_discount"
              value={formData.deal_discount}
              onChange={handleInputChange}
              placeholder="Discount percentage"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272]"
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
              placeholder="Enter deal description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272]"
            />
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
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={item.item_name}
                    onChange={(e) =>
                      handleMenuItemChange(index, "item_name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272]"
                  />

                  <input
                    type="number"
                    placeholder="Item Price"
                    value={item.item_price}
                    onChange={(e) =>
                      handleMenuItemChange(index, "item_price", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E57272] focus:border-[#E57272]"
                  />
                </div>
              </div>
            ))}
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
    </div>
  );
};

export default CreateDealModal;
