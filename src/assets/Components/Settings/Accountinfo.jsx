import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";


const Accountinfo = ({ onChangePasswordClick }) => {
  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserProfile().then((data) => {
      setUserProfile(data);
      setLoading(false);
    });
  }, []);

  const handleInputChange = (field, value) => {
    setUserProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const result = await updateUserProfile(userProfile);
      alert(result.message);
    } catch (error) {
      alert("Error updating profile");
    }
    setUpdating(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const result = await uploadProfileImage(file);
        setUserProfile((prev) => ({ ...prev, profileImage: result.imageUrl }));
      } catch (error) {
        alert("Error uploading image");
      }
    }
  };

  if (loading) {
    return (
      <div
        className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center"
        style={{ width: "893px", height: "500px" }}
      >
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-6"
      style={{
        width: "893px",
        height: "500px",
        top: "268px",
        left: "390px",
      }}
    >
      {/* Personal Information Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Personal Information
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Update your personal details and contact information.
        </p>

        {/* Profile Picture */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-start">
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
              <img
                src={
                  userProfile.profileImage ||
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=center"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pt-1">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Profile picture
              </h3>
              <p className="text-xs text-gray-500">PNG, JPEG under 1MB</p>
            </div>
          </div>
          <label className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-none border-none cursor-pointer">
            Upload new picture
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 mb-6">
          {/* First Row: First Name and Last Name */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={userProfile.firstName || ""}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={userProfile.lastName || ""}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Second Row: Email and Phone */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={userProfile.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="text"
                value={userProfile.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Update Button */}
        <button
          onClick={handleUpdate}
          disabled={updating}
          className="w-full bg-red-400 hover:bg-red-500 text-white py-3 px-4 rounded-md text-sm font-medium transition-colors mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Updating..." : "Update"}
        </button>
      </div>

      {/* Change Password Section */}
      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={onChangePasswordClick}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-md transition-colors"
        >
          <span className="text-sm font-medium text-gray-900">
            Change Password
          </span>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default Accountinfo;
