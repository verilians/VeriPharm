import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiSearch,
  FiPackage,
  FiDollarSign,
  FiCalendar,
  FiTruck,
  FiFileText,
} from "react-icons/fi";
import { useAuthStore } from "../../../stores/authStore";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard } from "../../../components/UI";

// Types
interface Product {
  id: string;
  name: string;
  sku: string;
  unit_price: number;
  category: string;
  manufacturer: string;
  unit_of_measure: string;
}

interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  payment_terms?: number;
}

interface PurchaseOrderItem {
  id?: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface PurchaseOrder {
  id?: string;
  tenant_id: string;
  branch_id: string;
  supplier_id: string;
  supplier?: Supplier;
  order_number: string;
  order_date: string;
  expected_delivery_date?: string;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const EditPurchaseOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Form state
  const [formData, setFormData] = useState<PurchaseOrder>({
    tenant_id: user?.tenant_id || '',
    branch_id: user?.branch_id || '',
    supplier_id: '',
    order_number: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    status: 'pending',
    subtotal: 0,
    tax: 0,
    discount: 0,
    total_amount: 0,
    notes: '',
  });

  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [purchaseOrderLoading, setPurchaseOrderLoading] = useState(false);

  // Fetch purchase order data for editing
  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      if (!id || id === 'new' || !user?.tenant_id || !user?.branch_id) return;
      
      setPurchaseOrderLoading(true);
      try {
        const { supabase } = await import("../../../lib/supabase/supabaseClient");
        
        const { data, error } = await supabase
          .from("purchases")
          .select(`
            *,
            supplier:suppliers(*),
            purchase_items:purchase_items(
              *,
              product:products(*)
            )
          `)
          .eq("id", id)
          .eq("tenant_id", user?.tenant_id)
          .eq("branch_id", user?.branch_id)
          .single();

        if (error) throw error;
        
        if (data) {
          setFormData(prev => ({
            ...prev,
            ...data,
            order_date: data.order_date ? data.order_date.split('T')[0] : '',
            expected_delivery_date: data.expected_delivery_date ? data.expected_delivery_date.split('T')[0] : '',
          }));

          if (data.purchase_items) {
            setOrderItems(data.purchase_items.map((item: any) => ({
              id: item.id,
              product_id: item.product_id,
              product: item.product,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.quantity * item.unit_price,
            })));
          }
        }
      } catch (error) {
        console.error("Error fetching purchase order:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch purchase order");
      } finally {
        setPurchaseOrderLoading(false);
      }
    };

