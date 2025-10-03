import React, { useState } from "react";
import { X, Mail } from "lucide-react";


const EmailInputPopup = ({ onClose, onGetCode }) => {
  const [email, setEmail] = useState("johnmiles@example.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetCode = async () => {
    // Validate email
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await sendVerificationCode(email);
      console.log("Verification code sent:", result.message);

      if (onGetCode) {
        onGetCode(email);
      }
    } catch (error) {
      setError("Failed to send verification code. Please try again.");
      console.error("Send code error:", error);
    }
    setLoading(false);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError(""); // Clear error when user starts typing
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleGetCode();
    }
  };

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
          Please enter your email to receive a verification code
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                error ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter your email address"
            />
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <button
          onClick={handleGetCode}
          disabled={loading || !email.trim()}
          className="w-full bg-red-400 hover:bg-red-500 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending Code...
            </div>
          ) : (
            "Get Code"
          )}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          A verification code will be sent to your email address
        </p>
      </div>
    </div>
  );
};

export default EmailInputPopup;
