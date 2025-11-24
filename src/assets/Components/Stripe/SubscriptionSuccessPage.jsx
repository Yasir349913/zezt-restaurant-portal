import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, AlertCircle } from "lucide-react";

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    // Auto-redirect after 5 seconds if successful
    if (status === "success") {
      const timer = setTimeout(() => {
        navigate("/payments");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [navigate, status]);

  // Error state
  if (status !== "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Payment Failed
          </h1>

          <p className="text-gray-600 mb-6">
            There was an issue processing your subscription payment. Please try
            again.
          </p>

          <button
            onClick={() => navigate("/payments")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Payments
          </button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Subscription Activated! 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          Your restaurant is now fully active on the platform. You can start
          receiving bookings and earning!
        </p>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm text-green-900">
            <div className="flex justify-between">
              <span className="font-medium">Plan:</span>
              <span className="font-bold">Standard</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Monthly Fee:</span>
              <span className="font-bold">£100</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Next Payment:</span>
              <span className="font-bold">
                {new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/payments")}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mb-3"
        >
          <span>View Subscription Details</span>
          <ArrowRight className="h-5 w-5" />
        </button>

        <p className="text-sm text-gray-500">
          Redirecting automatically in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
