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
  DollarSign,
  Users,
  Clock,
  Search,
  Filter,
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

const TemplateManagement = () => {
  const { restaurantId } = useRestaurant();

  // State Management
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
  const [activeTab, setActiveTab] = useState("all"); // all, hotkeys, popular
  const [launchingId, setLaunchingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states for create/edit
  const [formData, setFormData] = useState({
    template_name: "",
    template_description: "",
    deal_title: "",
    deal_description: "",
    deal_type: "percentage",
    discount_value: "",
    min_order_value: "",
    max_discount_cap: "",
    duration_days: 7,
    max_capacity: "",
    hot_key_enabled: false,
    icon: "🎉",
    color: "#3B82F6",
  });

  // Launch override form
  const [launchOverrides, setLaunchOverrides] = useState({
    deal_start_date: new Date().toISOString().split("T")[0],
    duration_days: 7,
    max_capacity: "",
  });

  // Initialize restaurant ID on mount
  useEffect(() => {
    if (restaurantId) {
      setRestaurantId(restaurantId);
      console.log("Restaurant ID set:", getRestaurantId());
      fetchAllData();
    }
  }, [restaurantId]);

  // API 1, 2, 9: Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [allTemplatesData, hotKeysData, popularData, dealsData] =
        await Promise.all([
          getAllTemplates(restaurantId), // API 1
          getHotKeyTemplates(restaurantId), // API 2
          getPopularTemplates(restaurantId, 5), // API 9
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

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  // API 7: Toggle hot key enabled status
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

  // API 8: Delete a template
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

  // Helper: Duplicate a template
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

  // API 3: Quick launch a deal from template
  const handleQuickLaunch = async (template) => {
    setSelectedTemplate(template);
    setLaunchOverrides({
      deal_start_date: new Date().toISOString().split("T")[0],
      duration_days: template.duration_days || 7,
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

  // API 4 & 6: Create or Update template
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
      const templateData = {
        ...formData,
        restaurant_id: restaurantId,
        discount_value: parseFloat(formData.discount_value),
        min_order_value: formData.min_order_value
          ? parseFloat(formData.min_order_value)
          : undefined,
        max_discount_cap: formData.max_discount_cap
          ? parseFloat(formData.max_discount_cap)
          : undefined,
        duration_days: parseInt(formData.duration_days),
        max_capacity: formData.max_capacity
          ? parseInt(formData.max_capacity)
          : undefined,
      };

      if (editingTemplate) {
        // API 6: Update
        const result = await updateTemplate(editingTemplate._id, templateData);
        alert(`✅ Template updated: ${result.template.template_name}`);
      } else {
        // API 4: Create
        const result = await createTemplate(templateData);
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

  // API 5: Create template from existing deal
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

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name || "",
      template_description: template.template_description || "",
      deal_title: template.deal_title || "",
      deal_description: template.deal_description || "",
      deal_type: template.deal_type || "percentage",
      discount_value: template.discount_value || "",
      min_order_value: template.min_order_value || "",
      max_discount_cap: template.max_discount_cap || "",
      duration_days: template.duration_days || 7,
      max_capacity: template.max_capacity || "",
      hot_key_enabled: template.hot_key_enabled || false,
      icon: template.icon || "🎉",
      color: template.color || "#3B82F6",
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      template_name: "",
      template_description: "",
      deal_title: "",
      deal_description: "",
      deal_type: "percentage",
      discount_value: "",
      min_order_value: "",
      max_discount_cap: "",
      duration_days: 7,
      max_capacity: "",
      hot_key_enabled: false,
      icon: "🎉",
      color: "#3B82F6",
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

    // Apply search filter
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

  const TemplateCard = ({ template }) => (
    <div
      className="bg-white p-6 rounded-lg border-2 hover:shadow-lg transition-all relative overflow-hidden"
      style={{ borderColor: template.color || "#3B82F6" }}
    >
      {/* Background gradient */}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl"
        style={{ backgroundColor: template.color }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="text-3xl p-3 rounded-lg"
              style={{ backgroundColor: `${template.color}20` }}
            >
              {template.icon || "🎉"}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {template.template_name}
              </h3>
              <p className="text-sm text-gray-500">
                {template.template_description || "No description"}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
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
          <p className="font-semibold text-gray-800 mb-1">
            {template.deal_title}
          </p>
          <p className="text-sm text-gray-600">
            {template.deal_description || "No deal description"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span>
              <strong>{template.discount_value}</strong>
              {template.deal_type === "percentage" ? "%" : " PKR"} off
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>
              <strong>{template.duration_days}</strong> days
            </span>
          </div>
          {template.min_order_value && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Min: PKR {template.min_order_value}</span>
            </div>
          )}
          {template.max_capacity && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span>Cap: {template.max_capacity}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Hot Deals Management
          </h1>
          <p className="text-gray-500 mt-1">
            Quick launch deals from templates - Restaurant ID: {restaurantId}
          </p>
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

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4 flex-wrap">
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
        <div className="flex gap-2">
          <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
            Total: {getCurrentTemplates().length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
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

      {/* Template Grid */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getCurrentTemplates().map((template) => (
            <TemplateCard key={template._id} template={template} />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full my-8">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
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
              {/* Template Info Section */}
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
                      placeholder="e.g., Weekend Flash Sale"
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
                      placeholder="Brief description of this template"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Icon (Emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-2xl text-center"
                      placeholder="🎉"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Theme Color
                    </label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-full h-10 px-1 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Deal Configuration Section */}
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
                      placeholder="e.g., 25% Off All Orders"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
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
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Detailed description for customers"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Deal Type *
                    </label>
                    <select
                      required
                      value={formData.deal_type}
                      onChange={(e) =>
                        setFormData({ ...formData, deal_type: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (PKR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.discount_value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_value: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={
                        formData.deal_type === "percentage" ? "25" : "500"
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Min Order Value (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.min_order_value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_order_value: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional: 1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Max Discount Cap (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.max_discount_cap}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_discount_cap: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional: 500"
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
                      value={formData.duration_days}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration_days: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="7"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.max_capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_capacity: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional: 100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <input
                    type="checkbox"
                    id="hotKeyEnabled"
                    checked={formData.hot_key_enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hot_key_enabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                  />
                  <label
                    htmlFor="hotKeyEnabled"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-yellow-600" />
                    Enable as Hot Key Template (Quick access)
                  </label>
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

      {/* Quick Launch Modal */}
      {showLaunchModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
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
                style={{ backgroundColor: `${selectedTemplate.color}20` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{selectedTemplate.icon}</span>
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
                  <p>
                    💰 {selectedTemplate.discount_value}
                    {selectedTemplate.deal_type === "percentage"
                      ? "%"
                      : " PKR"}{" "}
                    off
                  </p>
                  <p>
                    ⏱️ Default duration: {selectedTemplate.duration_days} days
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

      {/* Create From Deal Modal */}
      {showFromDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
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
                            icon: "🎉",
                            color: "#8B5CF6",
                          });
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {deal.deal_title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
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
