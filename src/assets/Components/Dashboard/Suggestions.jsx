import React from "react";
import Suggestionlist from "./Suggestionslist";

const Suggestions = () => {
  const suggestions = [
    {
      id: 1,
      title: "Tuesday Lunch Boost",
      description: "25% off Lunch specials on Tuesdays (11 AM - 3 PM)",
      subText: "Predicted 40% increase in bookings",
    },
    {
      id: 2,
      title: "Weekend Brunch Extension",
      description: "Extend brunch hours until 4 PM on weekends",
      subText: "Based on high demand patterns",
    },
  ];

  return (
    <div className="bg-white rounded-lg  p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-black font-medium text-lg mb-2">
          AURA AI Suggestions
        </h2>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <Suggestionlist
            key={suggestion.id}
            title={suggestion.title}
            description={suggestion.description}
            subText={suggestion.subText}
          />
        ))}
      </div>
    </div>
  );
};

export default Suggestions;
