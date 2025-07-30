 
import { supabaseAdmin } from '../../../../lib/supabase/supabaseClient';
import type {
  Product,
  CreateProductData,
  UpdateProductData,
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  StockMovement,
  CreateStockMovementData,
  StockAudit,
  CreateStockAuditData,
  UpdateStockAuditData,
  StockAuditItem,
  CreateStockAuditItemData,
  StockStats,
  ApiResponse,
} from '../types';

export class StockService {
  private static getBranchId(): string {
    // In a real app, this would come from auth context
    return 'branch-123'; // Replace with actual branch ID
  }

  private static getUserId(): string {
    // In a real app, this would come from auth context
    return 'user-123'; // Replace with actual user ID
  }

  // Product CRUD Operations
  static async getProducts(filters?: {
    search?: string;
    category_id?: string;
    status?: 'all' | 'active' | 'inactive' | 'discontinued';
    stock_status?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
    supplier_id?: string;
    price_min?: number;
    price_max?: number;
    sortBy?: 'name' | 'sku' | 'unit_price' | 'stock_quantity' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<Product[]>> {
    try {
      let query = supabaseAdmin
        .from('products')
        .select(`
          *,
          categories(name),
          suppliers(name)
        `)
        .eq('branch_id', this.getBranchId());

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }

      if (filters?.price_min) {
        query = query.gte('unit_price', filters.price_min);
      }

      if (filters?.price_max) {
        query = query.lte('unit_price', filters.price_max);
      }

      // Stock status filters
      if (filters?.stock_status && filters.stock_status !== 'all') {
        switch (filters.stock_status) {
          case 'out_of_stock':
            query = query.eq('stock_quantity', 0);
            break;
          case 'low_stock':
            query = query.lte('stock_quantity', 10); // Use a fixed value or get from product
            break;
          case 'in_stock':
            query = query.gt('stock_quantity', 0);
            break;
        }
      }

      // Apply sorting
      if (filters?.sortBy) {
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
      } else {
        query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
        loading: false,
      };
    }
  }

  static async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select(`
          *,
          categories(name),
          suppliers(name)
        `)
        .eq('id', id)
        .eq('branch_id', this.getBranchId())
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch product',
        loading: false,
      };
    }
  }

  static async createProduct(productData: CreateProductData): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert({
          ...productData,
          branch_id: this.getBranchId(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create product',
        loading: false,
      };
    }
  }

  static async updateProduct(productData: UpdateProductData): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .update(productData)
        .eq('id', productData.id)
        .eq('branch_id', this.getBranchId())
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update product',
        loading: false,
      };
    }
  }

  static async deleteProduct(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id)
        .eq('branch_id', this.getBranchId());

      if (error) throw error;

      return {
        data: true,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete product',
        loading: false,
      };
    }
  }

  // Category CRUD Operations
  static async getCategories(filters?: {
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    parent_id?: string;
    sortBy?: 'name' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<Category[]>> {
    try {
      let query = supabaseAdmin
        .from('categories')
        .select(`
          *,
          parent:categories(name)
        `)
        .eq('branch_id', this.getBranchId());

      // Apply filters
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.parent_id) {
        query = query.eq('parent_id', filters.parent_id);
      }

      // Apply sorting
      if (filters?.sortBy) {
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
      } else {
        query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
        loading: false,
      };
    }
  }

  static async createCategory(categoryData: CreateCategoryData): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .insert({
          ...categoryData,
          branch_id: this.getBranchId(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create category',
        loading: false,
      };
    }
  }

  static async updateCategory(categoryData: UpdateCategoryData): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .update(categoryData)
        .eq('id', categoryData.id)
        .eq('branch_id', this.getBranchId())
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update category',
        loading: false,
      };
    }
  }

  // Stock Movement Operations
  static async getStockMovements(filters?: {
    search?: string;
    movement_type?: 'all' | 'in' | 'out' | 'adjustment' | 'transfer';
    product_id?: string;
    date_from?: string;
    date_to?: string;
    sortBy?: 'created_at' | 'quantity';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<StockMovement[]>> {
    try {
      let query = supabaseAdmin
        .from('stock_movements')
        .select(`
          *,
          products(name, sku),
          users(name)
        `)
        .eq('branch_id', this.getBranchId());

      // Apply filters
      if (filters?.search) {
        query = query.or(`reason.ilike.%${filters.search}%,products.name.ilike.%${filters.search}%`);
      }

      if (filters?.movement_type && filters.movement_type !== 'all') {
        query = query.eq('movement_type', filters.movement_type);
      }

      if (filters?.product_id) {
        query = query.eq('product_id', filters.product_id);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Apply sorting
      if (filters?.sortBy) {
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch stock movements',
        loading: false,
      };
    }
  }

  static async createStockMovement(movementData: CreateStockMovementData): Promise<ApiResponse<StockMovement>> {
    try {
      // Get current stock quantity
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('stock_quantity')
        .eq('id', movementData.product_id)
        .eq('branch_id', this.getBranchId())
        .single();

      if (productError) throw productError;

      const previousQuantity = product.stock_quantity;
      let newQuantity = previousQuantity;

      // Calculate new quantity based on movement type
      switch (movementData.movement_type) {
        case 'in':
        case 'adjustment':
          newQuantity += movementData.quantity;
          break;
        case 'out':
        case 'transfer':
          newQuantity -= movementData.quantity;
          break;
      }

      // Create stock movement
      const { data: movement, error: movementError } = await supabaseAdmin
        .from('stock_movements')
        .insert({
          ...movementData,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          user_id: this.getUserId(),
          branch_id: this.getBranchId(),
        })
        .select()
        .single();

      if (movementError) throw movementError;

      // Update product stock quantity
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('id', movementData.product_id)
        .eq('branch_id', this.getBranchId());

      if (updateError) throw updateError;

      return {
        data: movement,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create stock movement',
        loading: false,
      };
    }
  }

  // Stock Audit Operations
  static async getStockAudits(filters?: {
    search?: string;
    status?: 'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
    date_from?: string;
    date_to?: string;
    sortBy?: 'audit_date' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<StockAudit[]>> {
    try {
      let query = supabaseAdmin
        .from('stock_audits')
        .select(`
          *,
          users(name)
        `)
        .eq('branch_id', this.getBranchId());

      // Apply filters
      if (filters?.search) {
        query = query.or(`notes.ilike.%${filters.search}%`);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.date_from) {
        query = query.gte('audit_date', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('audit_date', filters.date_to);
      }

      // Apply sorting
      if (filters?.sortBy) {
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch stock audits',
        loading: false,
      };
    }
  }

  static async createStockAudit(auditData: CreateStockAuditData): Promise<ApiResponse<StockAudit>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('stock_audits')
        .insert({
          ...auditData,
          status: 'pending',
          total_items: 0,
          counted_items: 0,
          discrepancies: 0,
          user_id: this.getUserId(),
          branch_id: this.getBranchId(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create stock audit',
        loading: false,
      };
    }
  }

  static async updateStockAudit(auditData: UpdateStockAuditData): Promise<ApiResponse<StockAudit>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('stock_audits')
        .update(auditData)
        .eq('id', auditData.id)
        .eq('branch_id', this.getBranchId())
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update stock audit',
        loading: false,
      };
    }
  }

  static async getStockAuditItems(auditId: string): Promise<ApiResponse<StockAuditItem[]>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('stock_audit_items')
        .select(`
          *,
          products(name, sku)
        `)
        .eq('audit_id', auditId);

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch stock audit items',
        loading: false,
      };
    }
  }

  static async createStockAuditItem(itemData: CreateStockAuditItemData, auditId: string): Promise<ApiResponse<StockAuditItem>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('stock_audit_items')
        .insert({
          ...itemData,
          audit_id: auditId,
          difference: itemData.actual_quantity - itemData.expected_quantity,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create stock audit item',
        loading: false,
      };
    }
  }

  // Statistics
  static async getStockStats(): Promise<ApiResponse<StockStats>> {
    try {
      // Get total products
      const { data: products, error: productsError } = await supabaseAdmin
        .from('products')
        .select('status, stock_quantity, unit_price, min_stock_level, created_at')
        .eq('branch_id', this.getBranchId());

      if (productsError) throw productsError;

      // Get stock movements
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const { data: movements, error: movementsError } = await supabaseAdmin
        .from('stock_movements')
        .select('created_at')
        .eq('branch_id', this.getBranchId());

      if (movementsError) throw movementsError;

      // Get audits
      const { data: audits, error: auditsError } = await supabaseAdmin
        .from('stock_audits')
        .select('status, created_at')
        .eq('branch_id', this.getBranchId());

      if (auditsError) throw auditsError;

      // Calculate statistics
      const totalProducts = products?.length || 0;
      const activeProducts = products?.filter(p => p.status === 'active').length || 0;
      const lowStockProducts = products?.filter(p => p.stock_quantity <= p.min_stock_level && p.stock_quantity > 0).length || 0;
      const outOfStockProducts = products?.filter(p => p.stock_quantity === 0).length || 0;
      const totalStockValue = products?.reduce((sum, p) => sum + (p.stock_quantity * p.unit_price), 0) || 0;
      const averageStockLevel = totalProducts > 0 ? products?.reduce((sum, p) => sum + p.stock_quantity, 0) / totalProducts || 0 : 0;
      const productsAddedThisMonth = products?.filter(p => new Date(p.created_at) >= thisMonth).length || 0;
      const stockMovementsToday = movements?.filter(m => new Date(m.created_at) >= today).length || 0;
      const stockMovementsThisMonth = movements?.filter((m: any) => new Date(m.created_at) >= thisMonth).length || 0;
      const pendingAudits = audits?.filter(a => a.status === 'pending').length || 0;
      const completedAuditsThisMonth = audits?.filter(a => a.status === 'completed' && new Date(a.created_at) >= thisMonth).length || 0;

      return {
        data: {
          total_products: totalProducts,
          active_products: activeProducts,
          low_stock_products: lowStockProducts,
          out_of_stock_products: outOfStockProducts,
          total_stock_value: totalStockValue,
          average_stock_level: averageStockLevel,
          products_added_this_month: productsAddedThisMonth,
          stock_movements_today: stockMovementsToday,
          stock_movements_this_month: stockMovementsThisMonth,
          pending_audits: pendingAudits,
          completed_audits_this_month: completedAuditsThisMonth,
        },
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
        loading: false,
      };
    }
  }
}