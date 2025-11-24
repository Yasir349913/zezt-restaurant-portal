// src/components/HotDeals/HotDealsManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Zap,
  Copy,
  Save,
  X,
  Rocket,
  Star,
  TrendingUp,
  Calendar,
  Users,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";
import { useRestaurant } from "../../../context/RestaurantContext";
import {
  getAllTemplates,
  getHotKeyTemplates,
  getPopularTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleHotKey,
  duplicateTemplate,
  quickLaunchDeal,
  createTemplateFromDeal,
  setRestaurantId,
  getRestaurantId,
} from "../../../api/services/Hotdealservice";
import { getAllDealsForCurrentMonth } from "../../../api/services/Dealsservice";

const ICON_MAP = {
  breakfast: "🥐",
  lunch: "🍱",
  dinner: "🍽️",
  "happy-hour": "🍻",
  brunch: "🥞",
  weekend: "🎉",
  "date-night": "🌙",
  family: "👪",
  business: "💼",
  special: "🏷️",
};

const TemplateManagement = () => {
  const { restaurantId } = useRestaurant();

  // List & UI state (unchanged)
  const [templates, setTemplates] = useState([]);
  const [hotKeyTemplates, setHotKeyTemplates] = useState([]);
  const [popularTemplates, setPopularTemplates] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFromDealModal, setShowFromDealModal] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [launchingId, setLaunchingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Form state: keys match your Mongo schema exactly ---
  const [formData, setFormData] = useState({
    // Template info
    template_name: "",
    template_description: "",
    template_color: "#3B82F6",
    template_icon: "special", // enum
    hot_key_enabled: false,
    hot_key_position: "",

    // Deal (template) settings
    deal_title: "",
    deal_description: "",
    deal_price: "", // required (Number)
    deal_discount: 0,
    deal_menu: [],

    // Timing settings
    deal_expires_in: 7,
    slot_duration: 30,
    max_capacity: 1,

    // Default timing / times
    default_start_time: "12:00",
    default_duration_days: 7,

    // Metadata
    is_active: true,
    created_from_deal_id: null,
  });

  // Launch override (unchanged)
  const [launchOverrides, setLaunchOverrides] = useState({
    deal_start_date: new Date().toISOString().split("T")[0],
    duration_days: 7,
    max_capacity: "",
  });

  // Init restaurant id & fetch
  useEffect(() => {
    if (restaurantId) {
      setRestaurantId(restaurantId);
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [allTemplatesData, hotKeysData, popularData, dealsData] =
        await Promise.all([
          getAllTemplates(restaurantId),
          getHotKeyTemplates(restaurantId),
          getPopularTemplates(restaurantId, 5),
          getAllDealsForCurrentMonth(restaurantId),
        ]);

      setTemplates(allTemplatesData.templates || []);
      setHotKeyTemplates(hotKeysData.templates || []);
      setPopularTemplates(popularData.templates || []);
      setDeals(Array.isArray(dealsData) ? dealsData : dealsData?.deals || []);
    } catch (err) {
      console.error("Fetch error:", err);
      alert(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Other actions (refresh/toggles/delete/duplicate/quick launch)
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const handleToggleHotKey = async (templateId) => {
    try {
      const result = await toggleHotKey(templateId);
      await fetchAllData();
      alert(
        `Hot key ${result.template.hot_key_enabled ? "enabled" : "disabled"}!`
      );
    } catch (err) {
      console.error("Toggle error:", err);
      alert(`Failed to toggle hot key: ${err.message}`);
    }
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;
    try {
      await deleteTemplate(templateId);
      await fetchAllData();
      alert("Template deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleDuplicate = async (template) => {
    try {
      const result = await duplicateTemplate(template);
      await fetchAllData();
      alert(`Template duplicated: ${result.template.template_name}`);
    } catch (err) {
      console.error("Duplicate error:", err);
      alert(`Failed to duplicate: ${err.message}`);
    }
  };

  const handleQuickLaunch = (template) => {
    setSelectedTemplate(template);
    setLaunchOverrides({
      deal_start_date: new Date().toISOString().split("T")[0],
      duration_days:
        template.default_duration_days || template.deal_expires_in || 7,
      max_capacity: template.max_capacity || "",
    });
    setShowLaunchModal(true);
  };

  const executeLaunch = async () => {
    if (!selectedTemplate) return;
    try {
      setLaunchingId(selectedTemplate._id);
      const overrides = {
        deal_start_date: new Date(
          launchOverrides.deal_start_date
        ).toISOString(),
        duration_days: parseInt(launchOverrides.duration_days),
        max_capacity: launchOverrides.max_capacity
          ? parseInt(launchOverrides.max_capacity)
          : undefined,
      };
      const result = await quickLaunchDeal(selectedTemplate._id, overrides);
      setShowLaunchModal(false);
      alert(
        `🚀 Deal launched successfully!\n${
          result.deal?.deal_title || "New Deal"
        }\nStarts: ${new Date(
          result.deal?.deal_start_date
        ).toLocaleDateString()}\nExpires: ${new Date(
          result.deal?.deal_expires_at
        ).toLocaleDateString()}`
      );
      await fetchAllData();
    } catch (err) {
      console.error("Launch error:", err);
      alert(`Failed to launch deal: ${err.message}`);
    } finally {
      setLaunchingId(null);
    }
  };

  // --- Create / Update ---
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    const required = [
      "template_name",
      "deal_title",
      "deal_description",
      "deal_price",
      "deal_expires_in",
      "slot_duration",
      "max_capacity",
      "default_start_time",
    ];
    for (const key of required) {
      if (
        formData[key] === "" ||
        formData[key] === null ||
        typeof formData[key] === "undefined"
      ) {
        alert(`Please fill required field: ${key}`);
        return;
      }
    }

    try {
      const payload = {
        restaurant_id: restaurantId,
        template_name: formData.template_name,
        template_description: formData.template_description || undefined,
        template_color: formData.template_color,
        template_icon: formData.template_icon,
        hot_key_enabled: !!formData.hot_key_enabled,
        hot_key_position: formData.hot_key_position
          ? parseInt(formData.hot_key_position)
          : undefined,

        deal_title: formData.deal_title,
        deal_description: formData.deal_description,
        deal_price: parseFloat(formData.deal_price),
        deal_discount: formData.deal_discount
          ? parseFloat(formData.deal_discount)
          : 0,
        deal_menu: (formData.deal_menu || []).map((m) => ({
          item_name: m.item_name,
          item_price: parseFloat(m.item_price),
          item_description: m.item_description,
        })),

        deal_expires_in: parseInt(formData.deal_expires_in),
        slot_duration: parseInt(formData.slot_duration),
        max_capacity: parseInt(formData.max_capacity),

        default_start_time: formData.default_start_time,
        default_duration_days: parseInt(formData.default_duration_days || 7),

        is_active: !!formData.is_active,
        created_from_deal_id: formData.created_from_deal_id || undefined,
      };

      if (editingTemplate) {
        const result = await updateTemplate(editingTemplate._id, payload);
        alert(`✅ Template updated: ${result.template.template_name}`);
      } else {
        const result = await createTemplate(payload);
        alert(`✅ Template created: ${result.template.template_name}`);
      }

      setShowCreateModal(false);
      setEditingTemplate(null);
      resetForm();
      await fetchAllData();
    } catch (err) {
      console.error("Save error:", err);
      alert(`Failed to save template: ${err.message}`);
    }
  };

  // Create from deal
  const handleCreateFromDeal = async (dealId, templateInfo) => {
    try {
      const result = await createTemplateFromDeal(dealId, {
        ...templateInfo,
        restaurant_id: restaurantId,
      });
      setShowFromDealModal(false);
      await fetchAllData();
      alert(`✅ Template created from deal: ${result.template.template_name}`);
    } catch (err) {
      console.error("Create from deal error:", err);
      alert(`Failed to create template: ${err.message}`);
    }
  };

  // Edit modal: populate formData
  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name || "",
      template_description: template.template_description || "",
      template_color: template.template_color || "#3B82F6",
      template_icon: template.template_icon || "special",
      hot_key_enabled: !!template.hot_key_enabled,
      hot_key_position: template.hot_key_position || "",

      deal_title: template.deal_title || "",
      deal_description: template.deal_description || "",
      deal_price: template.deal_price != null ? template.deal_price : "",
      deal_discount:
        template.deal_discount != null ? template.deal_discount : 0,
      deal_menu: Array.isArray(template.deal_menu)
        ? template.deal_menu.map((m) => ({
            item_name: m.item_name || "",
            item_price: m.item_price != null ? m.item_price : "",
            item_description: m.item_description || "",
          }))
        : [],

      deal_expires_in: template.deal_expires_in || 7,
      slot_duration: template.slot_duration || 30,
      max_capacity: template.max_capacity || 1,

      default_start_time: template.default_start_time || "12:00",
      default_duration_days: template.default_duration_days || 7,

      is_active: template.is_active !== undefined ? template.is_active : true,
      created_from_deal_id: template.created_from_deal_id || null,
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      template_name: "",
      template_description: "",
      template_color: "#3B82F6",
      template_icon: "special",
      hot_key_enabled: false,
      hot_key_position: "",

      deal_title: "",
      deal_description: "",
      deal_price: "",
      deal_discount: 0,
      deal_menu: [],

      deal_expires_in: 7,
      slot_duration: 30,
      max_capacity: 1,

      default_start_time: "12:00",
      default_duration_days: 7,

      is_active: true,
      created_from_deal_id: null,
    });
  };

  const getCurrentTemplates = () => {
    let currentList = [];
    switch (activeTab) {
      case "hotkeys":
        currentList = hotKeyTemplates;
        break;
      case "popular":
        currentList = popularTemplates;
        break;
      default:
        currentList = templates;
    }

    if (searchQuery.trim()) {
      return currentList.filter(
        (t) =>
          t.template_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.deal_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.template_description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }
    return currentList;
  };

  // Template card - fixed overflow/wrapping + show pounds
  const TemplateCard = ({ template }) => {
    const emoji = ICON_MAP[template.template_icon] || "🏷️";

    return (
      <div
        className="bg-white p-6 rounded-lg border-2 hover:shadow-lg transition-all relative overflow-hidden min-h-[200px] flex flex-col"
        style={{ borderColor: template.template_color || "#3B82F6" }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: template.template_color }}
        />

        <div className="relative z-10 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4 min-w-0">
              <div className="flex items-center gap-4 min-w-0">
                {/* emoji badge (fixed width so text has room) */}
                <div
                  className="text-2xl px-3 py-2 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${template.template_color}20` }}
                  aria-hidden
                >
                  {emoji}
                </div>

                {/* allow title/description to wrap fully */}
                <div className="min-w-0">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-800 leading-tight">
                    {template.template_name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 leading-tight whitespace-normal break-words">
                    {template.template_description || "No description"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap justify-end items-start">
                {template.hot_key_enabled && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Hot Key
                  </span>
                )}
                {template.times_used > 0 && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                    {template.times_used}x used
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              {/* full wrapping — no truncation */}
              <p className="font-semibold text-gray-800 whitespace-normal break-words">
                {template.deal_title}
              </p>
              <p className="text-sm text-gray-600 mt-2 whitespace-normal break-words">
                {template.deal_description || "No deal description"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-semibold">£</span>
                <span>
                  <strong>{template.deal_discount ?? 0}</strong> discount
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>
                  <strong>{template.deal_expires_in}</strong> days
                </span>
              </div>

              {template.min_order_value && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Min: £{template.min_order_value}</span>
                </div>
              )}

              {template.max_capacity && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span>Maximum capacity: {template.max_capacity}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mt-2">
            <button
              onClick={() => handleQuickLaunch(template)}
              disabled={launchingId === template._id}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 min-w-[120px]"
            >
              <Rocket className="w-4 h-4" />
              {launchingId === template._id ? "Launching..." : "Quick Launch"}
            </button>

            <button
              onClick={() => handleToggleHotKey(template._id)}
              className={`p-2 rounded-lg transition-colors ${
                template.hot_key_enabled
                  ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
              title="Toggle Hot Key"
            >
              <Zap className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDuplicate(template)}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={() => openEditModal(template)}
              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDelete(template._id)}
              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 pt-20 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
            Hot Deals Management
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={() => setShowFromDealModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            From Deal
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingTemplate(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      {/* Search / Stats */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4 flex-wrap mb-4">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 items-center">
          <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
            Total: {getCurrentTemplates().length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "all"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab("hotkeys")}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "hotkeys"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Zap className="w-4 h-4" />
          Hot Keys ({hotKeyTemplates.length})
        </button>
        <button
          onClick={() => setActiveTab("popular")}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "popular"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Star className="w-4 h-4" />
          Popular ({popularTemplates.length})
        </button>
      </div>

      {/* Grid */}
      {getCurrentTemplates().length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {searchQuery.trim() ? (
              <Search className="w-16 h-16 mx-auto mb-2" />
            ) : (
              <Zap className="w-16 h-16 mx-auto mb-2" />
            )}
          </div>
          <p className="text-gray-500 text-lg mb-2">
            {searchQuery.trim() ? "No templates found" : "No templates yet"}
          </p>
          {!searchQuery.trim() && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-blue-600 hover:underline"
            >
              Create your first template
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {getCurrentTemplates().map((template) => (
            <TemplateCard key={template._id} template={template} />
          ))}
        </div>
      )}

      {/* Create/Edit Modal (fields updated to show pounds where relevant) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full my-12 md:my-0 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold">
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-6">
              {/* TEMPLATE INFO */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-blue-600">
                  <Star className="w-5 h-5" />
                  Template Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.template_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          template_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Weekend Brunch"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Template Description
                    </label>
                    <textarea
                      value={formData.template_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          template_description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Short description (max 500 chars)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Theme Color
                    </label>
                    <input
                      type="color"
                      value={formData.template_color}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          template_color: e.target.value,
                        })
                      }
                      className="w-full h-10 px-1 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Template Icon (type)
                    </label>
                    <select
                      value={formData.template_icon}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          template_icon: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Hot Key Enabled
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.hot_key_enabled}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hot_key_enabled: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <label className="text-sm">Enable</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Hot Key Position
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.hot_key_position}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hot_key_position: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional: 1-12"
                    />
                  </div>
                </div>
              </div>

              {/* DEAL CONFIG */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-green-600">
                  <Rocket className="w-5 h-5" />
                  Deal Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Deal Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.deal_title}
                      onChange={(e) =>
                        setFormData({ ...formData, deal_title: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Happy Hour Combo"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Deal Description *
                    </label>
                    <textarea
                      required
                      value={formData.deal_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deal_description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Customer-facing description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Deal Price (£) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.deal_price}
                      onChange={(e) =>
                        setFormData({ ...formData, deal_price: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 499.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Deal Discount (£)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.deal_discount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deal_discount: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 50.00"
                    />
                  </div>

                  {/* deal_menu editor */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Deal Menu Items (optional)
                    </label>
                    <div className="space-y-2">
                      {(formData.deal_menu || []).map((item, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              required
                              value={item.item_name}
                              onChange={(e) => {
                                const newMenu = [...formData.deal_menu];
                                newMenu[idx].item_name = e.target.value;
                                setFormData({
                                  ...formData,
                                  deal_menu: newMenu,
                                });
                              }}
                              className="flex-1 px-2 py-1 border rounded-lg"
                              placeholder="Item name"
                            />
                            <input
                              type="number"
                              required
                              min="0"
                              step="0.01"
                              value={item.item_price}
                              onChange={(e) => {
                                const newMenu = [...formData.deal_menu];
                                newMenu[idx].item_price = e.target.value;
                                setFormData({
                                  ...formData,
                                  deal_menu: newMenu,
                                });
                              }}
                              className="w-40 px-2 py-1 border rounded-lg"
                              placeholder="Price (£)"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newMenu = formData.deal_menu.filter(
                                  (_, i) => i !== idx
                                );
                                setFormData({
                                  ...formData,
                                  deal_menu: newMenu,
                                });
                              }}
                              className="p-2 bg-red-100 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="mt-2">
                            <input
                              type="text"
                              value={item.item_description}
                              onChange={(e) => {
                                const newMenu = [...formData.deal_menu];
                                newMenu[idx].item_description = e.target.value;
                                setFormData({
                                  ...formData,
                                  deal_menu: newMenu,
                                });
                              }}
                              className="w-full px-2 py-1 border rounded-lg"
                              placeholder="Item description (optional)"
                            />
                          </div>
                        </div>
                      ))}

                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            const newMenu = [
                              ...(formData.deal_menu || []),
                              {
                                item_name: "",
                                item_price: "",
                                item_description: "",
                              },
                            ];
                            setFormData({ ...formData, deal_menu: newMenu });
                          }}
                          className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add item
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Deal Expires In (days) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.deal_expires_in}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deal_expires_in: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 7"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Slot Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      min="15"
                      value={formData.slot_duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slot_duration: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Max Capacity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.max_capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_capacity: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Default Start Time (HH:MM) *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.default_start_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          default_start_time: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Default Duration (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.default_duration_days}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          default_duration_days: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Is Active
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_active: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <label className="text-sm">Active</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingTemplate ? "Update" : "Create"} Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Launch modal & Create From Deal modal remain unchanged except display using £ where appropriate */}
      {showLaunchModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full my-12 md:my-0 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Rocket className="w-5 h-5 text-green-600" />
                Quick Launch Deal
              </h2>
              <button
                onClick={() => setShowLaunchModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${
                    selectedTemplate.template_color || "#3B82F6"
                  }20`,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">
                    {selectedTemplate.template_icon || "🏷️"}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedTemplate.template_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedTemplate.deal_title}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <p>💷 discount {selectedTemplate.deal_discount ?? 0} </p>
                  <p>
                    ⏱️ Default duration:{" "}
                    {selectedTemplate.default_duration_days ??
                      selectedTemplate.deal_expires_in}{" "}
                    days
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={launchOverrides.deal_start_date}
                  onChange={(e) =>
                    setLaunchOverrides({
                      ...launchOverrides,
                      deal_start_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Duration (Days) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={launchOverrides.duration_days}
                  onChange={(e) =>
                    setLaunchOverrides({
                      ...launchOverrides,
                      duration_days: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Max Capacity (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={launchOverrides.max_capacity}
                  onChange={(e) =>
                    setLaunchOverrides({
                      ...launchOverrides,
                      max_capacity: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty to use template default"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLaunchModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeLaunch}
                  disabled={launchingId === selectedTemplate._id}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  <Rocket className="w-4 h-4" />
                  {launchingId === selectedTemplate._id
                    ? "Launching..."
                    : "Launch Deal"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFromDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-12 md:my-0">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Copy className="w-5 h-5 text-purple-600" />
                Create Template from Existing Deal
              </h2>
              <button
                onClick={() => setShowFromDealModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {deals.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No deals available this month</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Create a deal first, then convert it to a template
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Select a deal to convert into a reusable template
                  </p>
                  {deals.map((deal) => (
                    <div
                      key={deal._id || deal.id}
                      className="p-4 border-2 rounded-lg hover:border-purple-500 cursor-pointer transition-all hover:shadow-md"
                      onClick={() => {
                        const templateName = window.prompt(
                          "Enter template name:",
                          `${deal.deal_title} Template`
                        );
                        if (templateName) {
                          const description = window.prompt(
                            "Enter template description (optional):",
                            deal.deal_description || ""
                          );
                          handleCreateFromDeal(deal._id || deal.id, {
                            template_name: templateName,
                            template_description: description || "",
                            hot_key_enabled: false,
                            template_color: "#8B5CF6",
                            template_icon: "special",
                          });
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">
                            {deal.deal_title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {deal.deal_description || "No description"}
                          </p>
                          <div className="flex gap-3 mt-2 text-xs text-gray-500">
                            <span>
                              📅{" "}
                              {new Date(
                                deal.deal_start_date
                              ).toLocaleDateString()}
                            </span>
                            <span>🎯 {deal.redemption || 0} redemptions</span>
                          </div>
                        </div>
                        <Copy className="w-5 h-5 text-purple-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;
