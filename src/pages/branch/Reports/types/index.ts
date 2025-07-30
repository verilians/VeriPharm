// Base API Response type
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Report Filters
export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  category_id?: string;
  supplier_id?: string;
  customer_id?: string;
  product_id?: string;
  status?: string;
  payment_status?: string;
  export_format?: 'pdf' | 'excel' | 'csv';
}

// Sales Report Types
export interface SalesReport {
  id: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  date_from: string;
  date_to: string;
  total_sales: number;
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  top_products: TopProduct[];
  top_customers: TopCustomer[];
  sales_by_day: SalesByDay[];
  sales_by_category: SalesByCategory[];
  payment_methods: PaymentMethodSummary[];
  created_at: string;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  percentage: number;
}

export interface TopCustomer {
  customer_id: string;
  customer_name: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
}

export interface SalesByDay {
  date: string;
  sales_count: number;
  revenue: number;
  orders: number;
}

export interface SalesByCategory {
  category_id: string;
  category_name: string;
  sales_count: number;
  revenue: number;
  percentage: number;
}

export interface PaymentMethodSummary {
  payment_method: string;
  count: number;
  amount: number;
  percentage: number;
}

// Inventory Report Types
export interface InventoryReport {
  id: string;
  report_date: string;
  total_products: number;
  total_stock_value: number;
  low_stock_products: number;
  out_of_stock_products: number;
  stock_movements: StockMovementSummary[];
  stock_by_category: StockByCategory[];
  top_suppliers: TopSupplier[];
  stock_alerts: StockAlert[];
}

export interface StockMovementSummary {
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  count: number;
  total_quantity: number;
  total_value: number;
}

export interface StockByCategory {
  category_id: string;
  category_name: string;
  product_count: number;
  total_stock: number;
  total_value: number;
  low_stock_count: number;
}

export interface TopSupplier {
  supplier_id: string;
  supplier_name: string;
  product_count: number;
  total_stock_value: number;
  last_order_date: string;
}

export interface StockAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock_level: number;
  days_since_last_movement: number;
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock';
}

// Financial Report Types
export interface FinancialReport {
  id: string;
  report_period: string;
  total_revenue: number;
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
  revenue_by_month: RevenueByMonth[];
  expenses_by_category: ExpenseByCategory[];
  profit_trends: ProfitTrend[];
  cash_flow: CashFlowSummary;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  orders: number;
  growth_percentage: number;
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface ProfitTrend {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

export interface CashFlowSummary {
  opening_balance: number;
  cash_in: number;
  cash_out: number;
  closing_balance: number;
  net_cash_flow: number;
}

// Customer Report Types
export interface CustomerReport {
  id: string;
  report_date: string;
  total_customers: number;
  active_customers: number;
  new_customers: number;
  customer_retention_rate: number;
  average_customer_value: number;
  customer_segments: CustomerSegment[];
  customer_loyalty: CustomerLoyalty[];
  customer_growth: CustomerGrowth[];
}

export interface CustomerSegment {
  segment: 'high_value' | 'medium_value' | 'low_value' | 'new';
  count: number;
  total_revenue: number;
  average_order_value: number;
  percentage: number;
}

export interface CustomerLoyalty {
  customer_id: string;
  customer_name: string;
  total_orders: number;
  total_spent: number;
  first_order_date: string;
  last_order_date: string;
  loyalty_score: number;
}

export interface CustomerGrowth {
  period: string;
  new_customers: number;
  returning_customers: number;
  churned_customers: number;
  growth_rate: number;
}

// Purchase Report Types
export interface PurchaseReport {
  id: string;
  report_period: string;
  total_purchases: number;
  total_spent: number;
  average_order_value: number;
  top_suppliers: TopSupplierPurchase[];
  purchases_by_category: PurchaseByCategory[];
  payment_status_summary: PaymentStatusSummary[];
}

export interface TopSupplierPurchase {
  supplier_id: string;
  supplier_name: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  on_time_delivery_rate: number;
}

export interface PurchaseByCategory {
  category_id: string;
  category_name: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
}

export interface PaymentStatusSummary {
  status: 'pending' | 'partial' | 'paid';
  count: number;
  total_amount: number;
  percentage: number;
}

// Export Options
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  include_charts?: boolean;
  include_summary?: boolean;
  date_range?: string;
  filters?: ReportFilters;
}

// Report Generation Request
export interface ReportGenerationRequest {
  report_type: 'sales' | 'inventory' | 'financial' | 'customer' | 'purchase';
  filters: ReportFilters;
  export_options?: ExportOptions;
}

// Report Statistics
export interface ReportStats {
  total_reports_generated: number;
  reports_this_month: number;
  most_popular_report: string;
  average_generation_time: number;
  export_formats_used: {
    pdf: number;
    excel: number;
    csv: number;
  };
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

// Dashboard Summary
export interface DashboardSummary {
  sales_summary: {
    today_revenue: number;
    this_week_revenue: number;
    this_month_revenue: number;
    growth_rate: number;
  };
  inventory_summary: {
    total_products: number;
    low_stock_count: number;
    out_of_stock_count: number;
    total_stock_value: number;
  };
  customer_summary: {
    total_customers: number;
    new_customers_this_month: number;
    active_customers: number;
    average_customer_value: number;
  };
  financial_summary: {
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
  };
} 