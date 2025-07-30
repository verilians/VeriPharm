import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { getNavigationItems } from "../../routes/navigation.config";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getNavigationItemsForUser = () => {
    if (!user) return [];
    return getNavigationItems(user.role);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const renderNavigationItem = (item: any, level = 0) => {
    const isActive = isActiveRoute(item.path);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.path}>
        <Link
          to={item.path}
          className={`
            flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${level === 0 ? "mx-2 mb-1" : "ml-8 mr-2 mb-1"}
            ${isActive
              ? "bg-indigo-100 text-indigo-700 border-r-2 border-indigo-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }
          `}
          onClick={() => {
            if (!hasChildren) {
              onClose();
            }
          }}
        >
          <span className="material-icons-outlined text-lg mr-3">
            {item.icon}
          </span>
          <span className="flex-1">{item.title}</span>
          {hasChildren && (
            <span className="material-icons-outlined text-sm">
              {isActive ? "expand_less" : "expand_more"}
            </span>
          )}
        </Link>
        
        {hasChildren && isActive && (
          <div className="mt-1">
            {item.children.map((child: any) => (
              <Link
                key={child.path}
                to={child.path}
                className={`
                  flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ml-8 mr-2 mb-1
                  ${isActiveRoute(child.path)
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }
                `}
                onClick={onClose}
              >
                <span className="material-icons-outlined text-sm mr-3">
                  {child.icon}
                </span>
                <span className="flex-1">{child.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  const navigationItems = getNavigationItemsForUser();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">VeriPharm</h1>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role} Dashboard
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="material-icons-outlined">close</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map(renderNavigationItem)}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">
                    {user?.role?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {user?.role}
                  </p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                title="Logout"
              >
                <span className="material-icons-outlined">logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 