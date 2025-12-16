// src/assets/Components/HotKeys/TemplateManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Zap,
  Copy,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { useRestaurant } from "../../../context/RestaurantContext";
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleHotKey,
  duplicateTemplate,
} from "../../../api/services/Hotdealservice";
import Loader from "../Common/Loader";

// Icon options
const iconOptions = [
  { value: "breakfast", label: "Breakfast", emoji: "🍳" },
  { value: "lunch", label: "Lunch", emoji: "🍽️" },
  { value: "dinner", label: "Dinner", emoji: "🍷" },
  { value: "happy-hour", label: "Happy Hour", emoji: "🍹" },
  { value: "brunch", label: "Brunch", emoji: "☕" },
  { value: "weekend", label: "Weekend", emoji: "🎉" },
  { value: "date-night", label: "Date Night", emoji: "❤️" },
  { value: "family", label: "Family", emoji: "👨‍👩‍👧‍👦" },
  { value: "business", label: "Business", emoji: "💼" },
  { value: "special", label: "Special", emoji: "⭐" },
];

// Color options
const colorOptions = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#EF4444", label: "Red" },
  { value: "#F59E0B", label: "Yellow" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
];

const TemplateManagement = () => {
  const { restaurantId } = useRestaurant();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    template_name: "",
    template_description: "",
    template_icon: "special",
    template_color: "#3B82F6",
    hot_key_enabled: false,
    deal_title: "",
    deal_description: "",
    deal_price: "",
    deal_discount: "",
    deal_expires_in: "2",
    slot_duration: "30",
    max_capacity: "",
    default_start_time: "12:00",
    default_duration_days: "7",
    deal_menu: [{ item_name: "", item_price: "", item_description: "" }],
  });

  useEffect(() => {
    fetchTemplates();
  }, [restaurantId]);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);

    // Check localStorage fallback
    const fallbackId =
      typeof window !== "undefined"
        ? localStorage.getItem("restaurantId")
        : null;
    const idToUse = restaurantId || fallbackId;

    try {
      if (!idToUse) {
        // No restaurant - set empty array
        setTemplates([]);
        return;
      }

      const data = await getAllTemplates(idToUse);
      setTemplates(data.templates || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch templates");
      // On error, show empty array (graceful fallback)
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({
      template_name: "",
      template_description: "",
      template_icon: "special",
      template_color: "#3B82F6",
      hot_key_enabled: false,
      deal_title: "",
      deal_description: "",
      deal_price: "",
      deal_discount: "",
      deal_expires_in: "2",
      slot_duration: "30",
      max_capacity: "",
      default_start_time: "12:00",
      default_duration_days: "7",
      deal_menu: [{ item_name: "", item_price: "", item_description: "" }],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name || "",
      template_description: template.template_description || "",
      template_icon: template.template_icon || "special",
      template_color: template.template_color || "#3B82F6",
      hot_key_enabled: template.hot_key_enabled || false,
      deal_title: template.deal_title || "",
      deal_description: template.deal_description || "",
      deal_price: template.deal_price?.toString() || "",
      deal_discount: template.deal_discount?.toString() || "",
      deal_expires_in: template.deal_expires_in?.toString() || "2",
      slot_duration: template.slot_duration?.toString() || "30",
      max_capacity: template.max_capacity?.toString() || "",
      default_start_time: template.default_start_time || "12:00",
      default_duration_days: template.default_duration_days?.toString() || "7",
      deal_menu: template.deal_menu || [
        { item_name: "", item_price: "", item_description: "" },
      ],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if restaurant exists
    const fallbackId =
      typeof window !== "undefined"
        ? localStorage.getItem("restaurantId")
        : null;
    const idToUse = restaurantId || fallbackId;

    if (!idToUse) {
      alert("Please create a restaurant first");
      return;
    }

    // Validation
    if (!formData.template_name.trim()) {
      alert("Template name is required");
      return;
    }
    if (!formData.deal_title.trim()) {
      alert("Deal title is required");
      return;
    }
    if (!formData.deal_price || parseFloat(formData.deal_price) <= 0) {
      alert("Valid deal price is required");
      return;
    }
    if (!formData.max_capacity || parseInt(formData.max_capacity) <= 0) {
      alert("Valid capacity is required");
      return;
    }

    try {
      setSaving(true);

      const templateData = {
        restaurant_id: idToUse,
        template_name: formData.template_name.trim(),
        template_description: formData.template_description.trim(),
        template_icon: formData.template_icon,
        template_color: formData.template_color,
        hot_key_enabled: formData.hot_key_enabled,
        deal_title: formData.deal_title.trim(),
        deal_description: formData.deal_description.trim(),
        deal_price: parseFloat(formData.deal_price),
        deal_discount: parseFloat(formData.deal_discount) || 0,
        deal_expires_in: parseInt(formData.deal_expires_in),
        slot_duration: parseInt(formData.slot_duration),
        max_capacity: parseInt(formData.max_capacity),
        default_start_time: formData.default_start_time,
        default_duration_days: parseInt(formData.default_duration_days),
        deal_menu: formData.deal_menu.filter((item) => item.item_name.trim()),
      };

      if (editingTemplate) {
        await updateTemplate(editingTemplate._id, templateData);
        alert("Template updated successfully!");
      } else {
        await createTemplate(templateData);
        alert("Template created successfully!");
      }

      setShowModal(false);
      fetchTemplates();
    } catch (err) {
      console.error("Save error:", err);
      alert(
        `Failed to save template: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleHotKey = async (templateId) => {
    try {
      await toggleHotKey(templateId);
      fetchTemplates();
    } catch (err) {
      console.error("Toggle error:", err);
      alert(`Failed to toggle hot key: ${err.message}`);
    }
  };

  const handleDelete = async (templateId) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      await deleteTemplate(templateId);
      alert("Template deleted successfully");
      fetchTemplates();
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleDuplicate = async (template) => {
    try {
      await duplicateTemplate(template);
      alert("Template duplicated successfully");
      fetchTemplates();
    } catch (err) {
      console.error("Duplicate error:", err);
      alert(`Failed to duplicate: ${err.message}`);
    }
  };

  const addMenuItem = () => {
    setFormData({
      ...formData,
      deal_menu: [
        ...formData.deal_menu,
        { item_name: "", item_price: "", item_description: "" },
      ],
    });
  };

  const removeMenuItem = (index) => {
    const newMenu = formData.deal_menu.filter((_, i) => i !== index);
    setFormData({ ...formData, deal_menu: newMenu });
  };

  const updateMenuItem = (index, field, value) => {
    const newMenu = [...formData.deal_menu];
    newMenu[index][field] = value;
    setFormData({ ...formData, deal_menu: newMenu });
  };

  // Check if restaurant exists
  const fallbackId =
    typeof window !== "undefined" ? localStorage.getItem("restaurantId") : null;
  const hasRestaurant = restaurantId || fallbackId;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" text="Loading templates..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Templates</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage your deal templates
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          disabled={!hasRestaurant}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title={!hasRestaurant ? "Please create a restaurant first" : ""}
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Error Message */}
      {error && hasRestaurant && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={fetchTemplates}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Templates List */}
      {templates.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Templates Yet
          </h3>
          <p className="text-gray-600 mb-4">
            {hasRestaurant
              ? "Create your first template to get started"
              : "Create a restaurant first to manage templates"}
          </p>
          <button
            onClick={handleOpenCreate}
            disabled={!hasRestaurant}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!hasRestaurant ? "Please create a restaurant first" : ""}
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template._id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${template.template_color}20` }}
                  >
                    {iconOptions.find((i) => i.value === template.template_icon)
                      ?.emoji || "⭐"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {template.template_name}
                      </h3>
                      {template.hot_key_enabled && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                          Hot Key #{template.hot_key_position}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.template_description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>💰 £{template.deal_price}</span>
                      <span>👥 {template.max_capacity} seats</span>
                      <span>📅 {template.default_duration_days} days</span>
                      <span>🚀 Used {template.times_used || 0} times</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleHotKey(template._id)}
                    disabled={!hasRestaurant}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      template.hot_key_enabled
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title={
                      !hasRestaurant
                        ? "Restaurant required"
                        : template.hot_key_enabled
                        ? "Disable Hot Key"
                        : "Enable Hot Key"
                    }
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    disabled={!hasRestaurant}
                    className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      !hasRestaurant
                        ? "Restaurant required"
                        : "Duplicate Template"
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(template)}
                    disabled={!hasRestaurant}
                    className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      !hasRestaurant ? "Restaurant required" : "Edit Template"
                    }
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template._id)}
                    disabled={!hasRestaurant}
                    className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      !hasRestaurant ? "Restaurant required" : "Delete Template"
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal - Only shown if restaurant exists */}
      {showModal && hasRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Template Info Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Template Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={formData.template_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          template_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Weekend Brunch Template"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon
                    </label>
                    <select
                      value={formData.template_icon}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          template_icon: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {iconOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.emoji} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.template_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          template_description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                      placeholder="Describe this template..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              template_color: color.value,
                            })
                          }
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            formData.template_color === color.value
                              ? "border-gray-900 scale-110"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hot_key_enabled"
                      checked={formData.hot_key_enabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hot_key_enabled: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <label
                      htmlFor="hot_key_enabled"
                      className="text-sm font-medium text-gray-700"
                    >
                      Enable as Hot Key
                    </label>
                  </div>
                </div>
              </div>

              {/* Deal Settings Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Deal Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deal Title *
                    </label>
                    <input
                      type="text"
                      value={formData.deal_title}
                      onChange={(e) =>
                        setFormData({ ...formData, deal_title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Weekend Brunch Special"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (£) *
                    </label>
                    <input
                      type="number"
                      value={formData.deal_price}
                      onChange={(e) =>
                        setFormData({ ...formData, deal_price: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="25"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deal Description
                    </label>
                    <textarea
                      value={formData.deal_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deal_description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                      placeholder="Describe the deal..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (£)
                    </label>
                    <input
                      type="number"
                      value={formData.deal_discount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deal_discount: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Capacity *
                    </label>
                    <input
                      type="number"
                      value={formData.max_capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_capacity: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="25"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slot Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.slot_duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slot_duration: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="30"
                      min="15"
                      step="15"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expires In (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.deal_expires_in}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deal_expires_in: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.default_start_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          default_start_time: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Duration (days)
                    </label>
                    <input
                      type="number"
                      value={formData.default_duration_days}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          default_duration_days: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="7"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Menu Items Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Menu Items
                  </h3>
                  <button
                    type="button"
                    onClick={addMenuItem}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-medium"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.deal_menu.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="md:col-span-4">
                        <input
                          type="text"
                          value={item.item_name}
                          onChange={(e) =>
                            updateMenuItem(index, "item_name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Item name"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          value={item.item_price}
                          onChange={(e) =>
                            updateMenuItem(index, "item_price", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Price"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="md:col-span-5">
                        <input
                          type="text"
                          value={item.item_description}
                          onChange={(e) =>
                            updateMenuItem(
                              index,
                              "item_description",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Description"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-center">
                        {formData.deal_menu.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMenuItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingTemplate ? "Update Template" : "Create Template"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;
