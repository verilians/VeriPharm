// Customer Types
export interface Customer {
  id: string;
  tenant_id: string;
  branch_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
  registration_date: string;
  status: 'active' | 'inactive' | 'blocked';
  total_purchases?: number;
  total_spent?: number;
  last_purchase_date?: string;
  loyalty_points?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'blocked';
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string;
}

// Customer Sales Types
export interface CustomerSale {
  id: string;
  customer_id: string;
  sale_date: string;
  total_amount: number;
  payment_method: string;
  status: 'completed' | 'pending' | 'cancelled';
  created_at: string;
  updated_at: string;
  branch_id: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

// Product Types (for sales)
export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  unit_price: number;
  cost_price: number;
  stock_quantity: number;
  status: 'active' | 'inactive';
}

// Statistics Types
export interface CustomerStats {
  total_customers: number;
  active_customers: number;
  total_sales: number;
  total_revenue: number;
  average_order_value: number;
  new_customers_this_month: number;
}

// Form Types
export interface CustomerFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'blocked';
}

// Filter Types
export interface CustomerFilters {
  search: string;
  status: 'all' | 'active' | 'inactive' | 'blocked';
  gender: 'all' | 'male' | 'female';
  sortBy: 'first_name' | 'created_at' | 'total_spent';
  sortOrder: 'asc' | 'desc';
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Component Props Types
export interface CustomerListProps {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onView: (customer: Customer) => void;
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
}

export interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CreateCustomerData | UpdateCustomerData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export interface CustomerDetailsProps {
  customer: Customer;
  sales: CustomerSale[];
  stats: CustomerStats;
  loading: boolean;
  error: string | null;
  onEdit: () => void;
  onDelete: () => void;
}

export interface CustomerSalesProps {
  customer: Customer;
  sales: CustomerSale[];
  loading: boolean;
  error: string | null;
  onViewSale: (sale: CustomerSale) => void;
}

export interface CreateSaleModalProps {
  customer: Customer;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
} 