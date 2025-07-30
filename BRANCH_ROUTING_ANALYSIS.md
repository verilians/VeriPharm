# VeriPharm Branch Routing Structure Analysis

## 🏪 **Branch Module Overview**

The branch-level routing in VeriPharm follows a hierarchical, role-based structure where different user roles have access to different sets of routes within the `/branch/*` namespace.

---

## 📁 **Branch Folder Structure**

```
src/pages/branch/
├── SalesDashboard.tsx           # Main branch dashboard
├── layout/                      # Branch-specific layout components
│   ├── index.ts
│   ├── MobileLayout.tsx
│   └── ResponsiveLayout.tsx
├── Sales/                       # Sales management module
│   ├── POS.tsx                 # Point of Sale system
│   ├── SalesHistory.tsx        # Transaction history
│   ├── Refunds.tsx             # Refund management
│   ├── EditSale.tsx            # Sale editing
│   ├── SaleDetails.tsx         # Individual sale details
│   ├── components/             # Sales-specific components
│   ├── hooks/                  # Sales-related hooks
│   ├── services/               # Sales API services
│   ├── types/                  # Sales type definitions
│   ├── index.ts                # Module exports
│   └── index.tsx               # Main sales page
├── Stock/                       # Inventory management module
│   ├── Inventory.tsx           # Main inventory view
│   ├── AddProduct.tsx          # Product creation
│   ├── EditProduct.tsx         # Product editing
│   ├── ViewProduct.tsx         # Product details
│   ├── components/             # Stock-specific components
│   ├── hooks/                  # Stock-related hooks
│   ├── services/               # Stock API services
│   ├── types/                  # Stock type definitions
│   ├── pages/                  # Additional stock pages
│   ├── index.ts                # Module exports
│   └── index.tsx               # Main stock page
├── Customers/                   # Customer management module
│   ├── Customers.tsx           # Customer list
│   ├── AddCustomer.tsx         # Customer creation
│   ├── EditCustomer.tsx        # Customer editing
│   ├── CustomerDetails.tsx     # Customer profile
│   ├── components/             # Customer-specific components
│   ├── hooks/                  # Customer-related hooks
│   ├── services/               # Customer API services
│   ├── types/                  # Customer type definitions
│   ├── index.ts                # Module exports
│   └── index.tsx               # Main customers page
├── Suppliers/                   # Supplier management module
│   ├── index.tsx               # Supplier dashboard
│   ├── SupplierForm.tsx        # Add/edit supplier
│   ├── SupplierDetails.tsx     # Supplier profile
│   ├── EditSupplier.tsx        # Supplier editing
│   ├── CreateOrderModal.tsx    # Purchase order creation
│   ├── components/             # Supplier-specific components
│   ├── hooks/                  # Supplier-related hooks
│   ├── services/               # Supplier API services
│   ├── types/                  # Supplier type definitions
│   ├── pages/                  # Additional supplier pages
│   │   └── SuppliersDashboard.tsx
│   └── index.ts                # Module exports
├── Purchases/                   # Purchase order management
│   ├── Purchases.tsx           # Purchase order list
│   ├── EditPurchaseOrder.tsx   # Order editing
│   └── PurchaseOrderDetails.tsx # Order details
├── Audits/                      # Inventory auditing
│   ├── StockAudit.tsx          # Stock audit interface
│   ├── EditStockAudit.tsx      # Audit editing
│   ├── index.ts                # Audit exports
│   └── index.tsx               # Main audit page
├── Reports/                     # Business reporting
│   └── Reports.tsx             # Reports dashboard
└── Settings/                    # Branch settings
    ├── Settings.tsx            # Main settings page
    ├── components/             # Settings components
    │   ├── GeneralSettingsForm.tsx
    │   └── SecuritySettingsForm.tsx
    ├── hooks/                  # Settings hooks
    │   ├── useUserSettings.ts
    │   └── useSettingsStats.ts
    ├── services/               # Settings services
    │   └── settingsService.ts
    ├── types/                  # Settings types
    │   └── index.ts
    ├── pages/                  # Settings pages
    │   └── SettingsDashboard.tsx
    └── index.ts                # Settings exports
```

---

## 🛣️ **Route Configuration**

### **Main Branch Routes**
```typescript
// Entry points
/branch                          → SalesDashboard (Owner, Manager)
/branch/dashboard               → SalesDashboard (Owner, Manager)
```

### **Sales Module Routes**
```typescript
// Sales management (Manager+)
/branch/sales                   → SalesHistory (Owner, Manager)
/branch/sales/history          → SalesHistory (Owner, Manager)
/branch/sales/refunds          → SalesRefunds (Owner, Manager)

// Point of Sale (Cashier+)
/branch/sales/pos              → SalesPOS (Owner, Manager, Cashier)

// Individual sales (Cashier+)
/branch/sales/new              → EditSale (Owner, Manager, Cashier)
/branch/sales/edit/:id         → EditSale (Owner, Manager, Cashier)
/branch/sales/view/:id         → SaleDetails (Owner, Manager, Cashier)
/branch/sales/:id              → SaleDetails (Owner, Manager, Cashier)
```

