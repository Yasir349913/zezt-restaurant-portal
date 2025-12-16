// src/assets/Components/Revenue/RecentInvoices.jsx
import React, { useEffect, useState } from "react";
import InvoiceItem from "./InvoiceItem";
import { getInvoices } from "../../../api/services/Revenueservices";
import { useRestaurant } from "../../../context/RestaurantContext";
import Loader from "../Common/Loader";

const RecentInvoices = () => {
  const { restaurantId } = useRestaurant();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      setLoading(true);

      // Check localStorage fallback
      const fallbackId =
        typeof window !== "undefined"
          ? localStorage.getItem("restaurantId")
          : null;
      const idToUse = restaurantId || fallbackId;

      try {
        if (!idToUse) {
          // No restaurant - set empty array
          setInvoices([]);
          return;
        }

        const data = await getInvoices(idToUse);
        const d = data?.data;

        if (d) {
          const payments = d.subscriptionPayments?.payments || [];
          const commissions = d.commissions?.history || [];

          const mapPayment = (item, index) => ({
            id: item.transactionId || `payment-${index}`,
            invoiceNumber: item.transactionId || `INV-${index + 1}`,
            issuedDate: item.date || "",
            amount: item.amount || 0,
            dueDate: item.date || "",
            status: item.status || "Paid",
          });

          const mapCommission = (item, index) => ({
            id: item.invoiceId || `comm-${index}`,
            invoiceNumber: item.invoiceId || `COMM-${index + 1}`,
            issuedDate: item.month || "",
            amount: item.commissionAmount || 0,
            dueDate: item.paidAt || "",
            status: item.status || "Paid",
          });

          const allInvoices = [
            ...payments.map(mapPayment),
            ...commissions.map(mapCommission),
          ];

          // ✅ Sort by date (newest first)
          allInvoices.sort((a, b) => {
            const dateA = new Date(a.issuedDate || 0);
            const dateB = new Date(b.issuedDate || 0);
            return dateB - dateA;
          });

          setInvoices(allInvoices);
        } else {
          setInvoices([]);
        }
      } catch (error) {
        console.error("Error loading invoices:", error);
        // On error, show empty array (graceful fallback)
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [restaurantId]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-black font-medium text-lg mb-2">
            Recent Invoices
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="md" text="Loading invoices..." />
          </div>
        ) : invoices.length > 0 ? (
          <div className="space-y-4">
            {invoices.map((item) => (
              <InvoiceItem
                key={item.id}
                invoiceNumber={item.invoiceNumber}
                issuedDate={item.issuedDate}
                amount={item.amount}
                dueDate={item.dueDate}
                status={item.status}
              />
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
              No invoices found
            </p>
            <p className="text-xs text-gray-400">
              Invoices will appear here once you have transactions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentInvoices;
