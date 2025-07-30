import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
// import MainLayout from "./MainLayout"; // TODO: Create MainLayout component
import MobileLayout from "./MobileLayout";

interface PageInfo {
  title: string;
  subtitle?: string;
}

const ResponsiveLayout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkScreenSize = () => {
      // Consider mobile if screen width is less than 768px (tablet breakpoint)
      setIsMobile(window.innerWidth < 768);
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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

  // const pageInfo = getPageInfo(location.pathname);

  // Render mobile layout for mobile devices, desktop layout for larger screens
  if (isMobile) {
    return <MobileLayout />;
  }

  // For desktop, we use the MainLayout which handles its own responsive behavior
  // TODO: Create MainLayout component
  return <div>Desktop Layout Coming Soon</div>;
};

export default ResponsiveLayout; 