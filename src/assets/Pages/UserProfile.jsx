// src/assets/Pages/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchUserProfile, updateUserProfileApi } from "../../api/userApi";
import Loader from "../Components/Common/Loader";
import {
  validateFirstName,
  validateLastName,
  validatePassword,
} from "../../utils/validators";
const UserProfile = () => {
  const navigate = useNavigate();
  const { user: authUser, setUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchUserProfile();
      setFormData({
        firstName: data.user?.firstName || authUser?.firstName || "",
        lastName: data.user?.lastName || authUser?.lastName || "",
        email: data.user?.email || authUser?.email || "",
        oldPassword: "",
        newPassword: "",
      });
    } catch (err) {
      setError(err?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");

    // clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {
      firstName: validateFirstName(formData.firstName),
      lastName: validateLastName(formData.lastName),
    };

    // password change is optional
    if (formData.oldPassword || formData.newPassword) {
      if (!formData.oldPassword) {
        errors.oldPassword = "Current password is required";
      }
      if (!formData.newPassword) {
        errors.newPassword = "New password is required";
      } else {
        errors.newPassword = validatePassword(formData.newPassword);
      }
    }

    setFieldErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setError("Please fix the errors below");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };

      if (formData.oldPassword && formData.newPassword) {
        payload.oldPassword = formData.oldPassword;
        payload.newPassword = formData.newPassword;
      }

      const result = await updateUserProfileApi(payload);

      setSuccess(result.message || "Profile updated successfully");

      if (result.user && setUser) {
        const updatedUser = { ...authUser, ...result.user };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setFormData((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
      }));

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err?.error || err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const f = formData.firstName?.[0] || "";
    const l = formData.lastName?.[0] || "";
    return (f + l).toUpperCase() || "U";
  };

  // Loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Update your personal information</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Avatar Header */}
          <div className="bg-[#E57272] px-8 py-12 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white mb-4">
              {getInitials()}
            </div>
            <h2 className="text-2xl font-semibold text-white">
              {formData.firstName} {formData.lastName}
            </h2>
            <p className="text-white/80 mt-1">{formData.email}</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-[#FFF5F5] border border-[#E57272] rounded-lg text-[#E57272] text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Basic Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User size={20} className="mr-2" /> Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      className="input"
                    />
                    {fieldErrors.firstName && (
                      <p className="error">{fieldErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      className="input"
                    />
                    {fieldErrors.lastName && (
                      <p className="error">{fieldErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <input
                  value={formData.email}
                  disabled
                  className="mt-4 w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-500"
                />
              </div>

              {/* Password */}
              <div className="mb-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Lock size={20} className="mr-2" /> Change Password
                </h3>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="oldPassword"
                      value={formData.oldPassword}
                      onChange={handleChange}
                      placeholder="Current Password"
                      className="input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="eye-btn"
                    >
                      {showCurrentPassword ? <EyeOff /> : <Eye />}
                    </button>
                    {fieldErrors.oldPassword && (
                      <p className="error">{fieldErrors.oldPassword}</p>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="New Password"
                      className="input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="eye-btn"
                    >
                      {showNewPassword ? <EyeOff /> : <Eye />}
                    </button>
                    {fieldErrors.newPassword && (
                      <p className="error">{fieldErrors.newPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-6 py-3 bg-[#E57272] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  <Save size={18} className="mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Shared styles */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          outline: none;
        }
        .input:focus {
          border-color: #e57272;
          box-shadow: 0 0 0 2px rgba(229, 114, 114, 0.2);
        }
        .eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }
        .error {
          margin-top: 4px;
          font-size: 12px;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};

export default UserProfile;
