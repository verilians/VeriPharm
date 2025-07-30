// Sale Types
export interface Sale {
  id: string;
  sale_number: string;
  customer_id: string;
  customer_name?: string;
  sale_date: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: 'cash' | 'card' | 'mobile_money' | 'bank_transfer';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  status: 'completed' | 'pending' | 'cancelled';
  notes: string;
  created_at: string;
  updated_at: string;
  branch_id: string;
  user_id: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSaleData {
  customer_id: string;
  items: CreateSaleItemData[];
  payment_method: 'cash' | 'card' | 'mobile_money' | 'bank_transfer';
  notes?: string;
  discount_amount?: number;
  tax_amount?: number;
}

export interface CreateSaleItemData {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount?: number;
}

// POS Types
export interface POSProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  unit_price: number;
  cost_price: number;
  stock_quantity: number;
  status: 'active' | 'inactive';
  barcode?: string;
}

export interface POSCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface POSCartItem {
  product: POSProduct;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount: number;
}

export interface POSCart {
  items: POSCartItem[];
  customer: POSCustomer | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
}

// Refund Types
export interface Refund {
  id: string;
  sale_id: string;
  sale_number?: string;
  customer_id: string;
  customer_name?: string;
  refund_date: string;
  refund_amount: number;
  refund_reason: string;
  refund_method: 'cash' | 'card' | 'bank_transfer';
  status: 'pending' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
  updated_at: string;
  branch_id: string;
  user_id: string;
}

export interface CreateRefundData {
  sale_id: string;
  refund_amount: number;
  refund_reason: string;
  refund_method: 'cash' | 'card' | 'bank_transfer';
  notes?: string;
}

// Statistics Types
export interface SalesStats {
  total_sales: number;
  total_revenue: number;
  total_refunds: number;
  refund_amount: number;
  net_revenue: number;
  average_order_value: number;
  sales_today: number;
  revenue_today: number;
  sales_this_month: number;
  revenue_this_month: number;
}

// Filter Types
export interface SalesFilters {
  search: string;
  status: 'all' | 'completed' | 'pending' | 'cancelled';
  payment_status: 'all' | 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'all' | 'cash' | 'card' | 'mobile_money' | 'bank_transfer';
  date_from: string;
  date_to: string;
  sortBy: 'sale_date' | 'total_amount' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

export interface RefundFilters {
  search: string;
  status: 'all' | 'pending' | 'completed' | 'cancelled';
  refund_method: 'all' | 'cash' | 'card' | 'bank_transfer';
  date_from: string;
  date_to: string;
  sortBy: 'refund_date' | 'refund_amount' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Component Props Types
export interface SalesListProps {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  onView: (sale: Sale) => void;
  onRefund: (sale: Sale) => void;
  filters: SalesFilters;
  onFiltersChange: (filters: SalesFilters) => void;
}

export interface POSProps {
  products: POSProduct[];
  customers: POSCustomer[];
  loading: boolean;
  error: string | null;
  onCompleteSale: (saleData: CreateSaleData) => Promise<void>;
}

export interface RefundListProps {
  refunds: Refund[];
  loading: boolean;
  error: string | null;
  onView: (refund: Refund) => void;
  onEdit: (refund: Refund) => void;
  filters: RefundFilters;
  onFiltersChange: (filters: RefundFilters) => void;
}

export interface CreateRefundModalProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRefundData) => Promise<void>;
  loading: boolean;
}

export interface SalesStatsProps {
  stats: SalesStats;
  loading: boolean;
  error: string | null;
} 