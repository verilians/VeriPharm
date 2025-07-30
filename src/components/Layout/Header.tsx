import React from "react";
import { useAuthStore } from "../../stores/authStore";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <span className="material-icons-outlined">menu</span>
          </button>

          {/* Page title */}
          <div className="flex-1 lg:flex-none">
            <h1 className="text-xl font-semibold text-gray-900">
              VeriPharm
            </h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <span className="material-icons-outlined">notifications</span>
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-medium text-sm">
                  {user?.role?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {user?.role}
                </p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 