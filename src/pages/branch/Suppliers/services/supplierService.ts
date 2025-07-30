import { supabase } from '../../../../lib/supabase/supabaseClient';
import type {
  Supplier,
  CreateSupplierData,
  UpdateSupplierData,
  PurchaseOrder,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
  PurchaseOrderItem,
  CreatePurchaseOrderItemData,
  UpdatePurchaseOrderItemData,

  SupplierStats,
  SupplierFilters,
  PurchaseOrderFilters,
  ApiResponse,
} from '../types';

export class SupplierService {
  private static getBranchId(): string {
    // In a real app, this would come from auth context
    return 'branch-123'; // Replace with actual branch ID
  }

  private static getUserId(): string {
    // In a real app, this would come from auth context
    return 'user-123'; // Replace with actual user ID
  }

  // Supplier CRUD Operations
  static async getSuppliers(filters?: SupplierFilters): Promise<ApiResponse<Supplier[]>> {
    try {
      let query = supabase
        .from('suppliers')
        .select('*')
        .eq('branch_id', this.getBranchId());

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
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
        error: error instanceof Error ? error.message : 'Failed to fetch suppliers',
        loading: false,
      };
    }
  }

  static async getSupplierById(id: string): Promise<ApiResponse<Supplier>> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
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
        error: error instanceof Error ? error.message : 'Failed to fetch supplier',
        loading: false,
      };
    }
  }

  static async createSupplier(supplierData: CreateSupplierData): Promise<ApiResponse<Supplier>> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          ...supplierData,
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
        error: error instanceof Error ? error.message : 'Failed to create supplier',
        loading: false,
      };
    }
  }

  static async updateSupplier(supplierData: UpdateSupplierData): Promise<ApiResponse<Supplier>> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update(supplierData)
        .eq('id', supplierData.id)
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
        error: error instanceof Error ? error.message : 'Failed to update supplier',
        loading: false,
      };
    }
  }

  static async deleteSupplier(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('suppliers')
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
        error: error instanceof Error ? error.message : 'Failed to delete supplier',
        loading: false,
      };
    }
  }

  // Purchase Order Operations
  static async getPurchaseOrders(filters?: PurchaseOrderFilters): Promise<ApiResponse<PurchaseOrder[]>> {
    try {
      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers(name, email, phone),
          users(name)
        `)
        .eq('branch_id', this.getBranchId());

      // Apply filters
      if (filters?.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
      }

      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.payment_status && filters.payment_status !== 'all') {
        query = query.eq('payment_status', filters.payment_status);
      }

      if (filters?.date_from) {
        query = query.gte('order_date', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('order_date', filters.date_to);
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
        error: error instanceof Error ? error.message : 'Failed to fetch purchase orders',
        loading: false,
      };
    }
  }

  static async getPurchaseOrderById(id: string): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers(name, email, phone),
          users(name)
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
        error: error instanceof Error ? error.message : 'Failed to fetch purchase order',
        loading: false,
      };
    }
  }

  static async createPurchaseOrder(orderData: CreatePurchaseOrderData): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert({
          ...orderData,
          branch_id: this.getBranchId(),
          created_by: this.getUserId(),
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
        error: error instanceof Error ? error.message : 'Failed to create purchase order',
        loading: false,
      };
    }
  }

  static async updatePurchaseOrder(orderData: UpdatePurchaseOrderData): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update(orderData)
        .eq('id', orderData.id)
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
        error: error instanceof Error ? error.message : 'Failed to update purchase order',
        loading: false,
      };
    }
  }

  static async deletePurchaseOrder(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('purchase_orders')
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
        error: error instanceof Error ? error.message : 'Failed to delete purchase order',
        loading: false,
      };
    }
  }

  // Purchase Order Items Operations
  static async getPurchaseOrderItems(orderId: string): Promise<ApiResponse<PurchaseOrderItem[]>> {
    try {
      const { data, error } = await supabase
        .from('purchase_order_items')
        .select(`
          *,
          products(name, sku)
        `)
        .eq('purchase_order_id', orderId);

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch purchase order items',
        loading: false,
      };
    }
  }

  static async createPurchaseOrderItem(itemData: CreatePurchaseOrderItemData, orderId: string): Promise<ApiResponse<PurchaseOrderItem>> {
    try {
      const { data, error } = await supabase
        .from('purchase_order_items')
        .insert({
          ...itemData,
          purchase_order_id: orderId,
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
        error: error instanceof Error ? error.message : 'Failed to create purchase order item',
        loading: false,
      };
    }
  }

  static async updatePurchaseOrderItem(itemData: UpdatePurchaseOrderItemData): Promise<ApiResponse<PurchaseOrderItem>> {
    try {
      const { data, error } = await supabase
        .from('purchase_order_items')
        .update(itemData)
        .eq('id', itemData.id)
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
        error: error instanceof Error ? error.message : 'Failed to update purchase order item',
        loading: false,
      };
    }
  }

  static async deletePurchaseOrderItem(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: true,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete purchase order item',
        loading: false,
      };
    }
  }

  // Statistics
  static async getSupplierStats(): Promise<ApiResponse<SupplierStats>> {
    try {
      // Get suppliers
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('status, created_at')
        .eq('branch_id', this.getBranchId());

      if (suppliersError) throw suppliersError;

      // Get purchase orders
      const { data: orders, error: ordersError } = await supabase
        .from('purchase_orders')
        .select('total_amount, created_at, supplier_id')
        .eq('branch_id', this.getBranchId());

      if (ordersError) throw ordersError;

      // Calculate statistics
      const totalSuppliers = suppliers?.length || 0;
      const activeSuppliers = suppliers?.filter((s: any) => s.status === 'active').length || 0;
      const inactiveSuppliers = suppliers?.filter((s: any) => s.status === 'inactive').length || 0;
      const suspendedSuppliers = suppliers?.filter((s: any) => s.status === 'suspended').length || 0;
      const totalOrders = orders?.length || 0;
      const totalSpent = orders?.reduce((sum: number, o: any) => sum + o.total_amount, 0) || 0;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      // This month calculations
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const suppliersAddedThisMonth = suppliers?.filter((s: any) => new Date(s.created_at) >= thisMonth).length || 0;
      const ordersThisMonth = orders?.filter((o: any) => new Date(o.created_at) >= thisMonth).length || 0;

      // Top suppliers (simplified calculation)
      const supplierStats = orders?.reduce((acc: any, order: any) => {
        const supplierId = order.supplier_id;
        if (!acc[supplierId]) {
          acc[supplierId] = {
            supplier_id: supplierId,
            total_orders: 0,
            total_spent: 0,
          };
        }
        acc[supplierId].total_orders += 1;
        acc[supplierId].total_spent += order.total_amount;
        return acc;
      }, {} as Record<string, any>) || {};

      const topSuppliers = Object.values(supplierStats)
        .sort((a: any, b: any) => b.total_spent - a.total_spent)
        .slice(0, 5)
        .map((supplier: any) => ({
          supplier_id: supplier.supplier_id,
          supplier_name: `Supplier ${supplier.supplier_id}`, // In real app, fetch supplier name
          total_orders: supplier.total_orders,
          total_spent: supplier.total_spent,
          average_order_value: supplier.total_spent / supplier.total_orders,
          on_time_delivery_rate: 85, // Placeholder
          quality_rating: 4.2, // Placeholder
          last_order_date: new Date().toISOString(), // Placeholder
          payment_history: {
            total_paid: supplier.total_spent * 0.8, // Placeholder
            total_pending: supplier.total_spent * 0.2, // Placeholder
            average_payment_days: 30, // Placeholder
          },
        }));

      return {
        data: {
          total_suppliers: totalSuppliers,
          active_suppliers: activeSuppliers,
          inactive_suppliers: inactiveSuppliers,
          suspended_suppliers: suspendedSuppliers,
          total_purchase_orders: totalOrders,
          pending_orders: orders?.filter((o: any) => o.status === 'pending').length || 0,
          total_spent: totalSpent,
          average_order_value: averageOrderValue,
          suppliers_added_this_month: suppliersAddedThisMonth,
          orders_this_month: ordersThisMonth,
          top_suppliers: topSuppliers,
        },
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch supplier statistics',
        loading: false,
      };
    }
  }
} 