    fetchPurchaseOrder();
  }, [id, user?.tenant_id, user?.branch_id]);

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!user?.tenant_id || !user?.branch_id) return;

      try {
        const { supabase } = await import("../../../lib/supabase/supabaseClient");
        
        const { data, error } = await supabase
          .from("suppliers")
          .select("*")
          .eq("tenant_id", user.tenant_id)
          .eq("branch_id", user.branch_id)
          .eq("status", "active")
          .order("name");

        if (error) throw error;
        setSuppliers(data || []);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, [user?.tenant_id, user?.branch_id]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.tenant_id || !user?.branch_id) return;

      try {
        const { supabase } = await import("../../../lib/supabase/supabaseClient");
        
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("tenant_id", user.tenant_id)
          .eq("branch_id", user.branch_id)
          .order("name");

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [user?.tenant_id, user?.branch_id]);

  // Generate order number for new orders
  useEffect(() => {
    if (id === 'new' && !formData.order_number) {
      const orderNumber = `PO-${Date.now()}`;
      setFormData(prev => ({ ...prev, order_number: orderNumber }));
    }
  }, [id, formData.order_number]);

  // Calculate totals when items change
  useEffect(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    const tax = subtotal * 0.15; // 15% tax rate
    const total = subtotal + tax - formData.discount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax,
      total_amount: Math.max(0, total),
    }));
  }, [orderItems, formData.discount]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.supplier_id) {
      errors.supplier_id = 'Please select a supplier';
    }

    if (!formData.order_number.trim()) {
      errors.order_number = 'Order number is required';
    }

    if (!formData.order_date) {
      errors.order_date = 'Order date is required';
    }

    if (orderItems.length === 0) {
      errors.items = 'At least one item is required';
    }

    if (orderItems.some(item => item.quantity <= 0)) {
      errors.items = 'All item quantities must be greater than 0';
    }

    if (formData.discount < 0) {
      errors.discount = 'Discount cannot be negative';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof PurchaseOrder, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddItem = () => {
    const newItem: PurchaseOrderItem = {
      product_id: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };
    setOrderItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    setOrderItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'product_id') {
        const product = products.find(p => p.id === value);
        if (product) {
          item.product_id = product.id;
          item.product = product;
          item.unit_price = product.unit_price;
        }
      } else {
        (item as any)[field] = value;
      }

      // Recalculate total price
      item.total_price = item.quantity * item.unit_price;
      updated[index] = item;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { supabase } = await import("../../../lib/supabase/supabaseClient");

      const purchaseOrderPayload = {
        ...formData,
        tenant_id: user?.tenant_id,
        branch_id: user?.branch_id,
      };

      if (id === 'new') {
        // Create new purchase order
        const { data: newPurchaseOrder, error: purchaseOrderError } = await supabase
          .from("purchases")
          .insert([purchaseOrderPayload])
          .select()
          .single();

        if (purchaseOrderError) throw purchaseOrderError;

        // Create purchase order items
        if (orderItems.length > 0) {
          const itemsPayload = orderItems.map(item => ({
            purchase_id: newPurchaseOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tenant_id: user?.tenant_id,
            branch_id: user?.branch_id,
          }));

          const { error: itemsError } = await supabase
            .from("purchase_items")
            .insert(itemsPayload);

          if (itemsError) throw itemsError;
        }

        navigate(`/branch/purchases/view/${newPurchaseOrder.id}`);
      } else {
        // Update existing purchase order
        const { error: purchaseOrderError } = await supabase
          .from("purchases")
          .update(purchaseOrderPayload)
          .eq("id", id)
          .eq("tenant_id", user?.tenant_id)
          .eq("branch_id", user?.branch_id);

        if (purchaseOrderError) throw purchaseOrderError;

        // Delete existing items
        const { error: deleteError } = await supabase
          .from("purchase_items")
          .delete()
          .eq("purchase_id", id)
          .eq("tenant_id", user?.tenant_id)
          .eq("branch_id", user?.branch_id);

        if (deleteError) throw deleteError;

        // Insert updated items
        if (orderItems.length > 0) {
          const itemsPayload = orderItems.map(item => ({
            purchase_id: id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tenant_id: user?.tenant_id,
            branch_id: user?.branch_id,
          }));

          const { error: itemsError } = await supabase
            .from("purchase_items")
            .insert(itemsPayload);

          if (itemsError) throw itemsError;
        }

        navigate(`/branch/purchases/view/${id}`);
      }
    } catch (error) {
      console.error("Error saving purchase order:", error);
      setError(error instanceof Error ? error.message : "Failed to save purchase order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || id === 'new') return;

    if (!confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const { supabase } = await import("../../../lib/supabase/supabaseClient");

      // Delete items first (foreign key constraint)
      const { error: itemsError } = await supabase
        .from("purchase_items")
        .delete()
        .eq("purchase_id", id)
        .eq("tenant_id", user?.tenant_id)
        .eq("branch_id", user?.branch_id);

      if (itemsError) throw itemsError;

      // Delete purchase order
      const { error } = await supabase
        .from("purchases")
        .delete()
        .eq("id", id)
        .eq("tenant_id", user?.tenant_id)
        .eq("branch_id", user?.branch_id);

      if (error) throw error;
      navigate("/branch/purchases");
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      setError(error instanceof Error ? error.message : "Failed to delete purchase order");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
  );

  if (purchaseOrderLoading) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading purchase order data...</p>
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
              onClick={() => navigate("/branch/purchases")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {id === 'new' ? 'Create Purchase Order' : 'Edit Purchase Order'}
              </h1>
              <p className="text-gray-600 mt-1">
                {id === 'new' ? 'Create a new purchase order' : 'Update purchase order details'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {id !== 'new' && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                Delete
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Purchase Order'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <ContentCard title="Order Information">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    value={formData.order_number}
                    onChange={(e) => handleInputChange('order_number', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      validationErrors.order_number ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter order number"
                    disabled={id !== 'new'}
                  />
                  {validationErrors.order_number && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.order_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Date *
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="date"
                      value={formData.order_date}
                      onChange={(e) => handleInputChange('order_date', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        validationErrors.order_date ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {validationErrors.order_date && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.order_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Delivery Date
                  </label>
                  <div className="relative">
                    <FiTruck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="date"
                      value={formData.expected_delivery_date || ''}
                      onChange={(e) => handleInputChange('expected_delivery_date', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ContentCard>

          {/* Supplier Information */}
          <ContentCard title="Supplier Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier *
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={supplierSearchTerm}
                    onChange={(e) => setSupplierSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Search suppliers..."
                  />
                </div>
                {validationErrors.supplier_id && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.supplier_id}</p>
                )}
              </div>

              {supplierSearchTerm && (
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredSuppliers.map((supplier) => (
                    <button
                      key={supplier.id}
                      type="button"
                      onClick={() => {
                        handleInputChange('supplier_id', supplier.id);
                        setSupplierSearchTerm(supplier.name);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{supplier.name}</div>
                      {supplier.contact_person && (
                        <div className="text-sm text-gray-600">Contact: {supplier.contact_person}</div>
                      )}
                      {supplier.email && (
                        <div className="text-sm text-gray-600">{supplier.email}</div>
                      )}
                    </button>
                  ))}
                  {filteredSuppliers.length === 0 && (
                    <div className="px-4 py-3 text-gray-500 text-center">No suppliers found</div>
                  )}
                </div>
              )}

              {formData.supplier_id && !supplierSearchTerm && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-sm font-medium text-emerald-800">
                    Supplier Selected: {suppliers.find(s => s.id === formData.supplier_id)?.name}
                  </div>
                </div>
              )}
            </div>
          </ContentCard>
        </div>

        {/* Order Items */}
        <ContentCard title="Order Items">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-gray-900">Items</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
              >
                <FiPlus className="mr-1 h-4 w-4" />
                Add Item
              </button>
            </div>

            {validationErrors.items && (
              <p className="text-sm text-red-600">{validationErrors.items}</p>
            )}

            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product
                      </label>
                      <select
                        value={item.product_id}
                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.sku}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                        ${item.total_price.toFixed(2)}
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="w-full p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiMinus className="h-4 w-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {orderItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FiPackage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No items added yet. Click "Add Item" to get started.</p>
                </div>
              )}
            </div>
          </div>
        </ContentCard>

        {/* Order Summary & Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContentCard title="Order Summary">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (15%):</span>
                <span className="font-medium">${formData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount:</span>
                <div className="flex items-center space-x-2">
                  <FiDollarSign className="h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                    className={`w-24 px-2 py-1 border rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      validationErrors.discount ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
              {validationErrors.discount && (
                <p className="text-sm text-red-600">{validationErrors.discount}</p>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-emerald-600">${formData.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </ContentCard>

          <ContentCard title="Notes">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <div className="relative">
                <FiFileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={6}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter any additional notes for this purchase order..."
                />
              </div>
            </div>
          </ContentCard>
        </div>
      </form>
    </BranchDashboardLayout>
  );
};

export default EditPurchaseOrder;
