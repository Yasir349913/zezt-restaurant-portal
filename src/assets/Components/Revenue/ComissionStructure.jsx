// src/assets/Components/Revenue/CommissionStructure.jsx
import React, { useEffect, useState } from "react";
import CommissionItem from "./CommissionItem";
import { getBillingInfo } from "../../../api/services/Revenueservices";
import { useRestaurant } from "../../../context/RestaurantContext";

const CommissionStructure = () => {
  const { restaurantId } = useRestaurant();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getBillingInfo(restaurantId);
        const history = data?.data?.recentCommissionHistory || [];

        if (history.length > 0) {
          const commissionItems = history.map((h, i) => ({
            id: h.id || `comm-${i}`,
            title: h.title || h.name || `Commission ${i + 1}`,
            description: h.description || h.note || "",
            value: h.value || h.rate || "",
            valueType: h.valueType || h.type || "",
          }));
          setItems(commissionItems);
        } else {
          // Fallback data
          setItems([
            {
              id: "c1",
              title: "Base Commission",
              description: "Standard commission per booking",
              value: "10%",
              valueType: "of booking value",
            },
            {
              id: "c2",
              title: "Peak Hour Surcharge",
              description: "Additional commission during peak hours",
              value: "2%",
              valueType: "additional",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching commission structure:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [restaurantId]);

  if (!restaurantId) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-gray-500 text-center py-6">
          Please select a restaurant to view commission structure
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-black font-medium text-lg mb-2">
            Commission Structure
          </h2>
        </div>

        {loading ? (
          <div className="text-gray-500 text-center py-6">Loading...</div>
        ) : items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => (
              <CommissionItem
                key={item.id}
                title={item.title}
                description={item.description}
                value={item.value}
                valueType={item.valueType}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-6">
            No commission details available
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionStructure;
