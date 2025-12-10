import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

const Loginform = ({
  setShowForget,
  setShowAccount,
  onSubmit,
  loading,
  message,
  fieldErrors,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onSubmit?.({ email, password });
  };

  return (
    <div className="w-full flex justify-center items-center px-4 py-8 sm:px-6 md:px-0">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2 text-gray-900">
          Login
        </h2>
        <p className="text-sm sm:text-base text-gray-500 mb-6">
          Welcome back! Please enter your details below.
        </p>

        {/* Global message */}
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

        <div className="text-center text-sm text-gray-400 my-6">
          Login with email
        </div>

        <form onSubmit={submit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Email
            </label>
            <div className="relative flex items-center border border-gray-300 rounded-md px-3 py-3 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400 bg-white">
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
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johnmiles@example.com"
                className="w-full outline-none text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-transparent"
                autoComplete="email"
              />
            </div>
            {fieldErrors?.email && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Password
            </label>
            <div className="relative flex items-center border border-gray-300 rounded-md px-3 py-3 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400 bg-white">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full outline-none text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-transparent"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 ml-2"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
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
                )}
              </button>
            </div>
            {fieldErrors?.password && (
              <p className="text-xs sm:text-sm text-red-600 mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm sm:text-base gap-2 sm:gap-0 mb-6">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-400 accent-red-500"
              />
              Remember me
            </label>
            <button
              className="text-red-500 hover:text-red-600 font-medium"
              type="button"
              onClick={() => setShowForget && setShowForget(true)}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 font-medium transition-colors disabled:opacity-60 mb-4"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Create Account */}
        <p className="text-sm sm:text-base text-center text-gray-500">
          Not registered yet?{" "}
          <button
            type="button"
            onClick={() => setShowAccount && setShowAccount(true)}
            className="text-red-500 font-medium hover:text-red-600"
          >
            Create an Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default Loginform;
