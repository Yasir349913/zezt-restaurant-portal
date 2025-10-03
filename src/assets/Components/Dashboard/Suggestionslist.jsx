import React from "react";

const Suggestionlist = ({ title, description, subText }) => {
  return (
    <div
      className="p-4 rounded-lg"
      style={{
        border: "1px solid rgba(0, 0, 0, 0.1)",
        backgroundColor: "#FFFFFF",
      }}
    >
      <h3
        className="mb-2"
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
        className="mb-3"
        style={{
          fontFamily: "Inter",
          fontWeight: "400",
          fontSize: "12px",
          lineHeight: "22px",
          letterSpacing: "0%",
          color: "#6B7280",
        }}
      >
        {description}
      </p>
      <p
        className="inline-block px-2 py-1 rounded"
        style={{
          backgroundColor: "#F1F5F9",
          color: "#2A2828",
          fontFamily: "Work Sans",
          fontWeight: "400",
          fontSize: "12px",
          lineHeight: "100%",
          letterSpacing: "0%",
        }}
      >
        {subText}
      </p>
    </div>
  );
};

export default Suggestionlist;
