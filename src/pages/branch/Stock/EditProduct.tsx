import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiSave,
  FiArrowLeft,
  FiPackage,
  FiDollarSign,
  FiHash,
  FiTag,
  FiBox,
  FiUser,
  FiInfo,
  FiLoader
} from "react-icons/fi";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard } from "../../../components/UI";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";

// Types - Updated to match AddProduct patterns
interface ProductData {
  id: string;
  name: string;
  manufacturer_name: string;
  manufacturer: string;
  category_id: string; // Updated to use category_id
  description: string;
  cost_price: number;
  price: number;
  quantity: number;
  min_stock_level: number;
  barcode: string;
  status: string;
  expiry_date: string;
  batch_number: string;
  location: string;
  supplier_id: string;
  tenant_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  tenant_id: string;
  branch_id: string;
  created_at: string;
}

interface Supplier {
  id: string;
  name: string;
  tenant_id: string;
  created_at: string;
}

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Check if user has permission to edit products
  useEffect(() => {
    if (user && user.role !== 'owner' && user.role !== 'manager') {
      alert('You do not have permission to edit products. Only owners and managers can edit products.');
      navigate('/branch/stock');
    }
  }, [user, navigate]);
  
  // State
  const [product, setProduct] = useState<ProductData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Load product, categories and suppliers
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id || !user) return;

        setLoading(true);
        setError(null);

        // Load product using service role to bypass RLS
        const { data: productData, error: productError } = await supabaseAdmin
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('branch_id', (user as any).branch_id)
          .single();

        if (productError) throw productError;

        // Load categories for the specific branch using service role to bypass RLS
        const { data: categoriesData, error: categoriesError } = await supabaseAdmin
          .from('categories')
          .select('*')
          .eq('tenant_id', (user as any).tenant_id)
          .eq('branch_id', (user as any).branch_id)
          .eq('status', 'active')
          .order('sort_order', { ascending: true });

        if (categoriesError && categoriesError.code !== '42P01') {
          console.error("Error loading categories:", categoriesError);
        } else {
          setCategories(categoriesData || []);
        }

        // Load suppliers using service role to bypass RLS
        const { data: suppliersData, error: suppliersError } = await supabaseAdmin
          .from('suppliers')
          .select('id, name')
          .eq('tenant_id', (user as any).tenant_id)
          .eq('status', 'active');

        if (suppliersError && suppliersError.code !== '42P01') {
          console.error("Error loading suppliers:", suppliersError);
        } else {
          setSuppliers(suppliersData || []);
        }

        setProduct(productData);
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error instanceof Error ? error.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user]);

  const handleInputChange = (field: keyof ProductData, value: string | number) => {
    if (!product) return;
    
    setProduct(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  const createNewCategory = async (categoryName: string): Promise<string | null> => {
    if (!user) return null;

    try {
      setCreatingCategory(true);
      
      const { data: newCategory, error } = await supabaseAdmin
        .from('categories')
        .insert([{
          name: categoryName,
          description: `Category for ${categoryName}`,
          color: '#3B82F6', // Default blue color
          icon: 'tag', // Default icon
          tenant_id: (user as any).tenant_id,
          branch_id: (user as any).branch_id,
          created_by: (user as any).id,
          sort_order: categories.length + 1
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add the new category to the local state
      setCategories(prev => [...prev, newCategory]);
      
      return newCategory.id;
    } catch (error) {
      throw error;
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    // Check if user has permission to edit products
    if (user?.role !== 'owner' && user?.role !== 'manager') {
      setError('You do not have permission to edit products. Only owners and managers can edit products.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      const hasValidCategory = product.category_id || (isCustomCategory && newCategoryName.trim());
      if (!product.name || !hasValidCategory || product.price <= 0) {
        throw new Error("Please fill in all required fields: Product Name, Category, and Selling Price must be greater than 0");
      }

      // If creating a custom category, create it first
      let finalCategoryId = product.category_id;
      if (isCustomCategory && newCategoryName.trim()) {
        const newCategoryId = await createNewCategory(newCategoryName.trim());
        if (newCategoryId) {
          finalCategoryId = newCategoryId;
        } else {
          throw new Error("Failed to create new category");
        }
      }

      // Update product using service role to bypass RLS
      const { error } = await supabaseAdmin
        .from('products')
        .update({
          name: product.name,
          manufacturer_name: product.manufacturer_name || null,
          manufacturer: product.manufacturer || null,
          category_id: finalCategoryId,
          description: product.description || null,
          price: Math.round(product.price), // Store in original units (UGX)
          cost_price: Math.round(product.cost_price), // Store in original units (UGX)
          quantity: product.quantity,
          min_stock_level: product.min_stock_level,
          status: product.status,
          barcode: product.barcode || null,
          expiry_date: product.expiry_date || null,
          batch_number: product.batch_number || null,
          location: product.location || null,
          supplier_id: product.supplier_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;

      navigate('/branch/stock');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </BranchDashboardLayout>
    );
  }

  if (!product) {
    return (
      <BranchDashboardLayout>
        <div className="text-center py-12">
          <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/branch/stock')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            Back to Inventory
          </button>
        </div>
      </BranchDashboardLayout>
    );
  }

  return (
    <BranchDashboardLayout>
      <div className="w-full h-full flex-1">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/branch/stock')}
              className="p-2 text-gray-600 hover:text-emerald-600 transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <ContentCard title="Basic Information" subtitle="Product details and identification">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPackage className="w-4 h-4 inline mr-2" />
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={product.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiHash className="w-4 h-4 inline mr-2" />
                  SKU/Code
                </label>
                <input
                  type="text"
                  value={product.barcode || ''}
                  onChange={(e) => handleInputChange('barcode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="Enter SKU or product code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="w-4 h-4 inline mr-2" />
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={product.manufacturer_name || ''}
                  onChange={(e) => handleInputChange('manufacturer_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="Enter manufacturer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiTag className="w-4 h-4 inline mr-2" />
                  Category
                </label>
                <select
                  value={product.category_id || ''}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomCategory(true);
                      handleInputChange('category_id', '');
                    } else {
                      setIsCustomCategory(false);
                      handleInputChange('category_id', e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  <option value="custom">+ Add New Category</option>
                </select>
                {isCustomCategory && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                      placeholder="Enter new category name"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiBox className="w-4 h-4 inline mr-2" />
                  Manufacturer Company
                </label>
                <input
                  type="text"
                  value={product.manufacturer || ''}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="Enter manufacturer company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiHash className="w-4 h-4 inline mr-2" />
                  Barcode
                </label>
                <input
                  type="text"
                  value={product.barcode || ''}
                  onChange={(e) => handleInputChange('barcode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="Enter barcode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="w-4 h-4 inline mr-2" />
                  Supplier
                </label>
                <select
                  value={product.supplier_id || ''}
                  onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                >
                  <option value="">Select supplier (optional)</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiInfo className="w-4 h-4 inline mr-2" />
                Description
              </label>
              <textarea
                value={product.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPackage className="w-4 h-4 inline mr-2" />
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={product.expiry_date || ''}
                  onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiHash className="w-4 h-4 inline mr-2" />
                  Batch Number
                </label>
                <input
                  type="text"
                  value={product.batch_number || ''}
                  onChange={(e) => handleInputChange('batch_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="Enter batch number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiBox className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={product.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="Enter storage location"
                />
              </div>
            </div>
          </ContentCard>

          {/* Pricing & Inventory */}
          <ContentCard title="Pricing & Inventory" subtitle="Update prices and stock levels">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiDollarSign className="w-4 h-4 inline mr-2" />
                  Cost Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={product.cost_price || 0}
                  onChange={(e) => handleInputChange('cost_price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiDollarSign className="w-4 h-4 inline mr-2" />
                  Selling Price *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={product.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPackage className="w-4 h-4 inline mr-2" />
                  Current Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={product.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPackage className="w-4 h-4 inline mr-2" />
                  Min Stock Level
                </label>
                <input
                  type="number"
                  min="0"
                  value={product.min_stock_level || 5}
                  onChange={(e) => handleInputChange('min_stock_level', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="5"
                />
              </div>
            </div>

            {/* Status */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={product.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            {/* Profit margin display */}
            {(product.cost_price || 0) > 0 && product.price > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                <div className="text-sm text-emerald-700">
                  <strong>Profit Margin:</strong> UGX {(product.price - (product.cost_price || 0)).toFixed(2)} 
                  ({((((product.price - (product.cost_price || 0)) / (product.cost_price || 1)) * 100) || 0).toFixed(1)}%)
                </div>
              </div>
            )}
          </ContentCard>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/branch/stock')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
              {saving ? 'Updating Product...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </BranchDashboardLayout>
  );
};

export default EditProduct;
