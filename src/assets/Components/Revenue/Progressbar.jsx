// src/assets/Components/Revenue/Progressbar.jsx
import React, { useState, useEffect } from "react";
import { getBillingInfo } from "../../../api/services/Revenueservices";
import { useRestaurant } from "../../../context/RestaurantContext";
import Loader from "../Dashboard/Loader";

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
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value) => {
    if (typeof value !== "number") return "Rs 0.00";
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
    const fetchData = async () => {
      setLoading(true);

      // Check localStorage fallback
      const fallbackId =
        typeof window !== "undefined"
          ? localStorage.getItem("restaurantId")
          : null;
      const idToUse = restaurantId || fallbackId;

      try {
        if (!idToUse) {
          // No restaurant - set empty data
          setUsageData([]);
          setBillingDetails([]);
          return;
        }

        const data = await getBillingInfo(idToUse);
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
          setUsageData([]);
          setBillingDetails([]);
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
        // On error, show empty data (graceful fallback)
        setUsageData([]);
        setBillingDetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center h-64">
          <Loader size="md" text="Loading usage data..." />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center h-64">
          <Loader size="md" text="Loading billing info..." />
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
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm text-gray-500 font-medium mb-1">
              No usage data available
            </p>
            <p className="text-xs text-gray-400">
              Data will appear once you have billing activity
            </p>
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
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm text-gray-500 font-medium mb-1">
              No billing details available
            </p>
            <p className="text-xs text-gray-400">
              Billing information will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progressbar;
