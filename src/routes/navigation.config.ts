// Navigation configuration for the VeriPharm application
export const navigation = {
  // Owner navigation (tenant-level)
  owner: [
    {
      title: "Dashboard",
      path: "/tenant/dashboard",
      icon: "dashboard",
      description: "Tenant overview and analytics",
      roles: ["owner"]
    },
    {
      title: "Branches",
      path: "/tenant/branches",
      icon: "store",
      description: "Branch management",
      roles: ["owner"]
    },
    {
      title: "Users",
      path: "/tenant/users",
      icon: "people",
      description: "User management across all branches",
      roles: ["owner"]
    },
    {
      title: "Reports",
      path: "/tenant/reports",
      icon: "analytics",
      description: "Consolidated reports across all branches",
      roles: ["owner"]
    },
    {
      title: "Settings",
      path: "/tenant/settings",
      icon: "settings",
      description: "Tenant-wide settings",
      roles: ["owner"]
    }
  ],

  // Manager navigation (branch-level)
  manager: [
    {
      title: "Dashboard",
      path: "/branch/dashboard",
      icon: "dashboard",
      description: "Branch overview and analytics",
      roles: ["owner", "manager"]
    },
    {
      title: "Sales",
      path: "/branch/sales",
      icon: "point_of_sale",
      description: "Sales management and POS",
      roles: ["owner", "manager", "cashier"],
      children: [
        { title: "POS", path: "/branch/sales/pos", icon: "point_of_sale", roles: ["owner", "manager", "cashier"] },
        { title: "History", path: "/branch/sales/history", icon: "history", roles: ["owner", "manager"] },
        { title: "Refunds", path: "/branch/sales/refunds", icon: "money_off", roles: ["owner", "manager"] }
      ]
    },
    {
      title: "Inventory",
      path: "/branch/stock",
      icon: "inventory",
      description: "Stock management and products",
      roles: ["owner", "manager", "cashier", "staff"],
      children: [
        { title: "Inventory", path: "/branch/stock/inventory", icon: "inventory", roles: ["owner", "manager", "cashier", "staff"] },
        { title: "Add Product", path: "/branch/stock/add-product", icon: "add_box", roles: ["owner", "manager"] }
      ]
    },
    {
      title: "Purchases",
      path: "/branch/purchases",
      icon: "shopping_cart",
      description: "Purchase orders and procurement",
      roles: ["owner", "manager"]
    },
    {
      title: "Customers",
      path: "/branch/customers",
      icon: "people",
      description: "Customer management",
      roles: ["owner", "manager", "cashier", "staff"],
      children: [
        { title: "All Customers", path: "/branch/customers", icon: "people", roles: ["owner", "manager", "cashier", "staff"] },
        { title: "Add Customer", path: "/branch/customers/add", icon: "person_add", roles: ["owner", "manager", "cashier"] }
      ]
    },
    {
      title: "Suppliers",
      path: "/branch/suppliers",
      icon: "business",
      description: "Supplier management",
      roles: ["owner", "manager"],
      children: [
        { title: "All Suppliers", path: "/branch/suppliers", icon: "business", roles: ["owner", "manager"] },
        { title: "Add Supplier", path: "/branch/suppliers/add", icon: "add_business", roles: ["owner", "manager"] }
      ]
    },
    {
      title: "Reports",
      path: "/branch/reports",
      icon: "analytics",
      description: "Reports and analytics",
      roles: ["owner", "manager"]
    },
    {
      title: "Settings",
      path: "/branch/settings",
      icon: "settings",
      description: "Branch settings",
      roles: ["owner", "manager"]
    }
  ],

  // Cashier/Staff navigation (limited branch access)
  cashier: [
    {
      title: "POS",
      path: "/branch/sales/pos",
      icon: "point_of_sale",
      description: "Point of sale system",
      roles: ["owner", "manager", "cashier"]
    },
    {
      title: "Inventory",
      path: "/branch/stock/inventory",
      icon: "inventory",
      description: "View inventory",
      roles: ["owner", "manager", "cashier", "staff"]
    },
    {
      title: "Customers",
      path: "/branch/customers",
      icon: "people",
      description: "Customer management",
      roles: ["owner", "manager", "cashier", "staff"]
    }
  ],

  // Staff navigation (very limited access)
  staff: [
    {
      title: "Inventory",
      path: "/branch/stock/inventory",
      icon: "inventory",
      description: "View inventory",
      roles: ["owner", "manager", "cashier", "staff"]
    },
    {
      title: "Customers",
      path: "/branch/customers",
      icon: "people",
      description: "View customers",
      roles: ["owner", "manager", "cashier", "staff"]
    }
  ],

  // Salesperson navigation (branch-level)
  salesperson: [
    {
      title: "Sales Dashboard",
      path: "/branch/dashboard",
      icon: "dashboard",
      description: "Sales overview and daily metrics",
      roles: ["owner", "manager", "salesperson"]
    },
    {
      title: "Sales",
      path: "/branch/sales",
      icon: "point_of_sale",
      description: "Point of sale and transactions",
      roles: ["owner", "manager", "salesperson"],
      children: [
        { title: "POS", path: "/branch/sales", icon: "point_of_sale", roles: ["owner", "manager", "salesperson"] },
        { title: "History", path: "/branch/sales/history", icon: "history", roles: ["owner", "manager", "salesperson"] },
        { title: "Refunds", path: "/branch/sales/refunds", icon: "money_off", roles: ["owner", "manager", "salesperson"] }
      ]
    },
    {
      title: "Inventory",
      path: "/branch/stock",
      icon: "inventory",
      description: "Stock management and products",
      roles: ["owner", "manager", "salesperson"],
      children: [
        { title: "Stock", path: "/branch/stock", icon: "inventory", roles: ["owner", "manager", "salesperson"] },
        { title: "Add Product", path: "/branch/stock/add", icon: "add_box", roles: ["owner", "manager", "salesperson"] }
      ]
    },
    {
      title: "Customers",
      path: "/branch/customers",
      icon: "people",
      description: "Customer management",
      roles: ["owner", "manager", "salesperson"]
    },
    {
      title: "Reports",
      path: "/branch/reports",
      icon: "analytics",
      description: "Reports and analytics",
      roles: ["owner", "manager", "salesperson"]
    }
  ],

  // Developer navigation (full access)
  developer: [
    {
      title: "Tenant Dashboard",
      path: "/tenant/dashboard",
      icon: "dashboard",
      description: "Tenant-level overview",
      roles: ["developer"]
    },
    {
      title: "Branches",
      path: "/tenant/branches",
      icon: "business",
      description: "Branch management",
      roles: ["developer"]
    },
    {
      title: "Users",
      path: "/tenant/users",
      icon: "people",
      description: "User management",
      roles: ["developer"]
    },
    {
      title: "Sales Dashboard",
      path: "/branch/dashboard",
      icon: "dashboard",
      description: "Branch sales overview",
      roles: ["developer"]
    },
    {
      title: "Sales",
      path: "/branch/sales",
      icon: "point_of_sale",
      description: "Sales management",
      roles: ["developer"]
    },
    {
      title: "Inventory",
      path: "/branch/stock",
      icon: "inventory",
      description: "Stock management",
      roles: ["developer"]
    },
    {
      title: "Customers",
      path: "/branch/customers",
      icon: "people",
      description: "Customer management",
      roles: ["developer"]
    },
    {
      title: "Reports",
      path: "/branch/reports",
      icon: "analytics",
      description: "Reports and analytics",
      roles: ["developer"]
    }
  ]
};

