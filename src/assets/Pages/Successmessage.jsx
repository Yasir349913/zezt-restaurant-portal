// src/components/Successmessage.jsx
import React, { useState } from "react";
import Loginform from "./Loginform";

const Successmessage = () => {
  const [gotoLogin, setGotoLogin] = useState(false);

  if (gotoLogin) {
    return <Loginform />;
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 md:px-0 bg-gray-50">
      <div className="bg-red-50 rounded-xl p-6 sm:p-8 text-center w-full max-w-sm shadow-md">
        <div className="flex justify-center mb-6">
          <div className="bg-[#EB5757] rounded-full p-3">
            <svg
              className="text-white w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <p className="text-sm sm:text-base text-gray-600 mb-1">
          Your password has been reset
        </p>
        <p className="text-lg sm:text-xl font-semibold mb-6 text-gray-900">
          Successfully
        </p>
        <button
          className="w-full sm:w-auto bg-[#EB5757] text-white text-sm sm:text-base px-6 py-2.5 rounded-md hover:bg-red-600 font-medium transition-colors"
          onClick={() => setGotoLogin(true)}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Successmessage;
