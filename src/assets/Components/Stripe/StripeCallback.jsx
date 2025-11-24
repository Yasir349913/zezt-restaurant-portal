// src/assets/Components/Stripe/StripeCallback.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StripeService from "../../../api/services/Stripeservices"; // ✅ default export

const StripeCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error, incomplete
  const [message, setMessage] = useState("Verifying your Stripe account...");
  const [accountInfo, setAccountInfo] = useState(null);

  useEffect(() => {
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      setStatus("error");
      setMessage("Missing restaurant ID. Please try again.");
      return;
    }

    const verifyOnboarding = async () => {
      try {
        // ✅ Call the correct method from default export
        const result = await StripeService.verifyOnboarding();

        if (result.success && result.accountActive) {
          setStatus("success");
          setMessage("Your Stripe account is now active!");
          setAccountInfo(result);

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate("/restaurant/dashboard?stripe=connected");
          }, 2000);
        } else if (result.success && result.detailsSubmitted) {
          setStatus("incomplete");
          setMessage(
            "Your information has been submitted and is being reviewed by Stripe."
          );
          setAccountInfo(result);

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate("/restaurant/dashboard?stripe=pending");
          }, 3000);
        } else {
          setStatus("incomplete");
          setMessage("Additional information is required to complete setup.");
          setAccountInfo(result);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(
          error.message || "Failed to verify Stripe account. Please try again."
        );
      }
    };

    verifyOnboarding();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === "verifying" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Verifying Account
            </h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Success!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {accountInfo && (
              <div className="text-sm text-gray-500">
                <p>Account ID: {accountInfo.accountId}</p>
                <p>Redirecting to dashboard...</p>
              </div>
            )}
          </>
        )}

        {status === "incomplete" && (
          <>
            <div className="text-yellow-500 text-6xl mb-4">⚠</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Almost There
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {accountInfo?.requirements?.currently_due?.length > 0 && (
              <div className="mt-4 text-left bg-yellow-50 p-4 rounded">
                <p className="font-medium text-sm text-gray-700 mb-2">
                  Required information:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {accountInfo.requirements.currently_due.map((req, index) => (
                    <li key={index}>{req.replace(/_/g, " ")}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={() => navigate("/restaurant/dashboard")}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 text-6xl mb-4">✕</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate("/restaurant/dashboard")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StripeCallback;
