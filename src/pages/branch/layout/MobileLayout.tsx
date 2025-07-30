import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiShoppingCart,
  FiPackage,
  FiUsers,
  FiBarChart,
  FiSettings,

  FiUser,
  FiX,
  FiMenu,
  FiShield,
  FiRotateCcw,
  FiLogOut,
  FiTruck,
  FiClipboard,
} from "react-icons/fi";
// import Header from "./Header"; // TODO: Create Header component
import { useAuthStore } from "../../../stores/authStore";

interface PageInfo {
  title: string;
  subtitle?: string;
}

const MobileLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Update active tab based on current route
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === "/branch" || pathname === "/branch/dashboard")
      setActiveTab("dashboard");
    else if (pathname.startsWith("/branch/sales/pos")) setActiveTab("pos");
    else if (pathname.startsWith("/branch/stock")) setActiveTab("inventory");
    else if (pathname.startsWith("/branch/customers")) setActiveTab("customers");
    else if (pathname.startsWith("/branch/reports")) setActiveTab("reports");
    else setActiveTab("more");
  }, [location.pathname]);

  // Get page title and subtitle based on current route
  const getPageInfo = (pathname: string): PageInfo => {
    const titleMap: { [key: string]: PageInfo } = {
      "/branch": { title: "Dashboard", subtitle: "Welcome to your pharmacy" },
      "/branch/dashboard": {
        title: "Dashboard",
        subtitle: "Welcome to your pharmacy",
      },
      "/branch/sales/pos": { title: "Point of Sale", subtitle: "Process sales quickly" },
      "/branch/stock/inventory": { title: "Inventory", subtitle: "Manage your products" },
      "/branch/stock/add-product": { title: "Add Product", subtitle: "Add new product" },
      "/branch/customers": {
        title: "Customers",
        subtitle: "Manage customer relationships",
      },
      "/branch/customers/add": { title: "Add Customer", subtitle: "Add new customer" },
      "/branch/reports": { title: "Reports", subtitle: "Business insights" },
      "/branch/settings": { title: "Settings", subtitle: "App preferences" },
      "/branch/purchases": { title: "Purchases", subtitle: "Manage orders" },
      "/branch/sales/history": { title: "Sales", subtitle: "Transaction history" },
      "/branch/sales/refunds": { title: "Refunds", subtitle: "Process refunds" },
      "/branch/notifications": { title: "Notifications", subtitle: "System alerts" },
      "/branch/admin": { title: "Admin Panel", subtitle: "System administration" },
      "/branch/suppliers": { title: "Suppliers", subtitle: "Manage suppliers" },
      "/branch/suppliers/add": { title: "Add Supplier", subtitle: "Add new supplier" },
      "/branch/audits/stock-audit": { title: "Stock Audit", subtitle: "Audit inventory" },
    };

    // Handle dynamic routes
    if (pathname.includes("/branch/stock/edit-product/"))
      return { title: "Edit Product", subtitle: "Update product details" };
    if (pathname.includes("/branch/stock/view-product/"))
      return { title: "Product Details", subtitle: "View product information" };
    if (pathname.includes("/branch/customers/edit/"))
      return { title: "Edit Customer", subtitle: "Update customer details" };
    if (pathname.includes("/branch/customers/view/"))
      return {
        title: "Customer Details",
        subtitle: "View customer information",
      };
    if (pathname.includes("/branch/suppliers/edit/"))
      return { title: "Edit Supplier", subtitle: "Update supplier details" };
    if (pathname.includes("/branch/suppliers/view/"))
      return {
        title: "Supplier Details",
        subtitle: "View supplier information",
      };

    return titleMap[pathname] || { title: "Elith Pharmacy", subtitle: undefined };
  };

  const pageInfo = getPageInfo(location.pathname);

  const bottomNavItems = [
    { id: "dashboard", label: "Home", icon: FiHome, path: "/branch" },
    { id: "pos", label: "POS", icon: FiShoppingCart, path: "/branch/sales/pos" },
    { id: "inventory", label: "Products", icon: FiPackage, path: "/branch/stock/inventory" },
    { id: "customers", label: "Customers", icon: FiUsers, path: "/branch/customers" },
    { id: "reports", label: "Reports", icon: FiBarChart, path: "/branch/reports" },
  ];

  const handleTabPress = (item: { id: string; path: string }) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setShowMobileMenu(false);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile Header */}
      {/* TODO: Create Header component
      <Header
        isMobile={true}
        title={pageInfo.title}
        subtitle={pageInfo.subtitle}
        onToggleMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
        mobileMenuOpen={showMobileMenu}
      />
      */}

      {/* Mobile Side Menu Overlay */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Side Menu */}
          <div className="fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header Section */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      E
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Elith Pharmacy</h2>
                      <p className="text-sm text-gray-600">Management System</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <FiX className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-6">
                <div className="space-y-2">
                  {[
                    { icon: FiHome, label: "Dashboard", path: "/branch" },
                    { icon: FiShoppingCart, label: "Point of Sale", path: "/branch/sales/pos" },
                    { icon: FiPackage, label: "Inventory", path: "/branch/stock/inventory" },
                    { icon: FiUsers, label: "Customers", path: "/branch/customers" },
                    { icon: FiTruck, label: "Purchases", path: "/branch/purchases" },
                    { icon: FiBarChart, label: "Sales History", path: "/branch/sales/history" },
                    { icon: FiUsers, label: "Suppliers", path: "/branch/suppliers" },
                    { icon: FiClipboard, label: "Stock Audit", path: "/branch/audits/stock-audit" },
                    { icon: FiRotateCcw, label: "Refunds", path: "/branch/sales/refunds" },
                    { icon: FiBarChart, label: "Reports", path: "/branch/reports" },
                    ...(user?.role === 'owner' ? [{ icon: FiShield, label: "Admin Panel", path: "/branch/admin" }] : []),
                    { icon: FiSettings, label: "Settings", path: "/branch/settings" },
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        navigate(item.path);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                        location.pathname.startsWith(item.path)
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </nav>

              {/* Footer Section */}
              <div className="p-6 border-t border-gray-200">
                {user && (
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-full">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabPress(item)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
                activeTab === item.id
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileLayout; 