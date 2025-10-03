import React, { useState } from "react";
import Verification from "./Verification";
import { forgetPassword } from "../../api/auth";

const Forgetpassword = ({ setShowForget }) => {
  const [email, setEmail] = useState("");
  const [submit, setSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: null, text: null });

    if (!email) {
      setMessage({ type: "error", text: "Please enter your email." });
      return;
    }

    try {
      setLoading(true);
      // API expects { email }
      const res = await forgetPassword({ email });

      // Optionally read any backend message:
      const okMsg =
        res?.message ||
        res?.status ||
        "We’ve sent a verification/OTP to your email (if it exists).";

      setMessage({ type: "success", text: okMsg });

      // move to verification step
      setSubmit(true);
    } catch (err) {
      const data = err?.response?.data || err || {};
      const errText =
        data.error || data.message || "Something went wrong. Please try again.";
      setMessage({ type: "error", text: errText });
    } finally {
      setLoading(false);
    }
  };

  if (submit) {
    // Pass email forward if your Verification component needs it
    return <Verification email={email} />;
  }

  return (
    <div className="w-1/2 flex items-center justify-center">
      <div className="w-80 p-8 rounded-lg">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">
          Forget Password
        </h2>
        <p className="text-gray-500 text-sm mb-6">Enter your email address</p>

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

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="email"
            className="text-sm font-medium mb-2 block text-gray-700"
          >
            Email
          </label>
          <div className="flex items-center border rounded-md px-3 py-2.5 mb-6 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400">
            <svg
              className="w-4 h-4 text-gray-400 mr-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <input
              type="email"
              id="email"
              placeholder="johnmiles@example.com"
              className="outline-none w-full text-sm bg-transparent text-gray-900 placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowForget && setShowForget(false)}
              className="w-full border text-gray-700 py-2.5 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-[#EB5757] text-white py-2.5 rounded-md hover:bg-red-600 text-sm font-medium transition-colors disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Forgetpassword;
