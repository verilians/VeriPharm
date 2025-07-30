import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Navigation/Sidebar";
import Header from "./Header";

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Don't show layout for auth pages
  const isAuthPage = location.pathname === "/login" || 
                     location.pathname === "/subscription-expired" || 
                     location.pathname === "/unauthorized";

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout; 