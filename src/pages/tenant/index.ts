// Tenant-level exports - Integrated from Sam's implementation
export { default as TenantDashboard } from './Dashboard';
export { default as ManagerDashboard } from './Dashboard/ManagerDashboard';
export { default as TenantBranches } from './Branches';
export { default as TenantUsers } from './Users';
export { default as TenantReports } from './Reports';
export { default as TenantPurchasesSummary } from './PurchasesSummary';
export { default as TenantSales } from './Sales';
export { default as TenantStock } from './Stock';
export { default as TenantFinance } from './Finance';

// Sub-route exports
export { default as AddBranch } from './Branches/AddBranch';
export { default as BranchDetails } from './Branches/BranchDetails';
export { default as TotalPurchase } from './PurchasesSummary/TotalPurchase';
export { default as ItemsPurchased } from './PurchasesSummary/ItemsPurchased';
export { default as Suppliers } from './PurchasesSummary/Suppliers';
export { default as TotalSales } from './Sales/TotalSales';
export { default as TotalItemsSold } from './Sales/TotalItemsSold';
export { default as TopSalesperson } from './Sales/TopSalesperson';
export { default as MovementHistory } from './Stock/MovementHistory';
export { default as ItemDetail } from './Stock/ItemDetail';