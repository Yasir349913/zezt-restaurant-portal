import React from "react";

const CommissionItem = ({ title, description, value, valueType }) => {
  return (
    <div
      className="p-4 rounded-lg flex justify-between items-center"
      style={{
        border: "1px solid rgba(0, 0, 0, 0.1)",
        backgroundColor: "#FFFFFF",
      }}
    >
      <div className="flex-1">
        <h3
          className="mb-1"
          style={{
            fontFamily: "Inter",
            fontWeight: "500",
            fontSize: "14px",
            lineHeight: "16px",
            letterSpacing: "0%",
            color: "#2E2E2E",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "Inter",
            fontWeight: "400",
            fontSize: "12px",
            lineHeight: "14px",
            letterSpacing: "0%",
            color: "#6B7280",
          }}
        >
          {description}
        </p>
      </div>

      <div className="text-right">
        <div
          style={{
            fontFamily: "Inter",
            fontWeight: "500",
            fontSize: "14px",
            lineHeight: "16px",
            color: "#2E2E2E",
          }}
        >
          {value}
        </div>
        {valueType && (
          <div
            style={{
              fontFamily: "Inter",
              fontWeight: "400",
              fontSize: "11px",
              lineHeight: "13px",
              color: "#6B7280",
              marginTop: "2px",
            }}
          >
            {valueType}
          </div>
        )}
      </div>
    </div>
  );
};
export default CommissionItem;
