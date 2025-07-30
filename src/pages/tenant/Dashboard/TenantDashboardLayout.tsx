import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Layers,
  Users,
  BarChart2,
  ShoppingCart,
  TrendingUp,
  Box,
  DollarSign,
} from "lucide-react";

// Inline SVG icons for nav links (Heroicons outline style)
const icons = {
  Dashboard: <Home style={{ marginRight: "5px" }} className="w-5 h-5" />,
  Branches: <Layers style={{ marginRight: "5px" }} className="w-5 h-5" />,
  Users: <Users style={{ marginRight: "5px" }} className="w-5 h-5" />,
  Reports: <BarChart2 style={{ marginRight: "5px" }} className="w-5 h-5" />,
  "Purchases Summary": (
    <ShoppingCart style={{ marginRight: "5px" }} className="w-5 h-5" />
  ),
  Sales: <TrendingUp style={{ marginRight: "5px" }} className="w-5 h-5" />,
  Stock: <Box style={{ marginRight: "5px" }} className="w-5 h-5" />,
  Finance: <DollarSign style={{ marginRight: "5px" }} className="w-5 h-5" />,
};

const navLinks = [
  { name: "Dashboard", href: "/tenant/dashboard" },
  { name: "Branches", href: "/tenant/branches" },
  { name: "Users", href: "/tenant/users" },
  { name: "Reports", href: "/tenant/reports" },
  { name: "Purchases Summary", href: "/tenant/purchases-summary" },
  { name: "Sales", href: "/tenant/sales" },
  { name: "Stock", href: "/tenant/stock" },
  { name: "Finance", href: "/tenant/finance" }, // Placeholder route
];

const TenantDashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={
          `fixed top-0 left-0 z-50 transition-transform duration-300 w-64 bg-white/95 border-r border-gray-200 flex-col shadow-2xl xl:shadow-none backdrop-blur-xl h-screen overflow-hidden ` +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full") +
          " xl:translate-x-0 xl:flex"
        }
      >
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center shadow-md">
              <span className="text-xl font-bold text-blue-700">VP</span>
            </div>
            <span className="ml-2 text-lg font-bold text-blue-700 hidden xl:inline tracking-wide">
              VeriPharm
            </span>
          </div>
          <button
            className="xl:hidden p-2"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg
              className="w-6 h-6 text-blue-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-1 mt-6 px-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition group text-base
                ${location.pathname.startsWith(link.href) ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-md" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"}
                duration-200`}
              onClick={() => setSidebarOpen(false)}
            >
              {icons[link.name as keyof typeof icons]}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main Area */}
      <div className="flex-1 flex flex-col xl:ml-64 min-h-screen main-content-area">
        {/* Top Navbar */}
        <header className="w-full bg-white/95 border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-30 backdrop-blur-xl">
          {/* Sidebar toggle for mobile */}
          <button
            className="xl:hidden p-2 mr-2"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg
              className="w-7 h-7 text-blue-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="text-lg font-semibold text-blue-700 tracking-wide">
            Tenant Dashboard
          </div>
          <div className="flex items-center gap-3 relative">
            {/* User avatar with dropdown placeholder */}
            <button
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-blue-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              aria-label="User menu"
            >
              <span>O</span>
            </button>
            {/* Dropdown placeholder (future) */}
          </div>
        </header>
        {/* Content Area */}
        <main className="flex-1 p-[1em_!important] md:p-8 bg-gradient-to-br from-blue-50 to-blue-100 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default TenantDashboardLayout;
