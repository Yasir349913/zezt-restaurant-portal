// src/assets/Components/Settings/Dashboard/Revenuecards.jsx
import React, { useEffect, useState } from "react";
import Cards from "./Cards";
import { useRestaurant } from "../../../context/RestaurantContext";
import { getDashboardData } from "../../../api/Dashbord";
import Loader from "../Common/Loader";

const Revenuecards = () => {
  const { restaurantId } = useRestaurant();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([
    {
      name: "Current Month Revenue",
      number: "£ 0",
      percentage: 0,
    },
    {
      name: "Active Deals",
      number: "0",
      percentage: 0,
    },
    {
      name: "Bookings Today",
      number: "0",
      percentage: 0,
    },
    {
      name: "Avg Rating",
      number: "0.0",
      percentage: 0,
    },
  ]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

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
          // No restaurant - show default zero values
          if (mounted) {
            setCards([
              {
                name: "Current Month Revenue",
                number: "£ 0",
                percentage: 0,
              },
              {
                name: "Active Deals",
                number: "0",
                percentage: 0,
              },
              {
                name: "Bookings Today",
                number: "0",
                percentage: 0,
              },
              {
                name: "Avg Rating",
                number: "0.0",
                percentage: 0,
              },
            ]);
          }
          return;
        }

        const dash = await getDashboardData(idToUse);

        if (!mounted) return;

        setCards([
          {
            name: "Current Month Revenue",
            number: `£ ${Number(dash.totalRevenue || 0).toLocaleString()}`,
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
        // Even on error, show zero values instead of error message
        if (mounted) {
          setCards([
            {
              name: "Current Month Revenue",
              number: "£ 0",
              percentage: 0,
            },
            {
              name: "Active Deals",
              number: "0",
              percentage: 0,
            },
            {
              name: "Bookings Today",
              number: "0",
              percentage: 0,
            },
            {
              name: "Avg Rating",
              number: "0.0",
              percentage: 0,
            },
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="md" text="Loading dashboard data..." />
      </div>
    );
  }

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
