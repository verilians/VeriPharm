import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiPackage,
  FiCalendar,
  FiFileText,
  FiAlertTriangle,
  FiCheck,
} from "react-icons/fi";
import { useAuthStore } from "../../../stores/authStore";
import { useTenantCurrency } from "../../../lib/hooks/useTenantCurrency";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard } from "../../../components/UI";

// Types
interface Product {
  id: string;
  name: string;
  manufacturer_name?: string;
  manufacturer?: string;
  barcode?: string;
  price: number;
  cost_price?: number;
  quantity: number;
  min_stock_level?: number;
  category_id: string;
  status: string;
  expiry_date?: string;
  batch_number?: string;
  description?: string;
  tenant_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

interface StockAuditItem {
  id?: string;
  audit_id: string;
  product_id: string;
  product?: Product;
  system_stock: number;
  physical_count: number;
  variance: number; // Generated column
  status: 'pending' | 'matched' | 'variance' | 'critical';
  notes?: string;
  audited_by?: string;
  audited_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface StockAudit {
  id?: string;
  tenant_id: string;
  branch_id: string;
  audit_date: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  total_items_audited: number;
  total_variance: number;
  estimated_value_impact: number;
  notes?: string;
  created_by: string;
  completed_by?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

const EditStockAudit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currency } = useTenantCurrency();

  // Form state
  const [formData, setFormData] = useState<StockAudit>({
    tenant_id: user?.tenant_id || '',
    branch_id: user?.branch_id || '',
    audit_date: new Date().toISOString().split('T')[0],
    status: 'in_progress',
    total_items_audited: 0,
    total_variance: 0,
    estimated_value_impact: 0,
    notes: '',
    created_by: user?.id || '',
  });

  const [auditItems, setAuditItems] = useState<StockAuditItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [auditLoading, setAuditLoading] = useState(false);

