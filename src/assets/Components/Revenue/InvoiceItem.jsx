// src/assets/Components/Revenue/InvoiceItem.jsx
import React from "react";

const InvoiceItem = ({
  invoiceNumber,
  issuedDate,
  amount,
  dueDate,
  status,
}) => {
  // Simple color tag for status
  const statusColors = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-4 border border-gray-200">
      <div>
        <h3 className="font-medium text-gray-900">Invoice #{invoiceNumber}</h3>
        <p className="text-sm text-gray-500">
          Issued: {issuedDate ? new Date(issuedDate).toLocaleDateString() : "—"}
        </p>
        <p className="text-sm text-gray-500">
          Due: {dueDate ? new Date(dueDate).toLocaleDateString() : "—"}
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold text-gray-900">
          ${amount ? amount.toFixed(2) : "0.00"}
        </p>
        <span
          className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
            statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-600"
          }`}
        >
          {status || "Unknown"}
        </span>
      </div>
    </div>
  );
};

export default InvoiceItem;
