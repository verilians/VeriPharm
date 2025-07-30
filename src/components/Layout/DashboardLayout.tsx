import React from 'react';
import { Outlet } from 'react-router-dom';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col h-full">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 