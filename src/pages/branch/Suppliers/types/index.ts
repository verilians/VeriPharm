// Base API Response type
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Supplier entity
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  tax_number?: string;
  payment_terms?: string;
  credit_limit?: number;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  branch_id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

// Create Supplier data
export interface CreateSupplierData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  tax_number?: string;
  payment_terms?: string;
  credit_limit?: number;
  status?: 'active' | 'inactive' | 'suspended';
  notes?: string;
}

// Update Supplier data
export interface UpdateSupplierData extends CreateSupplierData {
  id: string;
}

// Purchase Order entity
export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  order_number: string;
  order_date: string;
  expected_delivery_date?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid';
  notes?: string;
  branch_id: string;
  tenant_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  user?: {
    name: string;
  };
}

// Create Purchase Order data
export interface CreatePurchaseOrderData {
  supplier_id: string;
  order_number: string;
  order_date: string;
  expected_delivery_date?: string;
  total_amount: number;
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status?: 'pending' | 'partial' | 'paid';
  notes?: string;
}

// Update Purchase Order data
export interface UpdatePurchaseOrderData extends CreatePurchaseOrderData {
  id: string;
}

// Purchase Order Item entity
export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  product?: {
    name: string;
    sku: string;
  };
}

// Create Purchase Order Item data
export interface CreatePurchaseOrderItemData {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity?: number;
  notes?: string;
}

// Update Purchase Order Item data
export interface UpdatePurchaseOrderItemData extends CreatePurchaseOrderItemData {
  id: string;
}

// Supplier Performance metrics
export interface SupplierPerformance {
  supplier_id: string;
  supplier_name: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  on_time_delivery_rate: number;
  quality_rating: number;
  last_order_date: string;
  payment_history: {
    total_paid: number;
    total_pending: number;
    average_payment_days: number;
  };
}

// Supplier Statistics
export interface SupplierStats {
  total_suppliers: number;
  active_suppliers: number;
  inactive_suppliers: number;
  suspended_suppliers: number;
  total_purchase_orders: number;
  pending_orders: number;
  total_spent: number;
  average_order_value: number;
  suppliers_added_this_month: number;
  orders_this_month: number;
  top_suppliers: SupplierPerformance[];
}

// Filter interfaces
export interface SupplierFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive' | 'suspended';
  sortBy?: 'name' | 'created_at' | 'total_orders';
  sortOrder?: 'asc' | 'desc';
}

export interface PurchaseOrderFilters {
  search?: string;
  supplier_id?: string;
  status?: 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status?: 'all' | 'pending' | 'partial' | 'paid';
  date_from?: string;
  date_to?: string;
  sortBy?: 'order_date' | 'total_amount' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Component Props interfaces
export interface SupplierListProps {
  suppliers: Supplier[];
  loading: boolean;
  error?: string | null;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onView: (supplier: Supplier) => void;
  filters: SupplierFilters;
  onFiltersChange: (filters: SupplierFilters) => void;
}

// Supplier Payment entity
export interface SupplierPayment {
  id: string;
  supplier_id: string;
  purchase_order_id?: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
  reference_number?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed';
  branch_id: string;
  tenant_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Create Payment data
export interface CreatePaymentData {
  supplier_id: string;
  purchase_order_id?: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
  reference_number?: string;
  notes?: string;
  status?: 'pending' | 'completed' | 'failed';
} 