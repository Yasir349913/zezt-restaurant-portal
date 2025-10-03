// src/components/Successmessage.jsx
import React, { useState } from "react";
import Loginform from "./Loginform";

const Successmessage = () => {
  const [gotoLogin, setgotoLogin] = useState(false);

  if (gotoLogin) {
    return <Loginform />;
  }

  return (
    <div className="w-1/2 flex items-center justify-center bg-gray-50 p-8">
      <div className="bg-red-50 rounded-xl p-8 text-center w-80">
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
        <p className="text-sm text-gray-600 mb-1">
          Your Password has been reset
        </p>
        <p className="text-lg font-semibold mb-6 text-gray-900">Successfully</p>
        <button
          className="bg-[#EB5757] text-white text-sm px-6 py-2.5 rounded-md hover:bg-red-600 font-medium transition-colors"
          onClick={() => setgotoLogin(true)}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Successmessage;
