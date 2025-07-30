import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { lazy, Suspense } from "react";

// Lazy load components for better performance
const Login = lazy(() => import("../pages/auth/Login"));
const SubscriptionExpired = lazy(
  () => import("../pages/auth/SubscriptionExpired")
);
const Unauthorized = lazy(() => import("../pages/auth/Unauthorized"));
const DeveloperSetup = lazy(() => import("../pages/auth/DeveloperSetup"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const CreateTenant = lazy(() => import("../pages/auth/CreateTenant"));

// Tenant-level components
const TenantDashboard = lazy(() => import("../pages/tenant/Dashboard"));
const TenantBranches = lazy(
  () => import("../pages/tenant/Branches/BranchesWithProvider")
);
const AddBranch = lazy(
  () => import("../pages/tenant/Branches/AddBranchWithProvider")
);
const CreateBranchWorkflow = lazy(
  () => import("../pages/tenant/Branches/CreateBranchWorkflowWithProvider")
);
const BranchDetails = lazy(
  () => import("../pages/tenant/Branches/BranchDetailsWithProvider")
);
const TenantUsers = lazy(
  () => import("../pages/tenant/Users/UsersWithProvider")
);
const TenantReports = lazy(() => import("../pages/tenant/Reports"));
const TenantPurchasesSummary = lazy(
  () => import("../pages/tenant/PurchasesSummary")
);
const TotalPurchase = lazy(
  () => import("../pages/tenant/PurchasesSummary/TotalPurchase")
);
const ItemsPurchased = lazy(
  () => import("../pages/tenant/PurchasesSummary/ItemsPurchased")
);
const Suppliers = lazy(
  () => import("../pages/tenant/PurchasesSummary/Suppliers")
);
const TenantSales = lazy(() => import("../pages/tenant/Sales"));
const TotalSales = lazy(() => import("../pages/tenant/Sales/TotalSales"));
const TotalItemsSold = lazy(
  () => import("../pages/tenant/Sales/TotalItemsSold")
);
const TopSalesperson = lazy(
  () => import("../pages/tenant/Sales/TopSalesperson")
);
const TenantStock = lazy(() => import("../pages/tenant/Stock"));
const MovementHistory = lazy(
  () => import("../pages/tenant/Stock/MovementHistory")
);
const ItemDetail = lazy(() => import("../pages/tenant/Stock/ItemDetail"));
const TenantFinance = lazy(() => import("../pages/tenant/Finance"));

// Branch-level components
const SalesDashboard = lazy(() => import("../pages/branch/SalesDashboard"));
const SalesPOS = lazy(() => import("../pages/branch/Sales/POS"));
const SalesHistory = lazy(() => import("../pages/branch/Sales/SalesHistory"));
const SalesRefunds = lazy(() => import("../pages/branch/Sales/Refunds"));
const EditSale = lazy(() => import("../pages/branch/Sales/EditSale"));
const SaleDetails = lazy(() => import("../pages/branch/Sales/SaleDetails"));

const StockInventory = lazy(() => import("../pages/branch/Stock/Inventory"));
const StockAddProduct = lazy(() => import("../pages/branch/Stock/AddProduct"));
const StockEditProduct = lazy(
  () => import("../pages/branch/Stock/EditProduct")
);
const StockViewProduct = lazy(
  () => import("../pages/branch/Stock/ViewProduct")
);
const StockAudit = lazy(() => import("../pages/branch/Audits/StockAudit"));
const EditStockAudit = lazy(
  () => import("../pages/branch/Audits/EditStockAudit")
);

const PurchasesMain = lazy(() => import("../pages/branch/Purchases/Purchases"));
const EditPurchaseOrder = lazy(
  () => import("../pages/branch/Purchases/EditPurchaseOrder")
);
const PurchaseOrderDetails = lazy(
  () => import("../pages/branch/Purchases/PurchaseOrderDetails")
);

const CustomersList = lazy(() => import("../pages/branch/Customers/Customers"));
const CustomersAdd = lazy(
  () => import("../pages/branch/Customers/AddCustomer")
);
const EditCustomer = lazy(
  () => import("../pages/branch/Customers/EditCustomer")
);
const CustomerDetails = lazy(
  () => import("../pages/branch/Customers/CustomerDetails")
);

const SuppliersList = lazy(() => import("../pages/branch/Suppliers/index.tsx"));
const SuppliersDetails = lazy(
  () => import("../pages/branch/Suppliers/SupplierDetails")
);

const AddSupplier = lazy(() => import("../pages/branch/Suppliers/AddSupplier"));
const EditSupplier = lazy(
  () => import("../pages/branch/Suppliers/EditSupplier")
);

const ReportsMain = lazy(() => import("../pages/branch/Reports/Reports"));
const SettingsMain = lazy(() => import("../pages/branch/Settings/Settings"));

// const LandingPage = lazy(() => import("../pages/landing/landing_page.tsx")); // Disabled for build

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
  </div>
);

// Protected Route component with role-based access
function ProtectedRoute({
  role,
  component: Component,
  fallback = <Navigate to="/unauthorized" replace />,
}: {
  role: string | string[];
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  fallback?: React.ReactElement;
}) {
  const { user, isInitialized } = useAuthStore();

  // Show loading while auth is being initialized
  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  // Redirect to login if no user
  if (!user) {
    console.log("🔒 No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check subscription status
  if (user.subscription_status !== "active") {
    console.log(
      "🔒 Inactive subscription, redirecting to subscription-expired"
    );
    return <Navigate to="/subscription-expired" replace />;
  }

  // Check role-based access
  const allowedRoles = Array.isArray(role) ? role : [role];
  const hasAccess = allowedRoles.includes(user.role);

  console.log(
    `🔍 Route access check - User role: "${user.role}", Allowed roles: [${allowedRoles.join(", ")}], Has access: ${hasAccess}`
  );

  if (!hasAccess) {
    console.log(
      `🔒 Access denied. User role: ${user.role}, Required: ${allowedRoles.join(", ")}`
    );
    return fallback;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Authentication Routes (No Layout) */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/subscription-expired"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SubscriptionExpired />
          </Suspense>
        }
      />
      <Route
        path="/unauthorized"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Unauthorized />
          </Suspense>
        }
      />
      <Route
        path="/create-tenant"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <CreateTenant />
          </Suspense>
        }
      />
      <Route
        path="/dev-setup"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <DeveloperSetup />
          </Suspense>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ResetPassword />
          </Suspense>
        }
      />

      {/* Tenant Routes (use their own TenantDashboardLayout) */}
      <Route
        path="/tenant"
        element={
          <ProtectedRoute role={["owner"]} component={TenantDashboard} />
        }
      />
      <Route
        path="/tenant/dashboard"
        element={
          <ProtectedRoute role={["owner"]} component={TenantDashboard} />
        }
      />
      <Route
        path="/tenant/branches"
        element={<ProtectedRoute role={["owner"]} component={TenantBranches} />}
      />
      <Route
        path="/tenant/branches/new"
        element={<ProtectedRoute role={["owner"]} component={AddBranch} />}
      />
      <Route
        path="/tenant/branches/create-workflow"
        element={
          <ProtectedRoute role={["owner"]} component={CreateBranchWorkflow} />
        }
      />
      <Route
        path="/tenant/branches/:id"
        element={<ProtectedRoute role={["owner"]} component={BranchDetails} />}
      />
      <Route
        path="/tenant/users"
        element={<ProtectedRoute role={["owner"]} component={TenantUsers} />}
      />
      <Route
        path="/tenant/reports"
        element={<ProtectedRoute role={["owner"]} component={TenantReports} />}
      />
      <Route
        path="/tenant/purchases-summary"
        element={
          <ProtectedRoute role={["owner"]} component={TenantPurchasesSummary} />
        }
      />
      <Route
        path="/tenant/purchases-summary/total-purchase"
        element={<ProtectedRoute role={["owner"]} component={TotalPurchase} />}
      />
      <Route
        path="/tenant/purchases-summary/items-purchased"
        element={<ProtectedRoute role={["owner"]} component={ItemsPurchased} />}
      />
      <Route
        path="/tenant/purchases-summary/suppliers"
        element={<ProtectedRoute role={["owner"]} component={Suppliers} />}
      />
      <Route
        path="/tenant/sales"
        element={<ProtectedRoute role={["owner"]} component={TenantSales} />}
      />
      <Route
        path="/tenant/sales/total-sales"
        element={<ProtectedRoute role={["owner"]} component={TotalSales} />}
      />
      <Route
        path="/tenant/sales/total-items-sold"
        element={<ProtectedRoute role={["owner"]} component={TotalItemsSold} />}
      />
      <Route
        path="/tenant/sales/top-salesperson"
        element={<ProtectedRoute role={["owner"]} component={TopSalesperson} />}
      />
      <Route
        path="/tenant/stock"
        element={<ProtectedRoute role={["owner"]} component={TenantStock} />}
      />
      <Route
        path="/tenant/stock/movement-history"
        element={
          <ProtectedRoute role={["owner"]} component={MovementHistory} />
        }
      />
      <Route
        path="/tenant/stock/item/:id"
        element={<ProtectedRoute role={["owner"]} component={ItemDetail} />}
      />
      <Route
        path="/tenant/finance"
        element={<ProtectedRoute role={["owner"]} component={TenantFinance} />}
      />

      {/* Branch-level Routes (Manager and above access) */}
      <Route
        path="/branch"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={SalesDashboard}
          />
        }
      />
      <Route
        path="/branch/dashboard"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={SalesDashboard}
          />
        }
      />

      {/* Sales Module Routes (Manager and above) */}
      <Route
        path="/branch/sales"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={SalesHistory}
          />
        }
      />
      <Route
        path="/branch/sales/pos"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier"]}
            component={SalesPOS}
          />
        }
      />
      <Route
        path="/branch/sales/history"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={SalesHistory}
          />
        }
      />
      <Route
        path="/branch/sales/refunds"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={SalesRefunds}
          />
        }
      />
      <Route
        path="/branch/sales/new"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier"]}
            component={EditSale}
          />
        }
      />
      <Route
        path="/branch/sales/edit/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier"]}
            component={EditSale}
          />
        }
      />
      <Route
        path="/branch/sales/view/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier"]}
            component={SaleDetails}
          />
        }
      />
      <Route
        path="/branch/sales/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier"]}
            component={SaleDetails}
          />
        }
      />

      {/* Stock/Inventory Module Routes (All branch users) */}
      <Route
        path="/branch/stock"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier", "staff"]}
            component={StockInventory}
          />
        }
      />
      <Route
        path="/branch/stock/inventory"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier", "staff"]}
            component={StockInventory}
          />
        }
      />
      <Route
        path="/branch/stock/add-product"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={StockAddProduct}
          />
        }
      />
      <Route
        path="/branch/stock/edit-product/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={StockEditProduct}
          />
        }
      />
      <Route
        path="/branch/stock/view-product/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier", "staff"]}
            component={StockViewProduct}
          />
        }
      />
      <Route
        path="/branch/stock/product/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier", "staff"]}
            component={StockViewProduct}
          />
        }
      />
      <Route
        path="/branch/stock/categories"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier", "staff"]}
            component={StockInventory}
          />
        }
      />
      <Route
        path="/branch/stock/summary"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={StockInventory}
          />
        }
      />

      {/* Purchase Module Routes (Manager and above) */}
      <Route
        path="/branch/purchases"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={PurchasesMain}
          />
        }
      />
      <Route
        path="/branch/purchases/add"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={EditPurchaseOrder}
          />
        }
      />
      <Route
        path="/branch/purchases/new"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={EditPurchaseOrder}
          />
        }
      />
      <Route
        path="/branch/purchases/edit/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={EditPurchaseOrder}
          />
        }
      />
      <Route
        path="/branch/purchases/view/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={PurchaseOrderDetails}
          />
        }
      />
      <Route
        path="/branch/purchases/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={PurchaseOrderDetails}
          />
        }
      />
      <Route
        path="/branch/purchases/history"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={PurchasesMain}
          />
        }
      />

      {/* Suppliers Return Routes */}
      <Route
        path="/branch/suppliers/returns"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={SuppliersList}
          />
        }
      />

      {/* Invoice Routes */}
      <Route
        path="/branch/invoices"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={SalesHistory}
          />
        }
      />

      {/* Bills Routes */}
      <Route
        path="/branch/bills"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={SalesHistory}
          />
        }
      />

      {/* Stock Audit Routes (Manager and above) */}
      <Route
        path="/branch/audits/stock-audit"
        element={
          <ProtectedRoute role={["owner", "manager"]} component={StockAudit} />
        }
      />
      <Route
        path="/branch/audits/stock-audit/new"
        element={
          <ProtectedRoute role={["owner", "manager"]} component={StockAudit} />
        }
      />
      <Route
        path="/branch/audits/stock-audit/edit/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={EditStockAudit}
          />
        }
      />
      <Route
        path="/branch/audits/stock-audit/:id"
        element={
          <ProtectedRoute role={["owner", "manager"]} component={StockAudit} />
        }
      />

      {/* Customers Module Routes (All branch users) */}
      <Route
        path="/branch/customers"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier", "staff"]}
            component={CustomersList}
          />
        }
      />
      <Route
        path="/branch/customers/add"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier"]}
            component={CustomersAdd}
          />
        }
      />
      <Route
        path="/branch/customers/new"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier"]}
            component={CustomersAdd}
          />
        }
      />
      <Route
        path="/branch/customers/edit/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier"]}
            component={EditCustomer}
          />
        }
      />
      <Route
        path="/branch/customers/view/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier", "staff"]}
            component={CustomerDetails}
          />
        }
      />
      <Route
        path="/branch/customers/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier", "staff"]}
            component={CustomerDetails}
          />
        }
      />

      {/* Suppliers Module Routes (Manager and above) */}
      <Route
        path="/branch/suppliers"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={SuppliersList}
          />
        }
      />
      <Route
        path="/branch/suppliers/add"
        element={
          <ProtectedRoute role={["owner", "manager"]} component={AddSupplier} />
        }
      />
      <Route
        path="/branch/suppliers/new"
        element={
          <ProtectedRoute role={["owner", "manager"]} component={AddSupplier} />
        }
      />
      <Route
        path="/branch/suppliers/edit/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={EditSupplier}
          />
        }
      />
      <Route
        path="/branch/suppliers/view/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={SuppliersDetails}
          />
        }
      />
      <Route
        path="/branch/suppliers/:id"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={SuppliersDetails}
          />
        }
      />

      {/* Reports Module Routes (Manager and above) */}
      <Route
        path="/branch/reports"
        element={
          <ProtectedRoute role={["owner", "manager"]} component={ReportsMain} />
        }
      />

      {/* Settings Module Routes (Manager and above) */}
      <Route
        path="/branch/settings"
        element={
          <ProtectedRoute
            role={["owner", "manager"]}
            component={SettingsMain}
          />
        }
      />

      {/* Legacy Routes for Backward Compatibility */}
      <Route
        path="/manager"
        element={<ProtectedRoute role={["owner", "manager"]} component={SalesDashboard} />}
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute
            role={["owner", "manager", "cashier", "staff"]}
            component={SalesDashboard}
          />
        }
      />

      {/* Default Route - redirect to login (landing page disabled for build) */}
      <Route
        index
        element={<Navigate to="/login" replace />}
      />

      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
