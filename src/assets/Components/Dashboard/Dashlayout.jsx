import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Common/Header";
import Sidebar from "../Common/Sidebar";

const DashLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashLayout;
