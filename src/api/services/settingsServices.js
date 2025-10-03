// src/api/services/Settingsservices.js
// Utility validators used by RestaurantForm

/**
 * Very small, practical validators.
 * Adjust rules to your needs.
 */

/** Validate simple email format */
export function validateEmail(email) {
  if (!email) return false;
  // simple, robust-ish email regex (not 100% RFC but good for UI)
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/** Validate phone (accepts digits, optional +, spaces, dashes, parentheses) */
export function validatePhone(phone) {
  if (!phone) return false;
  // allow +, digits, spaces, dashes, parentheses — require 7-15 digits total
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return false;
  // basic allowed characters check
  const re = /^[0-9+\-\s()]+$/;
  return re.test(String(phone));
}

/** Optional: more helpers you might want later */
export function normalizePhone(phone) {
  if (!phone) return "";
  return String(phone).replace(/\D/g, "");
}