### **Inventory Module Routes**
```typescript
// Inventory viewing (All users)
/branch/stock                  → StockInventory (Owner, Manager, Cashier, Staff)
/branch/stock/inventory        → StockInventory (Owner, Manager, Cashier, Staff)
/branch/stock/categories       → StockInventory (Owner, Manager, Cashier, Staff)
/branch/stock/summary          → StockInventory (Owner, Manager)

// Product management (Manager+)
/branch/stock/add-product      → StockAddProduct (Owner, Manager)
/branch/stock/edit-product/:id → StockEditProduct (Owner, Manager)

// Product viewing (All users)
/branch/stock/view-product/:id → StockViewProduct (Owner, Manager, Cashier, Staff)
/branch/stock/product/:id      → StockViewProduct (Owner, Manager, Cashier, Staff)
```

### **Customer Module Routes**
```typescript
// Customer viewing (All users)
/branch/customers              → CustomersList (Owner, Manager, Cashier, Staff)
/branch/customers/view/:id     → CustomerDetails (Owner, Manager, Cashier, Staff)
/branch/customers/:id          → CustomerDetails (Owner, Manager, Cashier, Staff)

// Customer management (Cashier+)
/branch/customers/add          → CustomersAdd (Owner, Manager, Cashier)
/branch/customers/new          → CustomersAdd (Owner, Manager, Cashier)
/branch/customers/edit/:id     → EditCustomer (Owner, Manager, Cashier)
```

### **Supplier Module Routes**
```typescript
// Supplier management (Manager+)
/branch/suppliers              → SuppliersList (Owner, Manager)
/branch/suppliers/add          → SuppliersForm (Owner, Manager)
/branch/suppliers/new          → SuppliersForm (Owner, Manager)
/branch/suppliers/edit/:id     → EditSupplier (Owner, Manager)
/branch/suppliers/view/:id     → SuppliersDetails (Owner, Manager)
/branch/suppliers/:id          → SuppliersDetails (Owner, Manager)
/branch/suppliers/returns      → SuppliersList (Owner, Manager)
```

### **Purchase Module Routes**
```typescript
// Purchase order management (Manager+)
/branch/purchases              → PurchasesMain (Owner, Manager)
/branch/purchases/add          → EditPurchaseOrder (Owner, Manager)
/branch/purchases/new          → EditPurchaseOrder (Owner, Manager)
/branch/purchases/edit/:id     → EditPurchaseOrder (Owner, Manager)
/branch/purchases/view/:id     → PurchaseOrderDetails (Owner, Manager)
/branch/purchases/:id          → PurchaseOrderDetails (Owner, Manager)
/branch/purchases/history      → PurchasesMain (Owner, Manager)
```

### **Audit Module Routes**
```typescript
// Stock auditing (Manager+)
/branch/audits/stock-audit     → StockAudit (Owner, Manager)
/branch/audits/stock-audit/new → StockAudit (Owner, Manager)
/branch/audits/stock-audit/edit/:id → EditStockAudit (Owner, Manager)
/branch/audits/stock-audit/:id → StockAudit (Owner, Manager)
```

### **Additional Routes**
```typescript
// Reports (Manager+)
/branch/reports                → ReportsMain (Owner, Manager)

// Settings (Manager+)
/branch/settings               → SettingsMain (Owner, Manager)

// Legacy routes
/branch/invoices               → SalesHistory (Owner, Manager)
/branch/bills                  → SalesHistory (Owner, Manager)
```

---

## 🔐 **Role-Based Access Control**

### **Permission Levels**

#### **Owner** (`owner`)
- **Full access** to all branch routes
- Can access tenant-level routes as well
- Administrative privileges across all modules

#### **Manager** (`manager`) 
- **Full branch access** except tenant-level routes
- Can manage all branch operations
- Access to reports, settings, and user management

#### **Cashier** (`cashier`)
- **POS operations** - Full access to sales transactions
- **Customer management** - Add/edit customer information
- **Inventory viewing** - Read-only access to stock levels
- **Limited sales management** - Can create/edit sales

#### **Staff** (`staff`)
- **Inventory viewing** - Read-only access to stock
- **Customer viewing** - Read-only access to customer info
- **Most limited access** level

---

## 🧩 **Module Architecture Pattern**

Each branch module follows a consistent structure:

