import { supabase } from '../../../../lib/supabase/supabaseClient';

// API Response interface
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Types aligned with database schema
export interface Purchase {
  id: string;
  tenant_id: string;
  branch_id: string;
  supplier_id: string;
  purchase_number: string;
  purchase_date: string;
  expected_delivery_date?: string;
  delivery_date?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  payment_method?: 'cash' | 'bank_transfer' | 'credit' | 'mobile_money';
  payment_status: 'pending' | 'partial' | 'completed' | 'cancelled';
  status: 'pending' | 'ordered' | 'received' | 'cancelled' | 'returned';
  notes?: string;
  created_by: string;
  received_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  supplier?: Supplier;
  purchase_items?: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  received_quantity: number;
  expiry_date?: string;
  batch_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  product?: Product;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost_price: number;
  quantity: number;
}

export interface CreatePurchaseData {
  supplier_id: string;
  expected_delivery_date?: string;
  payment_method?: 'cash' | 'bank_transfer' | 'credit' | 'mobile_money';
  discount?: number;
  notes?: string;
  items: CreatePurchaseItemData[];
}

export interface CreatePurchaseItemData {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  expiry_date?: string;
  batch_number?: string;
  notes?: string;
}

export interface UpdatePurchaseData extends Partial<CreatePurchaseData> {
  id: string;
  status?: 'pending' | 'ordered' | 'received' | 'cancelled' | 'returned';
  payment_status?: 'pending' | 'partial' | 'completed' | 'cancelled';
  delivery_date?: string;
  received_by?: string;
}

