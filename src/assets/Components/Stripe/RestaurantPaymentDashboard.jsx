import React, { useState, useEffect } from "react";
import { useRestaurant } from "../../../context/RestaurantContext";
import StripeService from "../../../api/services/Stripeservices";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  FileText,
  RefreshCw,
} from "lucide-react";

// =============== MAIN DASHBOARD ===============
const RestaurantPaymentDashboard = () => {
  const { restaurantId } = useRestaurant();
  const [restaurantData, setRestaurantData] = useState(null);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData();
      checkStripeStatus();
    }
  }, [restaurantId]);

  // ✅ Fetch restaurant data and check subscription
  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const data = await StripeService.getRestaurantData();
      const restaurant = data.data || data;

      console.log("🔍 Restaurant Data:", restaurant);
      console.log("🔍 Subscription ID:", restaurant.stripeSubscriptionId);
      console.log("🔍 Payment Status:", restaurant.paymentStatus);

      setRestaurantData(restaurant);

      // ✅ Check multiple conditions for active subscription
      const hasSubscription = !!(
        restaurant.stripeSubscriptionId ||
        restaurant.paymentStatus === "active" ||
        restaurant.paymentStatus === "current"
      );

      console.log("✅ Has Active Subscription:", hasSubscription);
      setHasActiveSubscription(hasSubscription);
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
      setError(error.message);
      // Fallback mock data
      setRestaurantData({
        name: "Sample Restaurant",
        plan: "trial",
        paymentStatus: "trial",
        stripeConnectedAccountId: null,
        stripeAccountActive: false,
        adminStatus: "active",
        commissionRate: 10,
        monthlyRevenue: 150000,
        totalBookings: 47,
        stripeSubscriptionId: null,
        nextPaymentDue: null,
      });
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Check Stripe status
  const checkStripeStatus = async () => {
    try {
      const data = await StripeService.checkStatus();
      setStripeStatus(data);
    } catch (error) {
      console.error("Error checking Stripe status:", error);
      setStripeStatus({
        connected: false,
        accountActive: false,
        requiresAction: true,
      });
    }
  };

  // ✅ Stripe onboarding
  const handleStripeOnboarding = async () => {
    try {
      setLoading(true);
      const data = await StripeService.initiateOnboarding();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create onboarding link");
        setLoading(false);
      }
    } catch (error) {
      console.error("Stripe onboarding error:", error);
      alert(error.message || "Error starting Stripe onboarding");
      setLoading(false);
    }
  };

  // ✅ Create subscription
  const handleCreateSubscription = async () => {
    try {
      setLoading(true);
      const data = await StripeService.createSubscription();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create subscription");
        setLoading(false);
      }
    } catch (error) {
      console.error("Subscription creation error:", error);
      alert(error.message || "Error creating subscription");
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "current":
        return "text-green-600";
      case "trial":
        return "text-blue-600";
      case "overdue":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 text-center mb-2">
            Restaurant ID Not Found
          </h3>
          <p className="text-sm text-red-700 text-center">
            Please log in again to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ✅ Stripe Account Setup Alert - Only if Stripe NOT connected */}
      {!stripeStatus?.accountActive && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Payment Account Setup Required
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Complete your Stripe account setup to start receiving payments
                from customers.
              </p>
              <button
                onClick={handleStripeOnboarding}
                className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Connect Stripe Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Subscription Alert - Only if Stripe connected BUT no subscription */}
      {stripeStatus?.accountActive && !hasActiveSubscription && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex items-start">
            <CreditCard className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                Activate Your Subscription
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Your Stripe account is connected! Now activate your subscription
                to start using the platform.
              </p>
              <button
                onClick={handleCreateSubscription}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Activate Subscription (£100)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Active Subscription Confirmation */}
      {hasActiveSubscription && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Subscription Active
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Your subscription is active and you're ready to accept bookings!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {["overview", "subscription", "payments"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-6 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Current Plan
                      </p>
                      <p className="text-2xl font-semibold capitalize">
                        {restaurantData.plan}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Payment Status
                      </p>
                      <p
                        className={`text-2xl font-semibold capitalize ${getStatusColor(
                          restaurantData.paymentStatus
                        )}`}
                      >
                        {restaurantData.paymentStatus}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Stripe Account
                      </p>
                      <p className="text-lg font-semibold">
                        {stripeStatus?.accountActive ? (
                          <span className="text-green-600 flex items-center text-base">
                            <CheckCircle className="h-5 w-5 mr-1" /> Active
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center text-base">
                            <AlertCircle className="h-5 w-5 mr-1" /> Inactive
                          </span>
                        )}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Monthly Summary */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  This Month's Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-xl font-semibold">
                      {restaurantData.totalBookings || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-xl font-semibold">
                      £ {(restaurantData.monthlyRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Commission ({restaurantData.commissionRate}%)
                    </p>
                    <p className="text-xl font-semibold">
                      £{" "}
                      {(
                        (restaurantData.monthlyRevenue || 0) * 0.1
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Earnings</p>
                    <p className="text-xl font-semibold">
                      £{" "}
                      {(
                        (restaurantData.monthlyRevenue || 0) * 0.9
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === "subscription" && (
            <div className="space-y-6">
              {/* Current Subscription Status */}
              <div
                className={`${
                  hasActiveSubscription ? "bg-green-50" : "bg-gray-50"
                } p-6 rounded-lg`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Standard Plan
                    </h3>
                    <p className="text-3xl font-bold">
                      £100
                      <span className="text-lg font-normal text-gray-600">
                        /month
                      </span>
                    </p>

                    {/* ✅ Show Active Subscription Status */}
                    {hasActiveSubscription ? (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-green-700">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span className="font-medium">
                            Active Subscription
                          </span>
                        </div>
                        {restaurantData.nextPaymentDue && (
                          <p className="text-sm text-gray-600">
                            Next payment:{" "}
                            {new Date(
                              restaurantData.nextPaymentDue
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      /* ✅ Show Activate Button Only if No Subscription */
                      <div className="mt-4">
                        <p className="text-gray-600 mb-3">
                          Start accepting bookings with our standard plan
                        </p>
                        {stripeStatus?.accountActive ? (
                          <button
                            onClick={handleCreateSubscription}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Activate Subscription
                          </button>
                        ) : (
                          <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                            ⚠️ Connect your Stripe account first to activate
                            subscription
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <CreditCard className="h-12 w-12 text-gray-400" />
                </div>
              </div>

              {/* Plan Features */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  What's Included
                </h3>
                <ul className="space-y-3">
                  {[
                    "Unlimited deal listings",
                    "Booking management system",
                    "Customer notifications",
                    "QR code generation",
                    "Analytics dashboard",
                    "Payment processing via Stripe",
                    "Email support",
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Commission Info */}
              {/* <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Additional Charges
                </h4>
                <p className="text-sm text-blue-700">
                  Platform commission: {restaurantData.commissionRate}% per
                  booking (automatically deducted from customer payments)
                </p>
              </div> */}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Payment History</h3>
                <button
                  onClick={fetchRestaurantData}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </button>
              </div>

              {restaurantData.paymentHistory &&
              restaurantData.paymentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {restaurantData.paymentHistory.map((payment, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {payment.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            £ {payment.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No payment history yet</p>
                  <p className="text-sm mt-1">
                    Payments will appear here once your subscription is active
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantPaymentDashboard;
