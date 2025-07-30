/**
 * Dashboard Components Index
 * Centralized exports for all dashboard components
 */

// Main Dashboard Component
export { DashboardGraphs } from './DashboardGraphs';

// Chart Components
export { SalesChart } from './charts/SalesChart';
export { ProductsChart } from './charts/ProductsChart';
export { ReusablePieChart } from './charts/ReusablePieChart';
    
// List Components
export { CustomersList } from './lists/CustomersList';
export { StockAlertsList } from './lists/StockAlertsList';

// Hooks
export { useSalesTrends } from '../hooks/useSalesTrends';
export { useTopProducts } from '../hooks/useTopProducts';
export { useDashboardData } from '../hooks/useDashboardData';

// Types
export type * from '../types/dashboard';

// Utils
export * from '../utils/chartConfig';
export * from '../utils/chartUtils';