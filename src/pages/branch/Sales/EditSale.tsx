import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiSearch,
  FiPackage,
} from "react-icons/fi";
import { useSupabaseQuery } from "../../../lib/hooks/useSupabaseQuery";
import { useAuthStore } from "../../../stores/authStore";
import { formatCurrency } from "../../../lib/utils";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard } from "../../../components/UI";

// Types
interface Sale {
  id: string;
  tenant_id: string;
  branch_id: string;
  customer_id?: string;
  transaction_number: string;
  sale_date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  notes?: string;
  cashier_id: string;
}

interface SaleItem {
  id?: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount?: number;
  product?: Product;
}

interface Product {
  id: string;
  name: string;
  price: number;
  cost_price: number;
  quantity: number;
  manufacturer?: string;
  description?: string;
  barcode?: string;
  category_id?: string;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

const EditSale: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Memoize filters to prevent infinite re-renders
  const saleFilters = useMemo(() => ({
    id: id === 'new' ? undefined : id,
    tenant_id: user?.tenant_id,
    branch_id: user?.branch_id
  }), [id, user?.tenant_id, user?.branch_id]);

  const productFilters = useMemo(() => ({
    branch_id: user?.branch_id,
    status: "active"
  }), [user?.branch_id]);

  const customerFilters = useMemo(() => ({
    branch_id: user?.branch_id
  }), [user?.branch_id]);

  // Form state
  const [formData, setFormData] = useState<Partial<Sale>>({
    sale_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    payment_status: 'completed',
    status: 'completed',
    subtotal: 0,
    tax: 0,
    discount: 0,
    total_amount: 0,
  });

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sale data for editing
  const {
    data: saleDataArray,
    loading: saleLoading,
  } = useSupabaseQuery<any[]>(
    "sales",
    `*,
     customer:customers(id, first_name, last_name, email, phone, address),
     cashier:users!sales_cashier_id_fkey(id, first_name, last_name, email),
     sale_items(
       id, sale_id, product_id, product_name, quantity, unit_price, total_price, cost_price, discount_amount,
       product:products(id, name, price, cost_price, quantity, manufacturer, description, barcode)
     )`,
    {
      filters: saleFilters,
      enabled: !!id && id !== 'new' && !!user?.tenant_id && !!user?.branch_id,
      useAdminClient: true
    }
  );

  const saleData = saleDataArray?.[0];

  // Debug logging
  useEffect(() => {
    if (saleData) {
      console.log("✅ EditSale data loaded:", saleData);
    }
  }, [saleData]);

  // Fetch products for item selection
  const {
    data: products = [],
  } = useSupabaseQuery<Product[]>(
    "products",
    "*",
    {
      filters: productFilters,
      useAdminClient: true
    }
  );

  // Fetch customers for selection
  const {
    data: customers = [],
  } = useSupabaseQuery<Customer[]>(
    "customers",
    "*",
    {
      filters: customerFilters,
      useAdminClient: true
    }
  );

  // Load sale data into form
  useEffect(() => {
    if (saleData) {
      setFormData({
        ...saleData,
        sale_date: saleData.sale_date.split('T')[0],
      });
      setSaleItems(saleData.sale_items || []);
      setSelectedCustomer(saleData.customer);
    }
  }, [saleData]);

  // Calculate totals
  useEffect(() => {
    const subtotal = saleItems.reduce((sum, item) => sum + item.total_price, 0);
    const discount = formData.discount || 0;
    const tax = formData.tax || 0;
    const total_amount = subtotal - discount + tax;

    setFormData(prev => ({
      ...prev,
      subtotal,
      total_amount,
    }));
  }, [saleItems, formData.discount, formData.tax]);

  const addSaleItem = (product: Product) => {
    const existingItemIndex = saleItems.findIndex(item => item.product_id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedItems = [...saleItems];
      const currentQty = updatedItems[existingItemIndex].quantity;
      if (currentQty < product.quantity) {
        updatedItems[existingItemIndex].quantity += 1;
        updatedItems[existingItemIndex].total_price = 
          updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unit_price;
        setSaleItems(updatedItems);
      }
    } else {
      // Add new item
      const newItem: SaleItem = {
        sale_id: id || '',
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
        total_price: product.price,
        product,
      };
      setSaleItems([...saleItems, newItem]);
    }
    setSearchTerm("");
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...saleItems];
    const item = updatedItems[index];
    const maxQuantity = item.product?.quantity || 0;
    