// Branch-level navigation (when user is viewing/managing a specific branch)
export const branchNavigationItems = [
  {
    title: "Dashboard",
    path: "/branch/dashboard",
    icon: "dashboard",
    description: "Manager overview and analytics"
  },
  {
    title: "Sales Dashboard",
    path: "/branch/dashboard",
    icon: "dashboard",
    description: "Sales overview and daily metrics"
  },
  {
    title: "Sales",
    path: "/branch/sales",
    icon: "point_of_sale",
    description: "Point of sale and transactions",
    children: [
      { title: "POS", path: "/branch/sales", icon: "point_of_sale" },
      { title: "History", path: "/branch/sales/history", icon: "history" },
      { title: "Refunds", path: "/branch/sales/refunds", icon: "money_off" }
    ]
  },
  {
    title: "Inventory",
    path: "/branch/stock",
    icon: "inventory",
    description: "Stock management and products",
    children: [
      { title: "Stock", path: "/branch/stock", icon: "inventory" },
      { title: "Add Product", path: "/branch/stock/add", icon: "add_box" }
    ]
  },
  {
    title: "Customers",
    path: "/branch/customers",
    icon: "people",
    description: "Customer management",
    children: [
      { title: "All Customers", path: "/branch/customers", icon: "people" },
      { title: "Add Customer", path: "/branch/customers/add", icon: "person_add" }
    ]
  },
  {
    title: "Suppliers",
    path: "/branch/suppliers",
    icon: "business",
    description: "Supplier management",
    children: [
      { title: "All Suppliers", path: "/branch/suppliers", icon: "business" },
      { title: "Add Supplier", path: "/branch/suppliers/add", icon: "add_business" }
    ]
  },
  {
    title: "Reports",
    path: "/branch/reports",
    icon: "analytics",
    description: "Reports and analytics"
  },
  {
    title: "Settings",
    path: "/branch/settings",
    icon: "settings",
    description: "Application settings"
  }
];

