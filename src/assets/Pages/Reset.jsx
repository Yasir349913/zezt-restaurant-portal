// src/components/Reset.jsx
import React, { useState } from "react";
import Successmessage from "./Successmessage";
import { resetPassword } from "../../api/auth";

export default function Reset({ email, onCancel }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: null });
  const [done, setDone] = useState(false);

  const toggleVisibility = () => setShowPassword((v) => !v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: null, text: null });
    if (!email) {
      setMessage({
        type: "error",
        text: "Email missing. Please start from Forgot Password.",
      });
      return;
    }
    if (!password || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill both password fields." });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (password.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword({ email, newPassword: password });
      const okMsg = res?.message || "Password reset successful.";
      setMessage({ type: "success", text: okMsg });
      setDone(true);
    } catch (err) {
      const data = err?.response?.data || err || {};
      const errText =
        data.error || data.message || "Something went wrong. Please try again.";
      setMessage({ type: "error", text: errText });
    } finally {
      setLoading(false);
    }
  };

  if (done) return <Successmessage />;

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 md:px-0 bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-md">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">
          Reset Password
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mb-6">
          Create a new password
        </p>

        {message?.text && (
          <div
            className={`mb-4 rounded-md px-3 py-2 text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm sm:text-base font-medium mb-2 text-gray-700"
            >
              New Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2.5 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400 bg-white">
              <svg
                className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2V9a2 2 0 00-2-2h-2V5a4 4 0 10-8 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="********"
                className="outline-none w-full text-sm sm:text-base bg-transparent text-gray-900 placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={toggleVisibility}
                className="text-gray-400 hover:text-gray-600 focus:outline-none ml-2"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm sm:text-base font-medium mb-2 text-gray-700"
            >
              Confirm Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2.5 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400 bg-white">
              <svg
                className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2V9a2 2 0 00-2-2h-2V5a4 4 0 10-8 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="********"
                className="outline-none w-full text-sm sm:text-base bg-transparent text-gray-900 placeholder-gray-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={toggleVisibility}
                className="text-gray-400 hover:text-gray-600 focus:outline-none ml-2"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => (onCancel ? onCancel() : window.history.back())}
              className="w-full sm:w-1/2 border border-gray-300 text-gray-700 py-2.5 rounded-md hover:bg-gray-50 text-sm sm:text-base font-medium transition-colors disabled:opacity-60"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-1/2 bg-[#EB5757] text-white py-2.5 rounded-md hover:bg-red-600 text-sm sm:text-base font-medium transition-colors disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
