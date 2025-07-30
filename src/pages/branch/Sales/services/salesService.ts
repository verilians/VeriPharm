import { supabase } from '../../../../lib/supabase';
import {
  Sale,
  SaleItem,
  CreateSaleData,
  Refund,
  CreateRefundData,
  SalesStats,
  ApiResponse,
  POSProduct,
  POSCustomer,
} from '../types';

export class SalesService {
  private static getBranchId(): string {
    // In a real app, this would come from auth context
    return 'branch-123'; // Replace with actual branch ID
  }

  private static getUserId(): string {
    // In a real app, this would come from auth context
    return 'user-123'; // Replace with actual user ID
  }

  // Sales CRUD Operations
  static async getSales(filters?: {
    search?: string;
    status?: 'all' | 'completed' | 'pending' | 'cancelled';
    payment_status?: 'all' | 'pending' | 'completed' | 'failed' | 'refunded';
    payment_method?: 'all' | 'cash' | 'card' | 'mobile_money' | 'bank_transfer';
    date_from?: string;
    date_to?: string;
    sortBy?: 'sale_date' | 'total_amount' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<Sale[]>> {
    try {
      let query = supabase
        .from('sales')
        .select(`
          *,
          customers(name)
        `)
        .eq('branch_id', this.getBranchId());

      // Apply filters
      if (filters?.search) {
        query = query.or(`sale_number.ilike.%${filters.search}%,customers.name.ilike.%${filters.search}%`);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.payment_status && filters.payment_status !== 'all') {
        query = query.eq('payment_status', filters.payment_status);
      }

      if (filters?.payment_method && filters.payment_method !== 'all') {
        query = query.eq('payment_method', filters.payment_method);
      }

      if (filters?.date_from) {
        query = query.gte('sale_date', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('sale_date', filters.date_to);
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
        error: error instanceof Error ? error.message : 'Failed to fetch sales',
        loading: false,
      };
    }
  }

  static async getSaleById(id: string): Promise<ApiResponse<Sale>> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers(name),
          sale_items(
            *,
            products(name, sku)
          )
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
        error: error instanceof Error ? error.message : 'Failed to fetch sale',
        loading: false,
      };
    }
  }

  static async createSale(saleData: CreateSaleData): Promise<ApiResponse<Sale>> {
    try {
      // Generate sale number
      const saleNumber = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Calculate totals
      const subtotal = saleData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const discountAmount = saleData.discount_amount || 0;
      const taxAmount = saleData.tax_amount || 0;
      const finalAmount = subtotal - discountAmount + taxAmount;

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          sale_number: saleNumber,
          customer_id: saleData.customer_id,
          sale_date: new Date().toISOString(),
          total_amount: subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          payment_method: saleData.payment_method,
          payment_status: 'completed',
          status: 'completed',
          notes: saleData.notes || '',
          branch_id: this.getBranchId(),
          user_id: this.getUserId(),
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = saleData.items.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        discount: item.discount || 0,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of saleData.items) {
        await supabase
          .from('products')
          .update({ 
            stock_quantity: supabase.raw(`stock_quantity - ${item.quantity}`)
          })
          .eq('id', item.product_id)
          .eq('branch_id', this.getBranchId());
      }

      return {
        data: sale,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create sale',
        loading: false,
      };
    }
  }

  // Refund Operations
  static async getRefunds(filters?: {
    search?: string;
    status?: 'all' | 'pending' | 'completed' | 'cancelled';
    refund_method?: 'all' | 'cash' | 'card' | 'bank_transfer';
    date_from?: string;
    date_to?: string;
    sortBy?: 'refund_date' | 'refund_amount' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<Refund[]>> {
    try {
      let query = supabase
        .from('refunds')
        .select(`
          *,
          sales(sale_number),
          customers(name)
        `)
        .eq('branch_id', this.getBranchId());

      // Apply filters
      if (filters?.search) {
        query = query.or(`refund_reason.ilike.%${filters.search}%,customers.name.ilike.%${filters.search}%`);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.refund_method && filters.refund_method !== 'all') {
        query = query.eq('refund_method', filters.refund_method);
      }

      if (filters?.date_from) {
        query = query.gte('refund_date', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('refund_date', filters.date_to);
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
        error: error instanceof Error ? error.message : 'Failed to fetch refunds',
        loading: false,
      };
    }
  }

  static async createRefund(refundData: CreateRefundData): Promise<ApiResponse<Refund>> {
    try {
      const { data, error } = await supabase
        .from('refunds')
        .insert({
          ...refundData,
          refund_date: new Date().toISOString(),
          status: 'completed',
          branch_id: this.getBranchId(),
          user_id: this.getUserId(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update sale payment status
      await supabase
        .from('sales')
        .update({ payment_status: 'refunded' })
        .eq('id', refundData.sale_id)
        .eq('branch_id', this.getBranchId());

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create refund',
        loading: false,
      };
    }
  }

  // POS Operations
  static async getActiveProducts(): Promise<ApiResponse<POSProduct[]>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('branch_id', this.getBranchId())
        .gt('stock_quantity', 0)
        .order('name');

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

  static async getActiveCustomers(): Promise<ApiResponse<POSCustomer[]>> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, status')
        .eq('status', 'active')
        .eq('branch_id', this.getBranchId())
        .order('name');

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch customers',
        loading: false,
      };
    }
  }

  // Statistics
  static async getSalesStats(): Promise<ApiResponse<SalesStats>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      // Get total sales and revenue
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('final_amount, created_at')
        .eq('branch_id', this.getBranchId())
        .eq('status', 'completed');

      if (salesError) throw salesError;

      // Get refunds
      const { data: refunds, error: refundsError } = await supabase
        .from('refunds')
        .select('refund_amount')
        .eq('branch_id', this.getBranchId())
        .eq('status', 'completed');

      if (refundsError) throw refundsError;

      const totalSales = sales?.length || 0;
      const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.final_amount || 0), 0) || 0;
      const totalRefunds = refunds?.length || 0;
      const refundAmount = refunds?.reduce((sum, refund) => sum + (refund.refund_amount || 0), 0) || 0;
      const netRevenue = totalRevenue - refundAmount;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Calculate today's stats
      const salesToday = sales?.filter(sale => 
        new Date(sale.created_at) >= today
      ).length || 0;
      const revenueToday = sales?.filter(sale => 
        new Date(sale.created_at) >= today
      ).reduce((sum, sale) => sum + (sale.final_amount || 0), 0) || 0;

      // Calculate this month's stats
      const salesThisMonth = sales?.filter(sale => 
        new Date(sale.created_at) >= thisMonth
      ).length || 0;
      const revenueThisMonth = sales?.filter(sale => 
        new Date(sale.created_at) >= thisMonth
      ).reduce((sum, sale) => sum + (sale.final_amount || 0), 0) || 0;

      return {
        data: {
          total_sales: totalSales,
          total_revenue: totalRevenue,
          total_refunds: totalRefunds,
          refund_amount: refundAmount,
          net_revenue: netRevenue,
          average_order_value: averageOrderValue,
          sales_today: salesToday,
          revenue_today: revenueToday,
          sales_this_month: salesThisMonth,
          revenue_this_month: revenueThisMonth,
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