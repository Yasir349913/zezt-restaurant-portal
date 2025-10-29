import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader, ArrowRight } from "lucide-react";

const StripeSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const statusParam = searchParams.get("status"); // 'complete' or 'incomplete'
  const restaurantId = searchParams.get("restaurantId");

  useEffect(() => {
    if (statusParam === "complete") {
      setStatus("complete");
      setMessage("Your Stripe account has been successfully connected!");
    } else if (statusParam === "incomplete") {
      setStatus("incomplete");
      setMessage(
        "Your Stripe setup is incomplete. Please complete the remaining steps."
      );
    } else {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }, [statusParam]);

  const handleGoToDashboard = () => {
    navigate("/restaurant/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">
              Processing...
            </h2>
            <p className="text-gray-600 mt-2">
              Please wait while we verify your account
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "complete" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Success! 🎉
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                You can now start receiving payments from customers. Your
                account is fully activated!
              </p>
            </div>

            <button
              onClick={handleGoToDashboard}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Incomplete State */}
        {status === "incomplete" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <AlertCircle className="h-10 w-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Setup Incomplete
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Some information is still required to activate your account.
                Please return to complete the onboarding process.
              </p>
            </div>

            <button
              onClick={handleGoToDashboard}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something Went Wrong
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>

            <button
              onClick={handleGoToDashboard}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StripeSuccessPage;