    if (quantity > 0 && quantity <= maxQuantity) {
      updatedItems[index].quantity = quantity;
      updatedItems[index].total_price = quantity * item.unit_price;
      setSaleItems(updatedItems);
    }
  };

  const removeItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { supabaseAdmin } = await import("../../../lib/supabase/supabaseClient");
      
      console.log("🔄 Starting sale update/creation...");
      console.log("📊 Form data:", formData);
      console.log("🛒 Sale items:", saleItems);

      const salePayload = {
        ...formData,
        customer_id: selectedCustomer?.id || null,
        tenant_id: user?.tenant_id,
        branch_id: user?.branch_id,
      };

      let saleId = id;

      if (id === 'new') {
        // Create new sale - using service role to bypass RLS
        const { data: newSale, error: saleError } = await supabaseAdmin
          .from("sales")
          .insert([{
            ...salePayload,
            cashier_id: user?.id,
            transaction_number: `SALE-${Date.now()}`,
            status: 'completed',
          }])
          .select()
          .single();

        if (saleError) throw saleError;
        saleId = newSale.id;
      } else {
        // Update existing sale - only update editable fields
        const updatePayload = {
          sale_date: salePayload.sale_date,
          customer_id: salePayload.customer_id,
          subtotal: salePayload.subtotal,
          tax: salePayload.tax,
          discount: salePayload.discount,
          total_amount: salePayload.total_amount,
          payment_method: salePayload.payment_method,
          payment_status: salePayload.payment_status,
          status: salePayload.status,
          notes: salePayload.notes,
        };

        console.log("📝 Updating sale with payload:", updatePayload);
        
        const { error: saleError } = await supabaseAdmin
          .from("sales")
          .update(updatePayload)
          .eq("id", id);

        if (saleError) {
          console.error("❌ Sale update error:", saleError);
          throw saleError;
        }
        
        console.log("✅ Sale updated successfully");

        // Delete existing sale items - using service role to bypass RLS
        await supabaseAdmin
          .from("sale_items")
          .delete()
          .eq("sale_id", id);
      }

      // Insert sale items
      if (saleItems.length > 0) {
        const itemsPayload = saleItems.map(item => ({
          sale_id: saleId,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          discount_amount: item.discount || 0, // Use correct field name from schema
        }));

        const { error: itemsError } = await supabaseAdmin
          .from("sale_items")
          .insert(itemsPayload);

        if (itemsError) throw itemsError;

        // Update product quantities - using service role to bypass RLS
        for (const item of saleItems) {
          const newQuantity = (item.product?.quantity || 0) - item.quantity;
          await supabaseAdmin
            .from("products")
            .update({ quantity: Math.max(0, newQuantity) })
            .eq("id", item.product_id);
        }
      }

      navigate(`/branch/sales/view/${saleId}`);
    } catch (error) {
      console.error("Error saving sale:", error);
      setError(error instanceof Error ? error.message : "Failed to save sale");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = (products || []).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (saleLoading) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sale data...</p>
          </div>
        </div>
      </BranchDashboardLayout>
    );
  }

  return (
    <BranchDashboardLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => navigate("/branch/sales")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {id === 'new' ? 'Create New Sale' : 'Edit Sale'}
              </h1>
              <p className="text-gray-600 mt-1">
                {id === 'new' ? 'Add items and complete the sale' : 'Modify sale details and items'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={isLoading || saleItems.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Sale'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sale Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Search */}
            <ContentCard title="Add Products">
              <div className="space-y-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {searchTerm && (
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addSaleItem(product)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">
                              {product.manufacturer} • Stock: {product.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-emerald-600">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredProducts.length === 0 && (
                      <p className="px-4 py-3 text-gray-500 text-center">No products found</p>
                    )}
                  </div>
                )}
              </div>
            </ContentCard>

            {/* Sale Items */}
            <ContentCard title="Sale Items">
              {saleItems.length === 0 ? (
                <div className="text-center py-12">
                  <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items added</h3>
                  <p className="text-gray-600">Search and add products to create a sale.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {saleItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.product_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.product?.manufacturer}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(index, item.quantity - 1)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <FiMinus className="h-4 w-4" />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                                className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                                min="1"
                                max={item.product?.quantity || 0}
                              />
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <FiPlus className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(item.total_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ContentCard>
          </div>

          {/* Sale Details Sidebar */}
          <div className="space-y-6">
            {/* Customer Selection */}
            <ContentCard title="Customer">
              <div className="space-y-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {selectedCustomer && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedCustomer.first_name} {selectedCustomer.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {customerSearchTerm && !selectedCustomer && (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {(customers || []).map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerSearchTerm("");
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{customer.phone}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ContentCard>

            {/* Sale Details */}
            <ContentCard title="Sale Details">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Date
                  </label>
                  <input
                    type="date"
                    value={formData.sale_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, sale_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tax || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
            </ContentCard>

            {/* Payment Summary */}
            <ContentCard title="Payment Summary">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(formData.subtotal || 0)}
                  </span>
                </div>
                
                {(formData.discount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount</span>
                    <span className="text-sm font-medium text-red-600">
                      -{formatCurrency(formData.discount || 0)}
                    </span>
                  </div>
                )}
                
                {(formData.tax || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(formData.tax || 0)}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total Amount</span>
                    <span className="text-base font-bold text-emerald-600">
                      {formatCurrency(formData.total_amount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </ContentCard>
          </div>
        </div>
      </form>
    </BranchDashboardLayout>
  );
};

export default EditSale;
