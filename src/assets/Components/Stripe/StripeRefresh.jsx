import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const StripeRefresh = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const restaurantId = searchParams.get("restaurantId");

  useEffect(() => {
    if (!restaurantId) {
      navigate("/restaurant/dashboard?error=missing_id");
      return;
    }

    // Redirect to backend refresh endpoint
    // Backend will generate new link and redirect back to Stripe
    window.location.href = `${
      import.meta.env.VITE_API_URL
    }/restaurant/stripe/refresh?restaurantId=${restaurantId}`;
  }, [restaurantId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Refreshing your onboarding link...</p>
      </div>
    </div>
  );
};

export default StripeRefresh;
