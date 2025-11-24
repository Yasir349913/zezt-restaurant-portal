import React from "react";
import WelcomeMessage from "../Dashboard/Welcomemessage";
import Revenuecards from "../Dashboard/Revenuecards";
//import Suggestions from "../Dashboard/Suggestions";
import Revenuegraphs from "../Dashboard/Revenuegraphs";

export default function Dashboardlayout() {
  return (
    <div className="bg-gray-100 min-h-screen xl:ml-64 pt-14">
      {" "}
      {/* ✅ Background added here */}
      <div className="p-6 space-y-6 w-full overflow-x-hidden">
        {/* Welcome Message */}
        <WelcomeMessage />

        {/* Revenue Cards */}
        <Revenuecards />

        {/* Revenue Graphs */}
        <Revenuegraphs />

        {/* AI Suggestions */}
        {/* <Suggestions />*/}
      </div>
    </div>
  );
}
