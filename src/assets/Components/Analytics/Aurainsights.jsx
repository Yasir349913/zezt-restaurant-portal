import React from "react";
import Analyticscards from "../Analytics/Analyticscards";
import Insights from "./Insights";

export default function Aurainsights() {
  return (
    <div className="xl:ml-64 pt-14">
      <div className="p-6 space-y-6">
        {/* Header - Single Title */}

        {/* Analytics Cards */}
        <Analyticscards />

        {/* Analytics Graph */}
        <Insights></Insights>

        {/* Analytics Suggestions */}
      </div>
    </div>
  );
}
