import { supabaseAdmin } from '../../../../lib/supabase/supabaseClient';
import type {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerSale,
  CustomerStats,
  ApiResponse,
  CustomerFilters,
} from '../types';

export class CustomerService {
  private static getBranchId(): string {
    // In a real app, this would come from auth context
    return 'branch-123'; // Replace with actual branch ID
  }

  private static getTenantId(): string {
    // In a real app, this would come from auth context
    return 'tenant-123'; // Replace with actual tenant ID
  }

  // Customer CRUD Operations
  static async getCustomers(filters?: CustomerFilters): Promise<ApiResponse<Customer[]>> {
    try {
      let query = supabaseAdmin
        .from('customers')
        .select(`
          id,
          tenant_id,
          branch_id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          country,
          date_of_birth,
          gender,
          registration_date,
          status,
          total_purchases,
          total_spent,
          last_purchase_date,
          loyalty_points,
          notes,
          created_by,
          created_at,
          updated_at
        `)
        .eq('branch_id', this.getBranchId())
        .eq('tenant_id', this.getTenantId());

      // Apply filters
      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.gender && filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
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
        error: error instanceof Error ? error.message : 'Failed to fetch customers',
        loading: false,
      };
    }
  }

  static async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('customers')
        .select(`
          id,
          tenant_id,
          branch_id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          country,
          date_of_birth,
          gender,
          registration_date,
          status,
          total_purchases,
          total_spent,
          last_purchase_date,
          loyalty_points,
          notes,
          created_by,
          created_at,
          updated_at
        `)
        .eq('id', id)
        .eq('branch_id', this.getBranchId())
        .eq('tenant_id', this.getTenantId())
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
        error: error instanceof Error ? error.message : 'Failed to fetch customer',
        loading: false,
      };
    }
  }

  static async createCustomer(customerData: CreateCustomerData): Promise<ApiResponse<Customer>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('customers')
        .insert({
          ...customerData,
          tenant_id: this.getTenantId(),
          branch_id: this.getBranchId(),
          created_by: 'user-id', // Replace with actual user ID from auth context
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
        error: error instanceof Error ? error.message : 'Failed to create customer',
        loading: false,
      };
    }
  }

  static async updateCustomer(id: string, customerData: UpdateCustomerData): Promise<ApiResponse<Customer>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('customers')
        .update({
          ...customerData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('branch_id', this.getBranchId())
        .eq('tenant_id', this.getTenantId())
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
        error: error instanceof Error ? error.message : 'Failed to update customer',
        loading: false,
      };
    }
  }

  static async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    try {
      // Check if customer has associated sales
      const { data: sales, error: salesError } = await supabaseAdmin
        .from('sales')
        .select('id')
        .eq('customer_id', id)
        .eq('branch_id', this.getBranchId())
        .eq('tenant_id', this.getTenantId());

      if (salesError) throw salesError;

      if (sales && sales.length > 0) {
        return {
          data: null,
          error: 'Cannot delete customer with existing sales records',
          loading: false,
        };
      }

      const { error } = await supabaseAdmin
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('branch_id', this.getBranchId())
        .eq('tenant_id', this.getTenantId());

      if (error) throw error;

      return {
        data: null,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete customer',
        loading: false,
      };
    }
  }

  // Customer Sales Operations
  static async getCustomerSales(customerId: string): Promise<ApiResponse<CustomerSale[]>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('sales')
        .select('*')
        .eq('customer_id', customerId)
        .eq('branch_id', this.getBranchId())
        .eq('tenant_id', this.getTenantId())
        .order('sale_date', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch customer sales',
        loading: false,
      };
    }
  }

  static async createCustomerSale(saleData: any): Promise<ApiResponse<CustomerSale>> {
    try {
      // Generate sale number
      const saleNumber = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabaseAdmin
        .from('sales')
        .insert({
          ...saleData,
          sale_number: saleNumber,
          sale_date: new Date().toISOString(),
          status: 'completed',
          branch_id: this.getBranchId(),
          tenant_id: this.getTenantId(),
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
        error: error instanceof Error ? error.message : 'Failed to create sale',
        loading: false,
      };
    }
  }

  // Statistics
  static async getCustomerStats(): Promise<ApiResponse<CustomerStats>> {
    try {
      // Get total customers
      const { data: customers, error: customersError } = await supabaseAdmin
        .from('customers')
        .select('id, status, created_at')
        .eq('branch_id', this.getBranchId())
        .eq('tenant_id', this.getTenantId());

      if (customersError) throw customersError;

      // Get total sales and revenue
      const { data: sales, error: salesError } = await supabaseAdmin
        .from('sales')
        .select('total_amount')
        .eq('branch_id', this.getBranchId())
        .eq('tenant_id', this.getTenantId());

      if (salesError) throw salesError;

      const totalCustomers = customers?.length || 0;
      const activeCustomers = customers?.filter((c: { status: string }) => c.status === 'active').length || 0;
      const totalSales = sales?.length || 0;
      const totalRevenue = sales?.reduce((sum: number, sale: { total_amount: number }) => sum + (sale.total_amount || 0), 0) || 0;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Calculate new customers this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const newCustomersThisMonth = customers?.filter((c: { created_at: string }) => 
        new Date(c.created_at) >= thisMonth
      ).length || 0;

      return {
        data: {
          total_customers: totalCustomers,
          active_customers: activeCustomers,
          total_sales: totalSales,
          total_revenue: totalRevenue,
          average_order_value: averageOrderValue,
          new_customers_this_month: newCustomersThisMonth,
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

  // Product Operations (for sales)
  static async getActiveProducts(): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('branch_id', this.getBranchId())
        .eq('tenant_id', this.getTenantId())
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
} 