### **Standard Module Structure**
```typescript
ModuleName/
├── index.ts                    # Barrel exports (types, services, hooks, components)
├── index.tsx                   # Main module page/dashboard
├── [PageName].tsx              # Individual pages (Add, Edit, Details, etc.)
├── types/
│   └── index.ts               # TypeScript interfaces and types
├── services/
│   └── [module]Service.ts     # API calls and business logic
├── hooks/
│   └── use[Module]Data.ts     # Custom React hooks
├── components/
│   └── [ComponentName].tsx    # Module-specific components
└── pages/                      # Additional pages (optional)
    └── [PageName].tsx
```

### **Export Pattern**
```typescript
// types
export * from './types';

// Services  
export * from './services';

// Hooks
export * from './hooks';

// Components
export * from './components';

// Pages (specific exports)
export { default as ModulePage } from './ModulePage';
```

---

## 🚏 **Navigation Integration**

### **Navigation Configuration**
The branch routes are integrated with a dynamic navigation system defined in `src/routes/navigation.config.ts`:

```typescript
export const navigation = {
  manager: [
    {
      title: "Sales",
      path: "/branch/sales",
      icon: "point_of_sale",
      children: [
        { title: "POS", path: "/branch/sales/pos" },
        { title: "History", path: "/branch/sales/history" },
        { title: "Refunds", path: "/branch/sales/refunds" }
      ]
    },
    // ... other modules
  ]
};
```

### **Dynamic Menu Generation**
- Navigation items are **role-filtered** at runtime
- **Hierarchical menus** with parent/child relationships
- **Icon integration** with Material Design icons
- **Permission-based visibility** for menu items

---

## 🔄 **Routing Patterns**

### **1. Resource-Based Routing**
```typescript
/branch/{resource}              # List view
/branch/{resource}/add          # Create new
/branch/{resource}/edit/:id     # Edit existing
/branch/{resource}/view/:id     # View details
/branch/{resource}/:id          # Shorthand for view
```

### **2. Action-Based Routing**
```typescript
/branch/{resource}/{action}     # Specific actions
/branch/sales/pos              # Point of sale action
/branch/audits/stock-audit     # Audit action
```

### **3. Nested Resource Routing**
```typescript
/branch/{parent}/{child}        # Nested resources
/branch/suppliers/returns      # Supplier returns
/branch/audits/stock-audit     # Stock audits
```

---

## 🔧 **Route Protection Implementation**

### **ProtectedRoute Component**
```typescript
function ProtectedRoute({ 
  role, 
  component: Component,
  fallback = <Navigate to="/unauthorized" replace />
}) {
  const { user } = useAuthStore();
  
  // Authentication check
  if (!user) return <Navigate to="/login" replace />;
  
  // Role-based access control
  const allowedRoles = Array.isArray(role) ? role : [role];
  const hasAccess = allowedRoles.includes(user.role);
  
  if (!hasAccess) return fallback;
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );
}
```

### **Usage in Routes**
```typescript
<Route path="/branch/sales/pos" element={
  <ProtectedRoute 
    role={["owner", "manager", "cashier"]} 
    component={SalesPOS} 
  />
} />
```

---

## 🎯 **Key Routing Features**

### **1. Lazy Loading**
- All branch components are **lazy-loaded** using `React.lazy()`
- Improves initial bundle size and performance
- Components load on-demand when routes are accessed

### **2. Layout Integration**
- All branch routes use `BranchDashboardLayout`
- Consistent sidebar navigation across all pages
- Mobile-responsive design with adaptive layouts

### **3. Breadcrumb Generation**
- Dynamic breadcrumb generation based on current route
- Hierarchical navigation support
- User-friendly path visualization

### **4. Route Parameterization**
- Support for dynamic route parameters (`:id`)
- Query parameter handling for filtering and pagination
- State preservation across navigation

---

## 📊 **Route Analytics**

### **Total Branch Routes**: ~45 routes
### **Module Distribution**:
- **Sales**: 7 routes
- **Stock/Inventory**: 7 routes  
- **Customers**: 6 routes
- **Suppliers**: 7 routes
- **Purchases**: 7 routes
- **Audits**: 4 routes
- **Reports**: 1 route
- **Settings**: 1 route
- **Dashboard**: 2 routes
- **Miscellaneous**: 3 routes

### **Access Level Distribution**:
- **Owner**: All routes (45)
- **Manager**: 42 routes (no tenant-level access)
- **Cashier**: 22 routes (operational access)
- **Staff**: 8 routes (view-only access)

---

## 🚀 **Best Practices Implemented**

1. **Consistent URL patterns** across all modules
2. **Role-based route protection** at the component level
3. **Modular component architecture** with clear separation
4. **Lazy loading** for performance optimization
5. **TypeScript integration** for type safety
6. **Error boundary handling** for graceful failures
7. **Mobile-first responsive design** approach
8. **SEO-friendly URL structure** with meaningful paths

---

*This analysis provides a comprehensive overview of the branch routing structure in VeriPharm, covering all aspects from basic route definitions to advanced patterns and security considerations.*
