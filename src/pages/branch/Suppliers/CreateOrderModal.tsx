import React, { useState, useEffect } from "react";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiSave,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";
import { formatCurrency } from "../../../lib/utils";

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  cost_price?: number;
  quantity: number;
  category?: string;
  status: string;
  tenant_id: string;
  branch_id: string;
}

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface CreateOrderModalProps {
  supplierId: string;
  supplierName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  supplierId,
  supplierName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load products
  const loadProducts = async () => {
    if (!user) return;

    try {
      console.log("🔄 [CreateOrderModal] Loading products...");

      const { data: productsData, error: productsError } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('branch_id', (user as any).branch_id)
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (productsError) throw productsError;

      setProducts(productsData || []);
      console.log("✅ [CreateOrderModal] Products loaded:", productsData?.length);

    } catch (error) {
      console.error("❌ [CreateOrderModal] Error loading products:", error);
      setError("Failed to load products. Please try again.");
    }
  };

  // Load products on mount
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen, user]);

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    const existingItem = orderItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      // Update quantity
      const updatedItems = orderItems.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.unit_price }
          : item
      );
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.cost_price || product.price,
        total_price: product.cost_price || product.price,
      };
      setOrderItems([...orderItems, newItem]);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter(item => item.product_id !== productId));
    } else {
      const updatedItems = orderItems.map(item =>
        item.product_id === productId
          ? { ...item, quantity, total_price: quantity * item.unit_price }
          : item
      );
      setOrderItems(updatedItems);
    }
  };

  // Handle unit price change
  const handleUnitPriceChange = (productId: string, unitPrice: number) => {
    const updatedItems = orderItems.map(item =>
      item.product_id === productId
        ? { ...item, unit_price: unitPrice, total_price: item.quantity * unitPrice }
        : item
    );
    setOrderItems(updatedItems);
  };

  // Calculate total
  const totalAmount = orderItems.reduce((sum, item) => sum + item.total_price, 0);

  // Generate order number
  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `PO-${timestamp}`;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      setError("Please add at least one item to the order.");
      return;
    }

    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("💾 [CreateOrderModal] Creating purchase order...");

      const orderNumber = generateOrderNumber();

      // Create purchase order - using service role to bypass RLS
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from('purchases') // Use correct table name from schema
        .insert({
          purchase_number: orderNumber, // Use correct field name from schema
          supplier_id: supplierId,
          created_by: user.id, // Use correct field name from schema
          branch_id: (user as any).branch_id,
          tenant_id: (user as any).tenant_id,
          purchase_date: orderDate, // Use correct field name from schema
          expected_delivery_date: expectedDelivery || null, // Use correct field name from schema
          total_amount: totalAmount,
          status: 'pending',
          notes: notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItemsData = orderItems.map(item => ({
        purchase_id: orderData.id, // Use correct field name from schema
        product_id: item.product_id,
        product_name: item.product_name || 'Unknown Product', // Add required field from schema
        quantity: item.quantity,
        unit_cost: item.unit_price, // Use correct field name from schema
        total_cost: item.total_price, // Use correct field name from schema
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('purchase_items') // Use correct table name from schema
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      console.log("✅ [CreateOrderModal] Purchase order created successfully");
      setSuccess("Purchase order created successfully!");

      // Reset form
      setOrderItems([]);
      setOrderDate(new Date().toISOString().split('T')[0]);
      setExpectedDelivery("");
      setNotes("");

      // Close modal after delay
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(null);
      }, 1500);

    } catch (error) {
      console.error("❌ [CreateOrderModal] Error creating purchase order:", error);
      setError("Failed to create purchase order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Create Purchase Order
            </h3>
            <p className="text-sm text-gray-600">
              Create a new purchase order for {supplierName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <FiAlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <FiCheck className="h-5 w-5 text-green-600" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date *
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery
              </label>
              <input
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount
              </label>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Select Products</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        Cost: {formatCurrency(product.cost_price || product.price)}
                      </div>
                    </div>
                    <FiPlus className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          {orderItems.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Order Items</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderItems.map((item) => (
                      <tr key={item.product_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => handleUnitPriceChange(item.product_id, parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(item.total_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.product_id, 0)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Add any notes about this order..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || orderItems.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiSave className="h-4 w-4" />
              )}
              <span>{loading ? "Creating..." : "Create Order"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal; 