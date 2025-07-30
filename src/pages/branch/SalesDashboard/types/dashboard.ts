/**
 * Dashboard Types and Interfaces
 * Centralized type definitions for the dashboard components
 */

// Core data interfaces
export interface SalesData {
  date: string;
  sales: number;
  revenue: number;
  transactions: number;
}

export interface ProductPerformance {
  name: string;
  sales: number;
  revenue: number;
  stock: number;
}

export interface CustomerData {
  name: string;
  total_spent: number;
  transactions: number;
  last_purchase: string;
}

export interface StockAlert {
  product_name: string;
  current_stock: number;
  min_stock_level: number;
  alert_type: 'low_stock' | 'out_of_stock';
}

export interface CategoryPerformance {
  name: string;
  sales: number;
  revenue: number;
  percentage: number;
}

export interface PaymentMethodData {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

// Hook return types
export interface DashboardDataState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Chart component props
export interface BaseChartProps {
  data: any[];
  loading?: boolean;
  error?: string | null;
  height?: number;
  formatCurrency: (value: number) => string;
}

export interface SalesChartProps extends BaseChartProps {
  data: SalesData[];
}

export interface ProductsChartProps extends BaseChartProps {
  data: ProductPerformance[];
}

export interface PieChartProps extends BaseChartProps {
  data: CategoryPerformance[] | PaymentMethodData[];
  title: string;
  dataKey: 'revenue' | 'amount';
}

export interface CustomersListProps {
  data: CustomerData[];
  loading?: boolean;
  error?: string | null;
  formatCurrency: (value: number) => string;
}

export interface StockAlertsListProps {
  data: StockAlert[];
  loading?: boolean;
  error?: string | null;
}

// Utility types
export interface ChartGradient {
  start: string;
  end: string;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
  }>;
  label?: string;
  formatCurrency: (value: number) => string;
}

export interface PieLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
}

// Database query result types (matching schema)
export interface SaleRecord {
  sale_date: string;
  total_amount: number;
  transaction_number: string;
  customer?: {
    first_name: string;
    last_name: string;
  };
  payment_method?: string;
}

export interface SaleItemRecord {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name?: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  quantity: number;
  min_stock_level: number;
  status: string;
  categories?: {
    name: string;
  };
}