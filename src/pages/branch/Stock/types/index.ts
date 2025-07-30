// Product Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category_id: string;
  brand?: string;
  unit_price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  status: 'active' | 'inactive' | 'discontinued';
  expiry_date?: string;
  batch_number?: string;
  supplier_id?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  image_url?: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
  };
  suppliers?: {
    name: string;
  };
}

export interface CreateProductData {
  name: string;
  sku: string;
  description?: string;
  category_id: string;
  brand?: string;
  unit_price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  status: 'active' | 'inactive' | 'discontinued';
  expiry_date?: string;
  batch_number?: string;
  supplier_id?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  image_url?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  status: 'active' | 'inactive';
  branch_id: string;
  created_at: string;
  updated_at: string;
  parent?: {
    name: string;
  };
  children?: Category[];
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parent_id?: string;
  status: 'active' | 'inactive';
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

// Stock Movement Types
export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string;
  reference_number?: string;
  notes?: string;
  user_id: string;
  branch_id: string;
  created_at: string;
  products?: {
    name: string;
    sku: string;
  };
  users?: {
    name: string;
  };
}

export interface CreateStockMovementData {
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  reference_number?: string;
  notes?: string;
}

// Stock Audit Types
export interface StockAudit {
  id: string;
  audit_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  total_items: number;
  counted_items: number;
  discrepancies: number;
  notes?: string;
  user_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
  };
}

export interface CreateStockAuditData {
  audit_date: string;
  notes?: string;
}

export interface UpdateStockAuditData extends Partial<CreateStockAuditData> {
  id: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export interface StockAuditItem {
  id: string;
  audit_id: string;
  product_id: string;
  expected_quantity: number;
  actual_quantity: number;
  difference: number;
  notes?: string;
  created_at: string;
  products?: {
    name: string;
    sku: string;
  };
}

export interface CreateStockAuditItemData {
  product_id: string;
  expected_quantity: number;
  actual_quantity: number;
  notes?: string;
}

// Statistics Types
export interface StockStats {
  total_products: number;
  active_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_stock_value: number;
  average_stock_level: number;
  products_added_this_month: number;
  stock_movements_today: number;
  stock_movements_this_month: number;
  pending_audits: number;
  completed_audits_this_month: number;
}

// Filter Types
export interface ProductFilters {
  search?: string;
  category_id?: string;
  status?: 'all' | 'active' | 'inactive' | 'discontinued';
  stock_status?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  supplier_id?: string;
  price_min?: number;
  price_max?: number;
  sortBy?: 'name' | 'sku' | 'unit_price' | 'stock_quantity' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  parent_id?: string;
  sortBy?: 'name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface StockMovementFilters {
  search?: string;
  movement_type?: 'all' | 'in' | 'out' | 'adjustment' | 'transfer';
  product_id?: string;
  date_from?: string;
  date_to?: string;
  sortBy?: 'created_at' | 'quantity';
  sortOrder?: 'asc' | 'desc';
}

export interface StockAuditFilters {
  search?: string;
  status?: 'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
  date_from?: string;
  date_to?: string;
  sortBy?: 'audit_date' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Component Props Types
export interface ProductListProps {
  onViewProduct?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
  className?: string;
}

export interface CategoryListProps {
  onViewCategory?: (category: Category) => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (category: Category) => void;
  className?: string;
}

export interface StockMovementListProps {
  onViewMovement?: (movement: StockMovement) => void;
  className?: string;
}

export interface StockAuditListProps {
  onViewAudit?: (audit: StockAudit) => void;
  onEditAudit?: (audit: StockAudit) => void;
  onDeleteAudit?: (audit: StockAudit) => void;
  onStartAudit?: (audit: StockAudit) => void;
  onCompleteAudit?: (audit: StockAudit) => void;
  className?: string;
}

// API Response Type
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
} 