export interface PurchaseFilters {
  search?: string;
  status?: 'all' | 'pending' | 'ordered' | 'received' | 'cancelled' | 'returned';
  payment_status?: 'all' | 'pending' | 'partial' | 'completed' | 'cancelled';
  supplier_id?: string;
  date_from?: string;
  date_to?: string;
  sortBy?: 'purchase_date' | 'total_amount' | 'purchase_number' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export class PurchaseService {
  private static getContext() {
    // In a real implementation, this would get context from auth store
    // Import useAuthStore here would require changing to a hook-based approach
    // For now, this will be passed as parameters or handled in the components
    // This is a temporary implementation that should be updated to use actual auth context
    if (typeof window !== 'undefined') {
      // Access from window if available (set by auth store)
      const authContext = (window as any).__auth_context__;
      if (authContext) {
        return authContext;
      }
    }
    
    // Fallback - this should not be used in production
    return {
      tenant_id: 'tenant-123',
      branch_id: 'branch-123',
      user_id: 'user-123'
    };
  }

  // Generate unique purchase number
  private static generatePurchaseNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PO${year}${month}${random}`;
  }

  // Get all purchases with filters
  static async getPurchases(filters?: PurchaseFilters): Promise<ApiResponse<Purchase[]>> {
    try {
      const { tenant_id, branch_id } = this.getContext();
      
      let query = supabase
        .from('purchases')
        .select(`
          *,
          supplier:suppliers(
            id,
            name,
            contact_person,
            email,
            phone,
            address,
            status
          ),
          purchase_items:purchase_items(
            *,
            product:products(
              id,
              name,
              price,
              cost_price,
              quantity
            )
          )
        `)
        .eq('tenant_id', tenant_id)
        .eq('branch_id', branch_id);

      // Apply filters
      if (filters?.search) {
        query = query.or(`purchase_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.payment_status && filters.payment_status !== 'all') {
        query = query.eq('payment_status', filters.payment_status);
      }

      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }

      if (filters?.date_from) {
        query = query.gte('purchase_date', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('purchase_date', filters.date_to);
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
        error: error instanceof Error ? error.message : 'Failed to fetch purchases',
        loading: false,
      };
    }
  }

  // Get purchase by ID
  static async getPurchaseById(id: string): Promise<ApiResponse<Purchase>> {
    try {
      const { tenant_id, branch_id } = this.getContext();

      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          supplier:suppliers(
            id,
            name,
            contact_person,
            email,
            phone,
            address,
            status
          ),
          purchase_items:purchase_items(
            *,
            product:products(
              id,
              name,
              price,
              cost_price,
              quantity
            )
          )
        `)
        .eq('id', id)
        .eq('tenant_id', tenant_id)
        .eq('branch_id', branch_id)
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
        error: error instanceof Error ? error.message : 'Failed to fetch purchase',
        loading: false,
      };
    }
  }

  // Create new purchase
  static async createPurchase(purchaseData: CreatePurchaseData): Promise<ApiResponse<Purchase>> {
    try {
      const { tenant_id, branch_id, user_id } = this.getContext();

      // Calculate totals
      const subtotal = purchaseData.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
      const tax = Math.round(subtotal * 0.18); // 18% VAT
      const discount = purchaseData.discount || 0;
      const total_amount = subtotal + tax - discount;

      // Create purchase record
      const purchasePayload = {
        tenant_id,
        branch_id,
        supplier_id: purchaseData.supplier_id,
        purchase_number: this.generatePurchaseNumber(),
        purchase_date: new Date().toISOString(),
        expected_delivery_date: purchaseData.expected_delivery_date,
        subtotal,
        tax,
        discount,
        total_amount,
        payment_method: purchaseData.payment_method,
        payment_status: 'pending' as const,
        status: 'pending' as const,
        notes: purchaseData.notes,
        created_by: user_id,
      };

      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert(purchasePayload)
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Create purchase items
      if (purchaseData.items.length > 0) {
        const itemsPayload = purchaseData.items.map(item => ({
          purchase_id: purchase.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.quantity * item.unit_cost,
          received_quantity: 0,
          expiry_date: item.expiry_date,
          batch_number: item.batch_number,
          notes: item.notes,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_items')
          .insert(itemsPayload);

        if (itemsError) throw itemsError;
      }

      // Fetch the complete purchase with relations
      return this.getPurchaseById(purchase.id);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create purchase',
        loading: false,
      };
    }
  }

  // Update purchase
  static async updatePurchase(purchaseData: UpdatePurchaseData): Promise<ApiResponse<Purchase>> {
    try {
      const { tenant_id, branch_id, user_id } = this.getContext();

      // Calculate totals if items are provided
      let updatePayload: any = {
        supplier_id: purchaseData.supplier_id,
        expected_delivery_date: purchaseData.expected_delivery_date,
        payment_method: purchaseData.payment_method,
        payment_status: purchaseData.payment_status,
        status: purchaseData.status,
        notes: purchaseData.notes,
        delivery_date: purchaseData.delivery_date,
        received_by: purchaseData.received_by,
        updated_at: new Date().toISOString(),
      };

      if (purchaseData.items) {
        const subtotal = purchaseData.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
        const tax = Math.round(subtotal * 0.18);
        const discount = purchaseData.discount || 0;
        updatePayload = {
          ...updatePayload,
          subtotal,
          tax,
          discount: discount,
          total_amount: subtotal + tax - discount,
        };
      }

      // Update purchase
      const { error: purchaseError } = await supabase
        .from('purchases')
        .update(updatePayload)
        .eq('id', purchaseData.id)
        .eq('tenant_id', tenant_id)
        .eq('branch_id', branch_id);

      if (purchaseError) throw purchaseError;

      // Update items if provided
      if (purchaseData.items) {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('purchase_items')
          .delete()
          .eq('purchase_id', purchaseData.id);

        if (deleteError) throw deleteError;

        // Insert new items
        const itemsPayload = purchaseData.items.map(item => ({
          purchase_id: purchaseData.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.quantity * item.unit_cost,
          received_quantity: 0,
          expiry_date: item.expiry_date,
          batch_number: item.batch_number,
          notes: item.notes,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_items')
          .insert(itemsPayload);

        if (itemsError) throw itemsError;
      }

      // If status changed to received, update stock levels
      if (purchaseData.status === 'received' && purchaseData.items) {
        await this.updateStockLevels(purchaseData.items);
      }

      // Return updated purchase
      return this.getPurchaseById(purchaseData.id);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update purchase',
        loading: false,
      };
    }
  }

  // Delete purchase
  static async deletePurchase(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { tenant_id, branch_id } = this.getContext();

      // Delete purchase items first (cascade)
      const { error: itemsError } = await supabase
        .from('purchase_items')
        .delete()
        .eq('purchase_id', id);

      if (itemsError) throw itemsError;

      // Delete purchase
      const { error: purchaseError } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenant_id)
        .eq('branch_id', branch_id);

      if (purchaseError) throw purchaseError;

      return {
        data: true,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete purchase',
        loading: false,
      };
    }
  }

  // Mark purchase as received
  static async markAsReceived(id: string, receivedItems: { product_id?: string; received_quantity: number }[]): Promise<ApiResponse<Purchase>> {
    try {
      const { user_id } = this.getContext();

      // Update purchase status
      const { error: purchaseError } = await supabase
        .from('purchases')
        .update({
          status: 'received',
          delivery_date: new Date().toISOString(),
          received_by: user_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (purchaseError) throw purchaseError;

      // Update received quantities for items
      for (const item of receivedItems) {
        if (item.product_id) {
          const { error: itemError } = await supabase
            .from('purchase_items')
            .update({ received_quantity: item.received_quantity })
            .eq('purchase_id', id)
            .eq('product_id', item.product_id);

          if (itemError) throw itemError;
        }
      }

      // Update stock levels
      await this.updateStockLevels(receivedItems.map(item => ({
        product_id: item.product_id,
        quantity: item.received_quantity,
        unit_cost: 0, // Will be updated separately
        product_name: '', // Will be updated separately
      })));

      return this.getPurchaseById(id);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to mark purchase as received',
        loading: false,
      };
    }
  }

  // Private helper to update stock levels
  private static async updateStockLevels(items: CreatePurchaseItemData[]): Promise<void> {
    const { tenant_id, branch_id } = this.getContext();

    for (const item of items) {
      if (item.product_id) {
        // Get current product stock
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', item.product_id)
          .eq('tenant_id', tenant_id)
          .eq('branch_id', branch_id)
          .single();

        if (productError) continue; // Skip if product not found

        // Update stock quantity
        const newQuantity = (product.quantity || 0) + item.quantity;
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ quantity: newQuantity })
          .eq('id', item.product_id)
          .eq('tenant_id', tenant_id)
          .eq('branch_id', branch_id);

        if (updateError) {
          console.error('Failed to update stock for product:', item.product_id, updateError);
        }
      }
    }
  }

  // Get suppliers for dropdown
  static async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    try {
      const { tenant_id, branch_id } = this.getContext();

      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, contact_person, email, phone, address, status')
        .eq('tenant_id', tenant_id)
        .or(`branch_id.eq.${branch_id},branch_id.is.null`) // Include both branch-specific and global suppliers
        .eq('status', 'active')
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
        error: error instanceof Error ? error.message : 'Failed to fetch suppliers',
        loading: false,
      };
    }
  }

  // Get products for purchase items
  static async getProducts(search?: string): Promise<ApiResponse<Product[]>> {
    try {
      const { tenant_id, branch_id } = this.getContext();

      let query = supabase
        .from('products')
        .select('id, name, price, cost_price, quantity')
        .eq('tenant_id', tenant_id)
        .eq('branch_id', branch_id)
        .eq('status', 'active');

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      query = query.order('name').limit(50);

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
} 