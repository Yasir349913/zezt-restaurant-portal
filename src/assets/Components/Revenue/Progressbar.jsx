// src/assets/Components/Revenue/Progressbar.jsx
import React, { useState, useEffect } from "react";
import { getBillingInfo } from "../../../api/services/Revenueservices";
import { useRestaurant } from "../../../context/RestaurantContext";

const UsageProgressBar = ({ label, percentage, color = "#EF4444" }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm text-gray-500 font-normal">{label}</span>
      <span className="text-sm font-medium text-gray-800">{percentage}%</span>
    </div>
    <div className="w-full h-2 rounded-full bg-gray-200">
      <div
        className="h-2 rounded-full"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const Progressbar = () => {
  const { restaurantId } = useRestaurant();
  const [usageData, setUsageData] = useState([]);
  const [billingDetails, setBillingDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value) => {
    if (typeof value !== "number") return "-";
    return `Rs ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  useEffect(() => {
    if (!restaurantId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getBillingInfo(restaurantId);
        const d = data?.data;

        if (d && d.currentMonth) {
          const current = d.currentMonth;
          const paidSub = Number(current.paidSubscription || 0);
          const commissionPaid = Number(current.totalCommissionPaid || 0);
          const subscriptionFee = Number(current.subscriptionFee || 0);
          const total = paidSub + commissionPaid + subscriptionFee;

          // ✅ Only set if we have actual data
          if (total > 0) {
            setUsageData([
              {
                label: "Paid Subscription",
                percentage: Math.round((paidSub / total) * 100),
                color: "#EF4444",
              },
              {
                label: "Commission Paid",
                percentage: Math.round((commissionPaid / total) * 100),
                color: "#F59E0B",
              },
              {
                label: "Subscription Fee",
                percentage: Math.round((subscriptionFee / total) * 100),
                color: "#10B981",
              },
            ]);
          } else {
            setUsageData([]);
          }

          // ✅ Billing details from backend
          setBillingDetails([
            { label: "Plan", value: d.plan || "-" },
            { label: "Payment Status", value: d.paymentStatus || "-" },
            {
              label: "Last Payment Date",
              value: formatDate(d.lastPaymentDate),
            },
            { label: "Next Payment Due", value: formatDate(d.nextPaymentDue) },
            {
              label: "Outstanding Amount",
              value: formatCurrency(d.outstandingAmount),
            },
          ]);
        } else {
          // ✅ No fallback data
          setUsageData([]);
          setBillingDetails([]);
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
        setUsageData([]);
        setBillingDetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  if (!restaurantId) {
    return (
      <div className="text-center text-gray-500 py-8">
        Please select a restaurant to view billing information
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Usage This Month */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-black font-medium text-lg mb-6">
          Usage This Month
        </h2>
        {usageData.length > 0 ? (
          usageData.map((item, index) => (
            <UsageProgressBar
              key={index}
              label={item.label}
              percentage={item.percentage}
              color={item.color}
            />
          ))
        ) : (
          <div className="text-gray-500 text-center py-6">
            No usage data available
          </div>
        )}
      </div>

      {/* Billing Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-black font-medium text-lg mb-6">
          Billing Information
        </h2>
        {billingDetails.length > 0 ? (
          <div className="space-y-4">
            {billingDetails.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-800">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-6">
            No billing details available
          </div>
        )}
      </div>
    </div>
  );
};

export default Progressbar;
