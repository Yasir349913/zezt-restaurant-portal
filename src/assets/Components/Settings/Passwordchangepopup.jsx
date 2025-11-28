import React, { useState } from "react";
import { X, Eye, EyeOff, Lock } from "lucide-react";

const PasswordChangePopup = ({ onClose, onChangePassword }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const validatePasswords = () => {
    const newErrors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    // Update the field value
    switch (field) {
      case "currentPassword":
        setCurrentPassword(value);
        break;
      case "newPassword":
        setNewPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Clear success message when user starts typing
    if (success) {
      setSuccess("");
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setSuccess("Password changed successfully!");

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Close popup after delay
      setTimeout(() => {
        if (onChangePassword) {
          onChangePassword({
            currentPassword,
            newPassword,
            confirmPassword,
          });
        }
      }, 1500);
    } catch (error) {
      setErrors({ general: error.message || "Failed to change password" });
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleChangePassword();
    }
  };

  const PasswordInput = ({
    label,
    value,
    onChange,
    show,
    onToggleShow,
    placeholder,
    error,
    disabled,
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <Lock
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-red-300" : "border-gray-300"
          }`}
        />
        <button
          type="button"
          onClick={onToggleShow}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-80 p-6 relative shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={loading}
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Change Password
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Protect your account with a strong password
        </p>

        <div className="space-y-4 mb-6">
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={(value) => handleInputChange("currentPassword", value)}
            show={showCurrentPassword}
            onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
            placeholder="•••••••••"
            error={errors.currentPassword}
            disabled={loading}
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(value) => handleInputChange("newPassword", value)}
            show={showNewPassword}
            onToggleShow={() => setShowNewPassword(!showNewPassword)}
            placeholder="•••••••••"
            error={errors.newPassword}
            disabled={loading}
          />

          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={(value) => handleInputChange("confirmPassword", value)}
            show={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            placeholder="•••••••••"
            error={errors.confirmPassword}
            disabled={loading}
          />
        </div>

        {errors.general && (
          <p className="text-red-500 text-xs mb-4 text-center">
            {errors.general}
          </p>
        )}

        {success && (
          <p className="text-green-500 text-xs mb-4 text-center">{success}</p>
        )}

        <button
          onClick={handleChangePassword}
          disabled={
            loading || !currentPassword || !newPassword || !confirmPassword
          }
          className="w-full bg-red-400 hover:bg-red-500 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Changing Password...
            </div>
          ) : (
            "Change Password"
          )}
        </button>

        <div className="mt-4 text-xs text-gray-500">
          <p>Password requirements:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>At least 6 characters long</li>
            <li>Different from current password</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangePopup;
