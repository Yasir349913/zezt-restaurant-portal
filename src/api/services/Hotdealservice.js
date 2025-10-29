// src/api/services/HotKeysService.js
import { http } from "../api";

let RESTAURANT_ID = null;

/**
 * Set the restaurantId (used when no id is passed explicitly).
 */
export const setRestaurantId = (id) => {
  RESTAURANT_ID = id;
};

export const getRestaurantId = () => RESTAURANT_ID;

/**
 * API 1: Get all templates for a restaurant
 * GET /api/templates/:restaurantId
 */
export const getAllTemplates = async (restaurantId) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/templates/${id}`);
  return data;
};

/**
 * API 2: Get only hot key enabled templates
 * GET /api/templates/:restaurantId/hotkeys
 */
export const getHotKeyTemplates = async (restaurantId) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/templates/${id}/hotkeys`);
  return data;
};

/**
 * API 3: Quick launch a deal from template (THE MAIN FEATURE!)
 * POST /api/templates/:templateId/launch
 * @param {string} templateId - Template ID to launch
 * @param {object} overrides - Optional overrides for the deal
 * @param {string} overrides.deal_start_date - Custom start date (ISO string)
 * @param {number} overrides.duration_days - Custom duration in days
 * @param {number} overrides.max_capacity - Custom capacity
 */
export const quickLaunchDeal = async (templateId, overrides = {}) => {
  if (!templateId) throw new Error("templateId is required");
  const { data } = await http.post(`/templates/${templateId}/launch`, overrides);
  return data;
};

/**
 * API 4: Create a new template
 * POST /api/templates
 * @param {object} templateData - Complete template data
 */
export const createTemplate = async (templateData) => {
  if (!templateData.restaurant_id) {
    templateData.restaurant_id = RESTAURANT_ID;
  }
  if (!templateData.restaurant_id) throw new Error("restaurant_id is required");
  
  const { data } = await http.post('/templates', templateData);
  return data;
};

/**
 * API 5: Create template from an existing deal
 * POST /api/templates/from-deal/:dealId
 * @param {string} dealId - Deal ID to convert
 * @param {object} templateInfo - Template metadata (name, description, icon, color, hot_key_enabled)
 */
export const createTemplateFromDeal = async (dealId, templateInfo) => {
  if (!dealId) throw new Error("dealId is required");
  const { data } = await http.post(`/templates/from-deal/${dealId}`, templateInfo);
  return data;
};

/**
 * API 6: Update an existing template
 * PUT /api/templates/:templateId
 * @param {string} templateId - Template ID to update
 * @param {object} updates - Fields to update
 */
export const updateTemplate = async (templateId, updates) => {
  if (!templateId) throw new Error("templateId is required");
  const { data } = await http.put(`/templates/${templateId}`, updates);
  return data;
};

/**
 * API 7: Toggle hot key enabled status
 * PATCH /api/templates/:templateId/toggle-hotkey
 * @param {string} templateId - Template ID to toggle
 */
export const toggleHotKey = async (templateId) => {
  if (!templateId) throw new Error("templateId is required");
  const { data } = await http.patch(`/templates/${templateId}/toggle-hotkey`);
  return data;
};

/**
 * API 8: Delete a template (soft delete)
 * DELETE /api/templates/:templateId
 * @param {string} templateId - Template ID to delete
 */
export const deleteTemplate = async (templateId) => {
  if (!templateId) throw new Error("templateId is required");
  const { data } = await http.delete(`/templates/${templateId}`);
  return data;
};

/**
 * API 9: Get popular templates (most used)
 * GET /api/templates/:restaurantId/popular?limit=5
 * @param {number} limit - Number of templates to return (default: 5)
 */
export const getPopularTemplates = async (restaurantId, limit = 5) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/templates/${id}/popular`, {
    params: { limit }
  });
  return data;
};

/**
 * Helper: Duplicate a template
 * This creates a new template based on an existing one
 */
export const duplicateTemplate = async (template) => {
  if (!template) throw new Error("template is required");
  
  const newTemplate = {
    ...template,
    template_name: `${template.template_name} (Copy)`,
    hot_key_enabled: false
  };
  
  // Remove fields that shouldn't be copied
  delete newTemplate._id;
  delete newTemplate.times_used;
  delete newTemplate.last_used;
  delete newTemplate.createdAt;
  delete newTemplate.updatedAt;
  
  return createTemplate(newTemplate);
};