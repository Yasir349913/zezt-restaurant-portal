// src/assets/Components/Revenue/RecentInvoices.jsx
import React, { useEffect, useState } from "react";
import InvoiceItem from "./InvoiceItem";
import { getInvoices } from "../../../api/services/Revenueservices";
import { useRestaurant } from "../../../context/RestaurantContext";

const RecentInvoices = () => {
  const { restaurantId } = useRestaurant();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;

    const loadInvoices = async () => {
      setLoading(true);
      try {
        const data = await getInvoices(restaurantId);
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
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [restaurantId]);

  if (!restaurantId) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-gray-500 text-center py-6">
          Please select a restaurant to view invoices
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-black font-medium text-lg mb-2">
            Recent Invoices
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 rounded-lg p-4 h-20"
              ></div>
            ))}
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
          <div className="text-gray-500 text-center py-6">
            No invoices found
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentInvoices;