// Route permissions
export const routePermissions = {
  // Public routes (no authentication required)
  public: [
    "/login",
    "/subscription-expired", 
    "/unauthorized"
  ],

  // Manager-only routes
  manager: [
    "/tenant",
    "/tenant/dashboard",
    "/manager" // legacy
  ],

  // Salesperson-only routes
  salesperson: [
    "/branch",
    "/branch/dashboard",
    "/branch/sales",
    "/branch/sales/history",
    "/branch/sales/refunds",
    "/branch/stock",
    "/branch/stock/add",
    "/branch/stock/edit/:id",
    "/branch/stock/view/:id",
    "/branch/customers",
    "/branch/customers/add",
    "/branch/suppliers",
    "/branch/suppliers/add",
    "/branch/suppliers/edit/:id",
    "/branch/suppliers/view/:id",
    "/branch/reports",
    "/branch/settings",
    "/sales" // legacy
  ],

  // Developer has access to all routes
  developer: [
    "/tenant",
    "/tenant/dashboard",
    "/branch",
    "/branch/dashboard",
    "/branch/sales",
    "/branch/sales/history",
    "/branch/sales/refunds",
    "/branch/stock",
    "/branch/stock/add",
    "/branch/stock/edit/:id",
    "/branch/stock/view/:id",
    "/branch/customers",
    "/branch/customers/add",
    "/branch/suppliers",
    "/branch/suppliers/add",
    "/branch/suppliers/edit/:id",
    "/branch/suppliers/view/:id",
    "/branch/reports",
    "/branch/settings",
    "/manager", // legacy
    "/sales" // legacy
  ]
};

// Navigation item interface
export interface NavigationItem {
  title: string;
  path: string;
  icon: string;
  description?: string;
  children?: NavigationItem[];
}

// Route permission interface
export interface RoutePermission {
  public: string[];
  manager: string[];
  salesperson: string[];
  developer: string[];
}

// Helper function to get navigation items based on user role
export const getNavigationItems = (userRole: string): NavigationItem[] => {
  switch (userRole) {
    case "manager":
      return navigation.manager;
    case "salesperson":
      return navigation.salesperson;
    case "developer":
      return navigation.developer;
    default:
      return [];
  }
};

// Helper function to check if user has access to a route
export const hasRouteAccess = (path: string, userRole: string): boolean => {
  // Public routes are accessible to everyone
  if (routePermissions.public.includes(path)) {
    return true;
  }

  // Developer has access to all routes
  if (userRole === "developer") {
    return true;
  }

  // Check role-specific permissions
  if (userRole === "manager" && routePermissions.manager.some(route => 
    path.startsWith(route.replace(/:\w+/g, ''))
  )) {
    return true;
  }

  if (userRole === "salesperson" && routePermissions.salesperson.some(route => 
    path.startsWith(route.replace(/:\w+/g, ''))
  )) {
    return true;
  }

  return false;
}; 