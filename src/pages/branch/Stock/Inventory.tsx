import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiAlertTriangle,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiDownload,
  FiDollarSign,
  FiBox,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard, DashboardCard } from "../../../components/UI";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";

// Types
interface Product {
  id: string;
  name: string;
  manufacturer_name?: string;
  barcode?: string;
  price: number;
  cost_price?: number;
  quantity: number;
  min_stock_level?: number;
  category?: string;
  status: string;
  expiry_date?: string;
  batch_number?: string;
  tenant_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  tenant_id: string;
  created_at: string;
}

interface StockStatus {
  status: "out-of-stock" | "low-stock" | "in-stock";
  color: string;
  text: string;
}

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Load products and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔄 [Inventory] Loading products and categories...");
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error("User not authenticated");
        }

        // Load products for the current branch using service role to bypass RLS
        const { data: productsData, error: productsError } = await supabaseAdmin
          .from('products')
          .select('*')
          .eq('branch_id', (user as any).branch_id);

        if (productsError) {
          if (productsError.code === '42P01') {
            console.log("📝 Products table doesn't exist yet, skipping...");
            setProducts([]);
          } else {
            throw productsError;
          }
        } else {
          setProducts(productsData || []);
        }

        // Load categories for the current tenant using service role to bypass RLS
        const { data: categoriesData, error: categoriesError } = await supabaseAdmin
          .from('categories')
          .select('*')
          .eq('tenant_id', (user as any).tenant_id);

        if (categoriesError) {
          if (categoriesError.code === '42P01') {
            console.log("📝 Categories table doesn't exist yet, skipping...");
            setCategories([]);
          } else {
            console.error("Error loading categories:", categoriesError);
            setCategories([]);
          }
        } else {
          setCategories(categoriesData || []);
        }

        console.log("✅ [Inventory] Loaded products:", productsData?.length || 0);
        console.log("✅ [Inventory] Loaded categories:", categoriesData?.length || 0);

        setProducts(productsData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("❌ [Inventory] Error loading data:", error);
        setProducts([]);
        setCategories([]);
        setError(error instanceof Error ? error.message : 'Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.manufacturer_name?.toLowerCase().includes(search.toLowerCase()) ||
        product.barcode?.includes(search) ||
        product.category?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((product) => {
        const stockStatus = getStockStatus(product);
        return stockStatus.status === statusFilter;
      });
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category === categoryFilter);
    }

    return filtered;
  }, [products, search, statusFilter, categoryFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const inStock = products.filter(p => p.quantity > 0).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= (p.min_stock_level || 5)).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    return {
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      totalValue
    };
  }, [products]);

  const getStockStatus = (product: Product): StockStatus => {
    if (product.quantity === 0) {
      return { status: "out-of-stock", color: "#dc2626", text: "Out of Stock" };
    } else if (product.quantity <= (product.min_stock_level || 5)) {
      return { status: "low-stock", color: "#d97706", text: "Low Stock" };
    } else {
      return { status: "in-stock", color: "#16a34a", text: "In Stock" };
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh products using service role to bypass RLS
      const { data: productsData, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('branch_id', (user as any).branch_id);

      if (error) throw error;
      setProducts(productsData || []);
    } catch (error) {
      console.error("❌ [Inventory] Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    // Check if user has permission to delete products
    if (user?.role !== 'owner' && user?.role !== 'manager') {
      alert('You do not have permission to delete products. Only owners and managers can delete products.');
      return;
    }

    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  const handleExportProducts = () => {
    // TODO: Implement export functionality
    console.log("Export products");
  };

  return (
    <BranchDashboardLayout>
      <div className="w-full h-full flex-1">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleExportProducts}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
            {/* Only show Add Product button for Owner and Manager */}
            {(user?.role === 'owner' || user?.role === 'manager') && (
              <button
                onClick={() => navigate("/branch/stock/add-product")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Product
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {/* KPI Cards */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <DashboardCard
              title="Total Products"
              value={stats.totalProducts}
              icon={<FiPackage className="w-5 h-5 text-blue-600" />}
              className="bg-white"
            />
            <DashboardCard
              title="In Stock"
              value={stats.inStock}
              icon={<FiCheckCircle className="w-5 h-5 text-green-600" />}
              className="bg-white"
            />
            <DashboardCard
              title="Low Stock"
              value={stats.lowStock}
              icon={<FiAlertTriangle className="w-5 h-5 text-yellow-600" />}
              className="bg-white"
            />
            <DashboardCard
              title="Total Value"
              value={`UGX ${stats.totalValue.toLocaleString()}`}
              icon={<FiDollarSign className="w-5 h-5 text-purple-600" />}
              className="bg-white"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, manufacturer, or barcode..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Products List */}
        <ContentCard 
          title="Products"
          subtitle={`${filteredProducts.length} products found`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">
                {search || statusFilter !== "all" || categoryFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first product"
                }
              </p>
              {(!search && statusFilter === "all" && categoryFilter === "all") && (
                user?.role === 'owner' || user?.role === 'manager' ? (
                  <button
                    onClick={() => navigate("/branch/stock/add-product")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
                  >
                    Add First Product
                  </button>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Contact your manager or owner to add products
                  </p>
                )
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <div
                    key={product.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                          <FiPackage className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <span 
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`}
                            style={{ 
                              backgroundColor: stockStatus.status === 'in-stock' ? '#dcfce7' : 
                                             stockStatus.status === 'low-stock' ? '#fef3c7' : '#fee2e2',
                              color: stockStatus.color 
                            }}
                          >
                            {stockStatus.text}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => navigate(`/branch/stock/view-product/${product.id}`)}
                          className="p-1 text-gray-400 hover:text-emerald-600 transition"
                          title="View product"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {/* Only show Edit button for Owner and Manager */}
                        {(user?.role === 'owner' || user?.role === 'manager') && (
                          <button
                            onClick={() => navigate(`/branch/stock/edit-product/${product.id}`)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition"
                            title="Edit product"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                        )}
                        {/* Only show Delete button for Owner and Manager */}
                        {(user?.role === 'owner' || user?.role === 'manager') && (
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition"
                            title="Delete product"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {product.manufacturer_name && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiBox className="w-3 h-3" />
                          <span>{product.manufacturer_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiDollarSign className="w-3 h-3" />
                        <span>UGX {product.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiPackage className="w-3 h-3" />
                        <span>{product.quantity} in stock</span>
                        {product.min_stock_level && (
                          <span className="text-gray-400">• Min: {product.min_stock_level}</span>
                        )}
                      </div>
                      {product.category && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiBox className="w-3 h-3" />
                          <span>{product.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ContentCard>
      </div>
    </BranchDashboardLayout>
  );
};

export default Inventory;
