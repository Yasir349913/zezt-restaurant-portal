// src/assets/Components/Settings/Dashboard/Revenuecards.jsx
import React, { useEffect, useState } from "react";
import Cards from "./Cards";
import { useRestaurant } from "../../../context/RestaurantContext";
import { getDashboardData } from "../../../api/Dashbord";

const Revenuecards = () => {
  const { restaurantId } = useRestaurant();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      // fallback to localStorage if context is empty
      const fallbackId =
        typeof window !== "undefined"
          ? localStorage.getItem("restaurantId")
          : null;
      const idToUse = restaurantId || fallbackId;

      console.log("[Revenuecards] restaurantId (context):", restaurantId);
      console.log(
        "[Revenuecards] fallback localStorage restaurantId:",
        fallbackId
      );
      console.log("[Revenuecards] using id:", idToUse);

      try {
        if (!idToUse) {
          throw new Error("No restaurant selected");
        }

        const dash = await getDashboardData(idToUse);

        if (!mounted) return;

        setCards([
          {
            name: "Total Revenue",
            number: `Rs ${Number(dash.totalRevenue || 0).toLocaleString()}`,
            percentage: 0,
          },
          {
            name: "Active Deals",
            number: String(dash.activeDeals || 0),
            percentage: 0,
          },
          {
            name: "Bookings Today",
            number: String(dash.totalBookingsToday || 0),
            percentage: 0,
          },
          {
            name: "Avg Rating",
            number: (dash.avgRating ?? 0).toFixed(1),
            percentage: 0,
          },
        ]);
      } catch (e) {
        console.error("Revenuecards load error:", e);
        setError(
          e?.response?.data?.message || e?.message || "Failed to load dashboard"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (restaurantId || localStorage.getItem("restaurantId")) load();
    else {
      setLoading(false);
      setCards([]);
      setError("No restaurant selected. Create or select a restaurant first.");
    }

    return () => {
      mounted = false;
    };
  }, [restaurantId]);

  if (loading)
    return <div className="text-sm text-gray-500">Loading dashboard…</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[18px]">
      {cards.map((item, index) => (
        <Cards
          key={index}
          name={item.name}
          number={item.number}
          percentage={item.percentage}
        />
      ))}
    </div>
  );
};

export default Revenuecards;
