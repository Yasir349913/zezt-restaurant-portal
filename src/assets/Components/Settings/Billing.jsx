import React, { useState, useEffect } from "react";


const BillingSettings = () => {
  const [billingData, setBillingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState(false);

  useEffect(() => {
    fetchBillingData()
      .then((data) => {
        setBillingData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching billing data:", error);
        setLoading(false);
      });
  }, []);

  const handleChangePlan = async () => {
    setChangingPlan(true);
    try {
      const result = await changePlan({ planType: "premium" });
      alert(result.message);
      // Refresh billing data after plan change
      const updatedData = await fetchBillingData();
      setBillingData(updatedData);
    } catch (error) {
      alert("Error changing plan");
      console.error("Plan change error:", error);
    }
    setChangingPlan(false);
  };

  if (loading) {
    return (
      <div
        className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center"
        style={{ width: "893px", height: "384px" }}
      >
        <div className="text-gray-500">Loading billing information...</div>
      </div>
    );
  }

  const { currentPlan, billingInfo } = billingData;

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-6"
      style={{
        width: "893px",
        height: "384px",
        top: "268px",
        left: "390px",
      }}
    >
      {/* Current Plan Header */}
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Current Plan</h2>

      {/* Plan Details Card */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-medium text-gray-900">
            {currentPlan?.name || "Pro Plan"}
          </h3>
          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-900">
              {currentPlan?.currency || "$"}
              {currentPlan?.price || "99"}
            </div>
            <div className="text-sm text-gray-500">
              {currentPlan?.billing || "per month"}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {currentPlan?.description ||
            "Advanced restaurant management features"}
        </p>
      </div>

      {/* Billing Information */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Next Billing Date:
          </span>
          <span className="text-sm text-gray-900">
            {billingInfo?.nextBillingDate || "April 15, 2024"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Payment Method:
          </span>
          <span className="text-sm text-gray-900">
            {billingInfo?.paymentMethod || "•••• •••• •••• 4242"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Billing Email:
          </span>
          <span className="text-sm text-gray-900">
            {billingInfo?.billingEmail || "billing@mariosbistro.com"}
          </span>
        </div>
      </div>

      {/* Change Plan Button */}
      <button
        onClick={handleChangePlan}
        disabled={changingPlan}
        className="w-full bg-red-400 hover:bg-red-500 text-white py-3 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {changingPlan ? "Changing Plan..." : "Change Plan"}
      </button>
    </div>
  );
};

export default BillingSettings;
