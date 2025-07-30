import React, { useState, useEffect, useCallback } from "react";
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
  FiAlertTriangle,
} from "react-icons/fi";
import { useAuthStore } from "../../../stores/authStore";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard } from "../../../components/UI";
import { PurchaseService } from "./services";
import type { 
  Purchase, 
  CreatePurchaseData, 
  CreatePurchaseItemData, 
  UpdatePurchaseData,
  Supplier,
  Product 
} from "./services";

interface FormData {
  supplier_id: string;
  expected_delivery_date: string;
  payment_method: 'cash' | 'bank_transfer' | 'credit' | 'mobile_money';
  discount: number;
  notes: string;
  items: CreatePurchaseItemData[];
}

const EditPurchaseOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEditing = id && id !== 'new';

  // Set auth context for service (temporary solution)
  useEffect(() => {
    if (user?.tenant_id && user?.branch_id) {
      (window as any).__auth_context__ = {
        tenant_id: user.tenant_id,
        branch_id: user.branch_id,
        user_id: user.id
      };
    }
  }, [user]);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    supplier_id: '',
    expected_delivery_date: '',
    payment_method: 'cash',
    discount: 0,
    notes: '',
    items: []
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [purchase, setPurchase] = useState<Purchase | null>(null);

  // Calculated totals
  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
  const tax = Math.round(subtotal * 0.18); // 18% VAT
  const total = subtotal + tax - formData.discount;

  // Load initial data
  useEffect(() => {
    loadSuppliers();
    loadProducts();
    if (isEditing) {
      loadPurchase();
    }
  }, [id]);

  const loadSuppliers = async () => {
    try {
      const response = await PurchaseService.getSuppliers();
      if (response.data) {
        setSuppliers(response.data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load suppliers');
    }
  };

  const loadProducts = async () => {
    try {
      const response = await PurchaseService.getProducts(searchTerm);
      if (response.data) {
        setProducts(response.data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load products');
    }
  };

  const loadPurchase = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const response = await PurchaseService.getPurchaseById(id);
      if (response.data) {
        const purchase = response.data;
        setPurchase(purchase);
        
        setFormData({
          supplier_id: purchase.supplier_id,
          expected_delivery_date: purchase.expected_delivery_date || '',
          payment_method: purchase.payment_method || 'cash',
          discount: purchase.discount,
          notes: purchase.notes || '',
          items: purchase.purchase_items?.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            expiry_date: item.expiry_date,
            batch_number: item.batch_number,
            notes: item.notes,
          })) || []
        });
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load purchase order');
    } finally {
      setIsLoading(false);
    }
  };

  // Search products with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.supplier_id) {
      errors.supplier_id = 'Please select a supplier';
    }

    if (formData.items.length === 0) {
      errors.items = 'At least one item is required';
    }

    formData.items.forEach((item, index) => {
      if (!item.product_name.trim()) {
        errors[`item_${index}_name`] = 'Product name is required';
      }
      if (item.quantity <= 0) {
        errors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unit_cost <= 0) {
        errors[`item_${index}_cost`] = 'Unit cost must be greater than 0';
      }
    });

    if (formData.discount < 0) {
      errors.discount = 'Discount cannot be negative';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
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
    const newItem: CreatePurchaseItemData = {
      product_name: '',
      quantity: 1,
      unit_cost: 0,
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: keyof CreatePurchaseItemData, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));

    // Clear validation errors for this item
    const errorKeys = Object.keys(validationErrors).filter(key => 
      key.startsWith(`item_${index}_`)
    );
    if (errorKeys.length > 0) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        errorKeys.forEach(key => delete newErrors[key]);
        return newErrors;
      });
    }
  };

  const handleProductSelect = (index: number, product: Product) => {
    handleItemChange(index, 'product_id', product.id);
    handleItemChange(index, 'product_name', product.name);
    handleItemChange(index, 'unit_cost', product.cost_price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (isEditing && id) {
        // Update existing purchase
        const updateData: UpdatePurchaseData = {
          id,
          ...formData,
        };

        const response = await PurchaseService.updatePurchase(updateData);
        if (response.data) {
          navigate(`/branch/purchases/view/${id}`);
        } else if (response.error) {
          setError(response.error);
        }
      } else {
        // Create new purchase
        const createData: CreatePurchaseData = formData;
        const response = await PurchaseService.createPurchase(createData);
        
        if (response.data) {
          navigate(`/branch/purchases/view/${response.data.id}`);
        } else if (response.error) {
          setError(response.error);
        }
      }
    } catch (err) {
      setError('Failed to save purchase order');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !id) return;
    
    if (!confirm('Are you sure you want to delete this purchase order?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await PurchaseService.deletePurchase(id);
      if (response.data) {
        navigate('/branch/purchases');
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to delete purchase order');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading purchase order...</p>
          </div>
        </div>
      </BranchDashboardLayout>
    );
  }

  return (
    <BranchDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/branch/purchases')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Purchase Order' : 'New Purchase Order'}
              </h1>
              {purchase && (
                <p className="text-sm text-gray-600">
                  {purchase.purchase_number} • {purchase.status}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                <FiTrash2 className="w-4 h-4 mr-2 inline" />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <FiAlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <ContentCard title="Purchase Order Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier *
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    validationErrors.supplier_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {validationErrors.supplier_id && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.supplier_id}</p>
                )}
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) => handleInputChange('expected_delivery_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => handleInputChange('payment_method', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit">Credit</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (UGX)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    validationErrors.discount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.discount && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.discount}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Additional notes about this purchase order..."
              />
            </div>
          </ContentCard>

          {/* Items */}
          <ContentCard title="Items">
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Item {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Product Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={item.product_name}
                          onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            validationErrors[`item_${index}_name`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter product name or search..."
                        />
                        {validationErrors[`item_${index}_name`] && (
                          <p className="text-sm text-red-600">{validationErrors[`item_${index}_name`]}</p>
                        )}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          validationErrors[`item_${index}_quantity`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors[`item_${index}_quantity`] && (
                        <p className="text-sm text-red-600">{validationErrors[`item_${index}_quantity`]}</p>
                      )}
                    </div>

                    {/* Unit Cost */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Cost (UGX) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_cost}
                        onChange={(e) => handleItemChange(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          validationErrors[`item_${index}_cost`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors[`item_${index}_cost`] && (
                        <p className="text-sm text-red-600">{validationErrors[`item_${index}_cost`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Additional fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {/* Expiry Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={item.expiry_date || ''}
                        onChange={(e) => handleItemChange(index, 'expiry_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {/* Batch Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batch Number
                      </label>
                      <input
                        type="text"
                        value={item.batch_number || ''}
                        onChange={(e) => handleItemChange(index, 'batch_number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Batch/Lot number"
                      />
                    </div>

                    {/* Total Cost (calculated) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Cost
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                        UGX {(item.quantity * item.unit_cost).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Item Notes */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Notes
                    </label>
                    <input
                      type="text"
                      value={item.notes || ''}
                      onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Additional notes for this item..."
                    />
                  </div>
                </div>
              ))}

              {/* Add Item Button */}
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                <FiPlus className="w-5 h-5 inline mr-2" />
                Add Item
              </button>

              {validationErrors.items && (
                <p className="text-sm text-red-600">{validationErrors.items}</p>
              )}
            </div>
          </ContentCard>

          {/* Summary */}
          <ContentCard title="Order Summary">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">UGX {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (18%):</span>
                <span className="font-medium">UGX {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium">- UGX {formData.discount.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-indigo-600">UGX {Math.max(0, total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </ContentCard>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/branch/purchases')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 inline mr-2" />
                  {isEditing ? 'Update Purchase Order' : 'Create Purchase Order'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </BranchDashboardLayout>
  );
};

export default EditPurchaseOrder;
