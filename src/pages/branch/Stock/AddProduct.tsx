import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiSave, 
  FiPackage, 
  FiDollarSign,
  FiHash,
  FiTag,
  FiUser,
  FiInfo,
  FiPlus
} from "react-icons/fi";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard } from "../../../components/UI";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";

// Types
interface ProductData {
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

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // State
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  
  const [productData, setProductData] = useState<ProductData>({
    name: "",
    manufacturer_name: "",
    manufacturer: "",
    category_id: "", // Updated to use category_id
    description: "",
    cost_price: 0,
    price: 0,
    quantity: 0,
    min_stock_level: 10,
    barcode: "",
    status: "active",
    expiry_date: "",
    batch_number: "",
    location: "",
    supplier_id: ""
  });

  // Load categories and suppliers using service role
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) return;

        console.log("🔍 Loading categories for user:", {
          tenant_id: (user as any).tenant_id,
          branch_id: (user as any).branch_id
        });

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
          console.log("✅ Categories loaded:", categoriesData);
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
          console.log("✅ Suppliers loaded:", suppliersData);
          setSuppliers(suppliersData || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [user]);

  const handleInputChange = (field: keyof ProductData, value: string | number) => {
    console.log(`🔄 Updating ${field}:`, value);
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to create a new category
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
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }



      // Check if categories are loaded
      if (categories.length === 0 && !isCustomCategory) {
        throw new Error("No categories available. Please try refreshing the page or contact your administrator.");
      }

      // Validate required fields
      const hasValidCategory = productData.category_id || (isCustomCategory && newCategoryName.trim());
      if (!productData.name || !hasValidCategory || productData.price <= 0) {
        throw new Error("Please fill in all required fields: Product Name, Category, and Selling Price must be greater than 0");
      }

      // If creating a custom category, create it first
      let finalCategoryId = productData.category_id;
      if (isCustomCategory && newCategoryName.trim()) {
        const newCategoryId = await createNewCategory(newCategoryName.trim());
        if (newCategoryId) {
          finalCategoryId = newCategoryId;
        } else {
          throw new Error("Failed to create new category");
        }
      }

      // Prepare data for database (store prices in original units)
      const dbData = {
        name: productData.name,
        manufacturer_name: productData.manufacturer_name || null,
        manufacturer: productData.manufacturer || null,
        category_id: finalCategoryId, // Use category_id instead of category string
        description: productData.description || null,
        price: Math.round(productData.price), // Store in original units (UGX)
        cost_price: Math.round(productData.cost_price), // Store in original units (UGX)
        quantity: productData.quantity,
        min_stock_level: productData.min_stock_level,
        status: productData.status,
        barcode: productData.barcode || null,
        expiry_date: productData.expiry_date || null,
        batch_number: productData.batch_number || null,
        location: productData.location || null,
        supplier_id: productData.supplier_id || null,
        tenant_id: (user as any).tenant_id,
        branch_id: (user as any).branch_id,
        created_by: (user as any).id,
      };



      // Create product using service role to bypass RLS
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      navigate('/branch/stock');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

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
          <ContentCard title="Basic Information" subtitle="Product details, categorization, and supplier information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPackage className="w-4 h-4 inline mr-2" />
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={productData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="w-4 h-4 inline mr-2" />
                  Manufacturer Company
                </label>
                <input
                  type="text"
                  value={productData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="Enter manufacturer company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="w-4 h-4 inline mr-2" />
                  Manufacturer Name
                </label>
                <input
                  type="text"
                  value={productData.manufacturer_name}
                  onChange={(e) => handleInputChange('manufacturer_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="Enter manufacturer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiTag className="w-4 h-4 inline mr-2" />
                  Category *
                </label>
                <div className="space-y-2">
                  <select
                    value={isCustomCategory ? "custom" : productData.category_id}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setIsCustomCategory(true);
                        setProductData(prev => ({ ...prev, category_id: "" }));
                      } else {
                        setIsCustomCategory(false);
                        setProductData(prev => ({ ...prev, category_id: e.target.value }));
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
                    <option value="custom">+ Add new category</option>
                  </select>
                  {isCustomCategory && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        required
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                        placeholder="Enter new category name"
                      />
                      {creatingCategory && (
                        <div className="text-sm text-emerald-600 flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                          Creating category...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="w-4 h-4 inline mr-2" />
                  Supplier
                </label>
                <select
                  value={productData.supplier_id}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiHash className="w-4 h-4 inline mr-2" />
                  Barcode
                </label>
                <input
                  type="text"
                  value={productData.barcode}
                  onChange={(e) => handleInputChange('barcode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="Enter barcode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiTag className="w-4 h-4 inline mr-2" />
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={productData.expiry_date}
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
                  value={productData.batch_number}
                  onChange={(e) => handleInputChange('batch_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="Enter batch number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPackage className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={productData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="e.g., Shelf A1, Storage Room"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiInfo className="w-4 h-4 inline mr-2" />
                Description
              </label>
              <textarea
                value={productData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                placeholder="Enter product description"
              />
            </div>
          </ContentCard>

          {/* Pricing & Inventory */}
          <ContentCard title="Pricing & Inventory" subtitle="Set prices and stock levels">
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
                  value={productData.cost_price}
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
                  value={productData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPackage className="w-4 h-4 inline mr-2" />
                  Initial Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={productData.quantity}
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
                  value={productData.min_stock_level}
                  onChange={(e) => handleInputChange('min_stock_level', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  placeholder="5"
                />
              </div>
            </div>

            {/* Profit margin display */}
            {productData.cost_price > 0 && productData.price > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                <div className="text-sm text-emerald-700">
                  <strong>Profit Margin:</strong> UGX {(productData.price - productData.cost_price).toFixed(2)} 
                  ({(((productData.price - productData.cost_price) / productData.cost_price) * 100).toFixed(1)}%)
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
              disabled={loading || (isCustomCategory && creatingCategory)}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </BranchDashboardLayout>
  );
};

export default AddProduct;
