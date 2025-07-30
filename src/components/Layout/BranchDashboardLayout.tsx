import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FiHome,
  FiPackage,
  FiTruck,
  FiBarChart,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiBell,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiFilter,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiStar,
  FiMoreHorizontal,
  FiChevronUp,
  FiChevronDown,
  FiTarget,
  FiAward,
  FiLock,
  FiUnlock,
  FiEyeOff,
  FiRefreshCw,
  FiCreditCard,
  FiClock,
  FiCheck,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiExternalLink,
  FiList,
  FiFileText,
  FiShoppingCart,
  FiShield,
  FiClipboard,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiEye,
  FiUsers,
} from 'react-icons/fi';
import { useAuthStore } from "../../stores/authStore";
import "../../styles/sidebar.css";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  adminOnly?: boolean;
  children?: NavItem[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

interface PageInfo {
  title: string;
  subtitle?: string;
}

interface BranchDashboardLayoutProps {
  children?: React.ReactNode;
}

const BranchDashboardLayout: React.FC<BranchDashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock notifications - in real app, this would come from a store
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Low Stock Alert',
      message: 'Product "Aspirin 500mg" is running low on stock',
      type: 'warning',
      is_read: false,
      created_at: new Date().toISOString(),
      action_url: '/branch/stock/inventory'
    },
    {
      id: '2',
      title: 'Sale Completed',
      message: 'Sale #12345 has been completed successfully',
      type: 'success',
      is_read: true,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      action_url: '/branch/sales/history'
    },
    {
      id: '3',
      title: 'New Supplier Added',
      message: 'Supplier "MediCorp Ltd" has been added to the system',
      type: 'info',
      is_read: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      action_url: '/branch/suppliers'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Navigation items
  const navItems: NavItem[] = [
    { path: "/branch", label: "Dashboard", icon: FiHome },
    { 
      path: "/branch/stock", 
      label: "Inventory", 
      icon: FiPackage,
      children: [
        { path: "/branch/stock/inventory", label: "View Items", icon: FiList },
        { path: "/branch/stock/add-product", label: "Add Item", icon: FiPlus },
        { path: "/branch/stock/categories", label: "Item Groups", icon: FiPackage },
        { path: "/branch/stock/summary", label: "Summary", icon: FiBarChart },
      ]
    },
    { 
      path: "/branch/purchases", 
      label: "Purchase", 
      icon: FiTruck,
      children: [
        { path: "/branch/purchases", label: "Purchase Orders", icon: FiFileText },
        { path: "/branch/purchases/add", label: "Add Order", icon: FiPlus },
      ]
    },
    { path: "/branch/sales/pos", label: "Point of Sale", icon: FiShoppingCart },
    { path: "/branch/sales/history", label: "Sales", icon: FiDollarSign },
    { path: "/branch/customers", label: "Customers", icon: FiUser },
    { path: "/branch/suppliers", label: "Suppliers", icon: FiUsers },
    { path: "/branch/reports", label: "Reports", icon: FiBarChart },
    { path: "/branch/audits/stock-audit", label: "Stock Audit", icon: FiClipboard },
    // Admin Panel - only show for admin users
    ...(user?.role === 'owner' ? [{ path: "/branch/admin", label: "Admin Panel", icon: FiShield, adminOnly: true }] : []),
    { path: "/branch/settings", label: "Settings", icon: FiSettings },
  ];

  // Helper functions
  const isActive = (path: string): boolean => {
    if (path === "/branch") {
      return location.pathname === "/branch" || location.pathname === "/branch/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error logging out. Please try again.");
    }
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, is_read: true }
          : notification
      )
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
      setShowNotifications(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <FiAlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <FiInfo className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPageInfo = (pathname: string): PageInfo => {
    const titleMap: { [key: string]: PageInfo } = {
      "/branch": {
        title: "Dashboard",
        subtitle: "Welcome to your pharmacy dashboard",
      },
      "/branch/dashboard": {
        title: "Dashboard",
        subtitle: "Welcome to your pharmacy dashboard",
      },
      // Inventory and related pages
      "/branch/stock": {
        title: "Inventory",
        subtitle: "Manage your product inventory and stock levels",
      },
      "/branch/stock/inventory": {
        title: "View Items",
        subtitle: "Browse and manage your product inventory",
      },
      "/branch/stock/add-product": {
        title: "Add Item",
        subtitle: "Add new product to inventory",
      },
      "/branch/stock/categories": {
        title: "Item Groups",
        subtitle: "Manage product categories and groups",
      },
      "/branch/stock/summary": {
        title: "Summary",
        subtitle: "View inventory summary and statistics",
      },
      // Purchase and related pages
      "/branch/purchases": {
        title: "Purchase Orders",
        subtitle: "Manage inventory purchases and supplier orders",
      },
      "/branch/purchases/add": {
        title: "Add Order",
        subtitle: "Create new purchase order",
      },
      // Point of Sale (independent)
      "/branch/sales/pos": {
        title: "Point of Sale",
        subtitle: "Process sales and manage transactions",
      },
      // Sales (independent, formerly Sales History)
      "/branch/sales/history": {
        title: "Sales",
        subtitle: "View and manage sales transactions",
      },
      // Customers
      "/branch/customers": {
        title: "Customers",
        subtitle: "Manage customer information and relationships",
      },
      "/branch/customers/add": {
        title: "Add Customer",
        subtitle: "Add new customer to the system",
      },
      // Suppliers
      "/branch/suppliers": {
        title: "Suppliers",
        subtitle: "Manage suppliers and purchase orders",
      },
      "/branch/suppliers/add": {
        title: "Add Supplier",
        subtitle: "Add new supplier to the system",
      },
      // Reports
      "/branch/reports": {
        title: "Reports",
        subtitle: "View business insights and analytics",
      },
      // Stock Audit
      "/branch/audits/stock-audit": {
        title: "Stock Audit",
        subtitle: "Perform comprehensive inventory audits and track variances",
      },
      // Admin Panel
      "/branch/admin": {
        title: "Admin Panel",
        subtitle: "Manage users and system settings",
      },
      // Settings
      "/branch/settings": {
        title: "Settings",
        subtitle: "Manage your pharmacy settings and preferences",
      },
      // Additional pages
      "/branch/setup": {
        title: "Database Setup",
        subtitle: "Configure your database and ensure all required tables exist",
      },
      "/branch/notifications": {
        title: "Notifications",
        subtitle: "View and manage notifications",
      },
    };

    // Handle dynamic routes
    if (pathname.includes("/branch/stock/edit-product/"))
      return { title: "Edit Product", subtitle: "Update product information" };
    if (pathname.includes("/branch/stock/view-product/"))
      return {
        title: "Product Details",
        subtitle: "View product information and analytics",
      };
    if (pathname.includes("/branch/purchases/"))
      return {
        title: "Purchase Details",
        subtitle: "View purchase order details",
      };
    // Fix POS and Sales History routes
    if (pathname === "/branch/sales/pos")
      return { title: "Point of Sale", subtitle: "Process sales and manage transactions" };
    if (pathname === "/branch/sales/history")
      return { title: "Sales", subtitle: "View and manage sales transactions" };
    if (pathname.includes("/branch/sales/"))
      return { title: "Sale Details", subtitle: "View transaction details" };
    if (pathname.includes("/branch/customers/edit/"))
      return {
        title: "Edit Customer",
        subtitle: "Update customer information",
      };
    if (pathname.includes("/branch/customers/view/"))
      return {
        title: "Customer Details",
        subtitle: "View customer information and history",
      };
    if (pathname.includes("/branch/customers/") && pathname.includes("/sales"))
      return {
        title: "Customer Sales",
        subtitle: "View customer purchase history",
      };
    if (pathname.includes("/branch/suppliers/edit/"))
      return {
        title: "Edit Supplier",
        subtitle: "Update supplier information",
      };
    if (pathname.includes("/branch/suppliers/view/"))
      return {
        title: "Supplier Details",
        subtitle: "View supplier information and history",
      };
    if (pathname.includes("/branch/audits/stock-audit/edit/"))
      return {
        title: "Edit Stock Audit",
        subtitle: "Update audit details and quantities",
      };

    return titleMap[pathname] || { title: "Dashboard", subtitle: "Welcome to your pharmacy dashboard" };
  };

  // Effects
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const pageInfo = getPageInfo(location.pathname);

  const renderNavItem = (item: NavItem, index: number) => {
    const isExpanded = expandedItems.includes(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.path);

    return (
      <li key={index} className="mb-2">
        {hasChildren ? (
          <div>
            <button
              onClick={() => toggleExpanded(item.path)}
              className={`w-full group flex items-center justify-between rounded-lg text-sm font-medium transition-all duration-200 ${
                sidebarCollapsed && !isMobile ? "justify-center px-2 py-3" : "px-3 py-2.5"
              } ${
                isItemActive
                  ? "bg-emerald-100 text-emerald-700 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
              title={sidebarCollapsed && !isMobile ? item.label : undefined}
            >
              <div className="flex items-center">
                <item.icon className={`transition-all duration-200 ${
                  sidebarCollapsed && !isMobile ? "w-6 h-6" : "w-5 h-5 mr-3"
                } ${
                  isItemActive ? "text-emerald-600" : "text-gray-500 group-hover:text-gray-700"
                }`} />
                {(!sidebarCollapsed || isMobile) && (
                  <span className="transition-all duration-200">
                    {item.label}
                  </span>
                )}
              </div>
              {(!sidebarCollapsed || isMobile) && (
                <FiChevronDown 
                  className={`w-4 h-4 transition-all duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  } ${
                    isItemActive ? "text-emerald-600" : "text-gray-400"
                  }`} 
                />
              )}
            </button>
            
            {/* Children */}
            {(!sidebarCollapsed || isMobile) && isExpanded && (
              <ul className="mt-2 ml-4 space-y-1 border-l-2 border-gray-100">
                {item.children?.map((child, childIndex) => (
                  <li key={childIndex}>
                    <Link
                      to={child.path}
                      onClick={handleNavClick}
                      className={`block pl-4 pr-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                        isActive(child.path)
                          ? "bg-emerald-50 text-emerald-700 font-medium border-l-2 border-emerald-500 -ml-0.5"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <Link
            to={item.path}
            onClick={handleNavClick}
            className={`group flex items-center rounded-lg text-sm font-medium transition-all duration-200 ${
              sidebarCollapsed && !isMobile ? "justify-center px-2 py-3" : "px-3 py-2.5"
            } ${
              isItemActive
                ? "bg-emerald-100 text-emerald-700 shadow-sm"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
            title={sidebarCollapsed && !isMobile ? item.label : undefined}
          >
            <item.icon className={`transition-all duration-200 ${
              sidebarCollapsed && !isMobile ? "w-6 h-6" : "w-5 h-5 mr-3"
            } ${
              isItemActive ? "text-emerald-600" : "text-gray-500 group-hover:text-gray-700"
            }`} />
            {(!sidebarCollapsed || isMobile) && (
              <span className="transition-all duration-200">
                {item.label}
              </span>
            )}
          </Link>
        )}
      </li>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-sm border-r border-gray-200/80 flex-col shadow-xl h-screen overflow-hidden ${
          sidebarCollapsed && !isMobile ? "w-20" : "w-64"
        } ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:flex`}
      >
        {/* Logo and Toggle */}
        <div className={`flex items-center border-b border-gray-200/50 bg-gradient-to-r from-emerald-50/50 to-green-50/50 ${
          sidebarCollapsed && !isMobile ? "justify-center px-3 py-4" : "justify-between px-6 py-4"
        }`}>
          {sidebarCollapsed && !isMobile ? (
            /* Collapsed mode - only show toggle button */
            <button
              onClick={handleToggleSidebar}
              className="p-2 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
            >
              <FiMenu className="w-5 h-5 text-gray-600 hover:text-emerald-600 transition-colors" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg ring-2 ring-emerald-100">
                  <span className="text-lg font-bold text-white">VP</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">VeriPharm</span>
              </div>
              
              {/* Close button for mobile */}
              {isMobile && (
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-600" />
                </button>
              )}
              
              {/* Collapse toggle for desktop */}
              {!isMobile && (
                <button
                  onClick={handleToggleSidebar}
                  className="p-2 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                >
                  <FiMenu className="w-5 h-5 text-gray-600 hover:text-emerald-600 transition-colors" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item, index) => renderNavItem(item, index))}
          </ul>
        </nav>

        {/* User section */}
        <div className={`border-t border-gray-200/50 p-4 bg-gradient-to-r from-gray-50/50 to-emerald-50/30 ${
          sidebarCollapsed && !isMobile ? "p-3 flex justify-center" : ""
        }`}>
          <div className={`flex items-center ${sidebarCollapsed && !isMobile ? "justify-center" : "gap-3"}`}>
            <div className={`rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center ring-2 ring-emerald-100 shadow-md ${
              sidebarCollapsed && !isMobile ? "w-12 h-12" : "w-10 h-10"
            }`}>
              <span className={`font-bold text-white ${
                sidebarCollapsed && !isMobile ? "text-base" : "text-sm"
              }`}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {(!sidebarCollapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-emerald-600 capitalize font-medium">
                  {user?.role || 'Staff'}
                </p>
              </div>
            )}
          </div>
          
          {(!sidebarCollapsed || isMobile) && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 font-medium"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed && !isMobile ? "lg:ml-20" : "lg:ml-64"
      }`}>
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-50/50 to-white/95 backdrop-blur-sm border-b-2 border-emerald-100/80 px-6 py-6 flex items-center justify-between shadow-lg">
          {/* Left side - Mobile menu toggle and page info */}
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={handleToggleMobileMenu}
                className="p-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors lg:hidden"
              >
                <FiMenu className="w-6 h-6 text-gray-600" />
              </button>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-emerald-700 tracking-tight">{pageInfo.title}</h1>
              {pageInfo.subtitle && (
                <p className="text-sm text-emerald-600/80 mt-1 font-medium">{pageInfo.subtitle}</p>
              )}
            </div>
          </div>

          {/* Right side - Search, notifications, user menu */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Time */}
            <div className="hidden md:block text-sm text-gray-600">
              {time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiBell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))}
                          className="text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.is_read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(notification.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              {notification.action_url && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                                  <span>View details</span>
                                  <FiExternalLink className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <FiChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {/* Profile dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role || 'Staff'}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/branch/settings');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiSettings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
          {children || <Outlet />}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default BranchDashboardLayout;