  // Fetch audit data for editing
  useEffect(() => {
    const fetchAudit = async () => {
      if (!id || id === 'new' || !user?.tenant_id || !user?.branch_id) return;
      
      setAuditLoading(true);
      try {
        const { supabaseAdmin } = await import("../../../lib/supabase/supabaseClient");
        
        const { data, error } = await supabaseAdmin
          .from("stock_audits")
          .select(`
            *,
            stock_audit_items:stock_audit_items(
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
            audit_date: data.audit_date ? data.audit_date.split('T')[0] : '',
          }));

          if (data.stock_audit_items) {
            setAuditItems(data.stock_audit_items.map((item: any) => ({
              id: item.id,
              audit_id: item.audit_id,
              product_id: item.product_id,
              product: item.product,
              system_stock: item.system_stock,
              physical_count: item.physical_count,
              variance: item.variance,
              status: item.status,
              notes: item.notes,
              audited_by: item.audited_by,
              audited_at: item.audited_at ? item.audited_at.replace('Z', '').slice(0, 16) : '',
              created_at: item.created_at,
              updated_at: item.updated_at,
            })));
          }
        }
      } catch (error) {
        console.error("Error fetching audit:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch audit");
      } finally {
        setAuditLoading(false);
      }
    };

    fetchAudit();
  }, [id, user?.tenant_id, user?.branch_id]);

  // Fetch products with current stock
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.tenant_id || !user?.branch_id) return;

      try {
        const { supabaseAdmin } = await import("../../../lib/supabase/supabaseClient");
        
        const { data, error } = await supabaseAdmin
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

  // Generate audit ID for new audits
  useEffect(() => {
    if (id === 'new' && !formData.id) {
      const auditId = `SA-${Date.now()}`;
      setFormData(prev => ({ ...prev, id: auditId }));
    }
  }, [id, formData.id]);

  // Calculate audit statistics when items change
  useEffect(() => {
    const totalItems = auditItems.length;
    const totalVariance = auditItems.reduce((sum, item) => sum + Math.abs(item.variance), 0);
    const estimatedValueImpact = auditItems.reduce((sum, item) => sum + (item.physical_count - item.system_stock) * (item.product?.cost_price || 0), 0);

    setFormData(prev => ({
      ...prev,
      total_items_audited: totalItems,
      total_variance: totalVariance,
      estimated_value_impact: estimatedValueImpact,
    }));
  }, [auditItems]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.audit_date) {
      errors.audit_date = 'Audit date is required';
    }

    if (!formData.created_by) {
      errors.created_by = 'Created by is required';
    }

    if (auditItems.length === 0) {
      errors.items = 'At least one item is required for the audit';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof StockAudit, value: string | number) => {
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
    const newItem: StockAuditItem = {
      audit_id: id || '', // Assuming id is the audit ID for new items
      product_id: '',
      system_stock: 0,
      physical_count: 0,
      variance: 0,
      status: 'pending',
    };
    setAuditItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setAuditItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof StockAuditItem, value: string | number) => {
    setAuditItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'product_id') {
        const product = products.find(p => p.id === value);
        if (product) {
          item.product_id = product.id;
          item.product = product;
          item.system_stock = product.quantity || 0;
          // Keep physical_count as is, or set to system_stock if not set
          if (item.physical_count === 0) {
            item.physical_count = item.system_stock;
          }
        }
      } else {
        (item as any)[field] = value;
      }

      // Recalculate variance
      item.variance = item.physical_count - item.system_stock;

      updated[index] = item;
      return updated;
    });
  };

  const handleAutoFillFromInventory = () => {
    const itemsFromProducts = products.map(product => ({
      audit_id: id || '', // Assuming id is the audit ID for new items
      product_id: product.id,
      product: product,
      system_stock: product.quantity || 0,
      physical_count: product.quantity || 0,
      variance: 0,
      status: 'pending' as const,
    }));
    
    setAuditItems(itemsFromProducts);
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

      const auditPayload = {
        ...formData,
        tenant_id: user?.tenant_id,
        branch_id: user?.branch_id,
      };

      if (id === 'new') {
        // Create new audit
        const { data: newAudit, error: auditError } = await supabase
          .from("stock_audits")
          .insert([auditPayload])
          .select()
          .single();

        if (auditError) throw auditError;

        // Create audit items
        if (auditItems.length > 0) {
          const itemsPayload = auditItems.map(item => ({
            audit_id: newAudit.id,
            product_id: item.product_id,
            system_stock: item.system_stock,
            physical_count: item.physical_count,
            variance: item.variance,
            status: item.status,
            notes: item.notes,
            audited_by: user?.id,
            audited_at: item.audited_at ? new Date(item.audited_at).toISOString() : new Date().toISOString(),
            tenant_id: user?.tenant_id,
            branch_id: user?.branch_id,
          }));

          const { error: itemsError } = await supabase
            .from("stock_audit_items")
            .insert(itemsPayload);

          if (itemsError) throw itemsError;
        }

        navigate(`/branch/audits/view/${newAudit.id}`);
      } else {
        // Update existing audit
        const { error: auditError } = await supabase
          .from("stock_audits")
          .update(auditPayload)
          .eq("id", id)
          .eq("tenant_id", user?.tenant_id)
          .eq("branch_id", user?.branch_id);

        if (auditError) throw auditError;

        // Delete existing items
        const { error: deleteError } = await supabase
          .from("stock_audit_items")
          .delete()
          .eq("audit_id", id)
          .eq("tenant_id", user?.tenant_id)
          .eq("branch_id", user?.branch_id);

        if (deleteError) throw deleteError;

        // Insert updated items
        if (auditItems.length > 0) {
          const itemsPayload = auditItems.map(item => ({
            audit_id: id,
            product_id: item.product_id,
            system_stock: item.system_stock,
            physical_count: item.physical_count,
            variance: item.variance,
            status: item.status,
            notes: item.notes,
            audited_by: user?.id,
            audited_at: item.audited_at ? new Date(item.audited_at).toISOString() : new Date().toISOString(),
            tenant_id: user?.tenant_id,
            branch_id: user?.branch_id,
          }));

          const { error: itemsError } = await supabase
            .from("stock_audit_items")
            .insert(itemsPayload);

          if (itemsError) throw itemsError;
        }

        navigate(`/branch/audits/view/${id}`);
      }
    } catch (error) {
      console.error("Error saving audit:", error);
      setError(error instanceof Error ? error.message : "Failed to save audit");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || id === 'new') return;

    if (!confirm('Are you sure you want to delete this audit? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const { supabase } = await import("../../../lib/supabase/supabaseClient");

      // Delete items first (foreign key constraint)
      const { error: itemsError } = await supabase
        .from("stock_audit_items")
        .delete()
        .eq("audit_id", id)
        .eq("tenant_id", user?.tenant_id)
        .eq("branch_id", user?.branch_id);

      if (itemsError) throw itemsError;

      // Delete audit
      const { error } = await supabase
        .from("stock_audits")
        .delete()
        .eq("id", id)
        .eq("tenant_id", user?.tenant_id)
        .eq("branch_id", user?.branch_id);

      if (error) throw error;
      navigate("/branch/audits");
    } catch (error) {
      console.error("Error deleting audit:", error);
      setError(error instanceof Error ? error.message : "Failed to delete audit");
    } finally {
      setIsLoading(false);
    }
  };

  const getVarianceStatusIcon = (variance: number) => {
    if (variance === 0) return <FiCheck className="h-4 w-4 text-green-500" />;
    return <FiAlertTriangle className="h-4 w-4 text-red-500" />;
  };

  if (auditLoading) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading audit data...</p>
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
              onClick={() => navigate("/branch/audits/stock-audit")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
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
              {isLoading ? 'Saving...' : 'Save Audit'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audit Information */}
          <ContentCard title="Audit Information">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audit Date *
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="date"
                      value={formData.audit_date}
                      onChange={(e) => handleInputChange('audit_date', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        validationErrors.audit_date ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {validationErrors.audit_date && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.audit_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'draft' | 'in_progress' | 'completed' | 'cancelled')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </ContentCard>

          {/* Audit Summary */}
          <ContentCard title="Audit Summary">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formData.total_items_audited}</div>
                  <div className="text-sm text-blue-800">Total Items Audited</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{formData.total_variance}</div>
                  <div className="text-sm text-red-800">Total Variance</div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-xl font-bold text-yellow-600">
                  {currency}{Math.abs(formData.estimated_value_impact).toFixed(2)}
                </div>
                <div className="text-sm text-yellow-800">
                  Estimated Value Impact ({formData.estimated_value_impact >= 0 ? 'Surplus' : 'Shortage'})
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <div className="relative">
                  <FiFileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter any notes about the audit..."
                  />
                </div>
              </div>
            </div>
          </ContentCard>
        </div>

        {/* Audit Items */}
        <ContentCard title="Audit Items">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-gray-900">Items</h4>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleAutoFillFromInventory}
                  className="inline-flex items-center px-3 py-2 border border-emerald-300 text-sm font-medium rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                >
                  <FiPackage className="mr-1 h-4 w-4" />
                  Auto-fill from Inventory
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                >
                  <FiPlus className="mr-1 h-4 w-4" />
                  Add Item
                </button>
              </div>
            </div>

            {validationErrors.items && (
              <p className="text-sm text-red-600">{validationErrors.items}</p>
            )}

            <div className="space-y-3">
              {auditItems.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3">
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
                            {product.name} - {product.barcode || 'No Barcode'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        System Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.system_stock}
                        onChange={(e) => handleItemChange(index, 'system_stock', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Physical Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.physical_count}
                        onChange={(e) => handleItemChange(index, 'physical_count', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variance
                      </label>
                      <div className={`px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg flex items-center ${
                        item.variance > 0 ? 'text-green-700' : item.variance < 0 ? 'text-red-700' : 'text-gray-700'
                      }`}>
                        {getVarianceStatusIcon(item.variance)}
                        <span className="ml-1">{item.variance}</span>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={item.status}
                        onChange={(e) => handleItemChange(index, 'status', e.target.value as 'pending' | 'matched' | 'variance' | 'critical')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="matched">Matched</option>
                        <option value="variance">Variance</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter notes for this item..."
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Audited By
                      </label>
                      <input
                        type="text"
                        value={item.audited_by || ''}
                        onChange={(e) => handleItemChange(index, 'audited_by', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter auditor name"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Audited At
                      </label>
                      <input
                        type="datetime-local"
                        value={item.audited_at || ''}
                        onChange={(e) => handleItemChange(index, 'audited_at', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
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

                  {item.variance !== 0 && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter notes for this item..."
                      />
                    </div>
                  )}
                </div>
              ))}

              {auditItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FiPackage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No items added yet. Click "Add Item" to get started or "Auto-fill from Inventory" to import all products.</p>
                </div>
              )}
            </div>
          </div>
        </ContentCard>
      </form>
    </BranchDashboardLayout>
  );
};

export default EditStockAudit;
