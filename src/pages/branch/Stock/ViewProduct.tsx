import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiPackage,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { useAuthStore } from "../../../stores/authStore";
import { formatCurrency, formatDateTime } from "../../../lib/utils";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard, DashboardCard } from "../../../components/UI";

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
  description?: string;
  tenant_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

interface ProductAnalytics {
  totalSold: number;
  totalRevenue: number;
  totalProfit: number;
  averageRating: number;
  recentSales: RecentSale[];
  topCustomers: TopCustomer[];
}

interface RecentSale {
  id: string;
  date: string;
  quantity: number;
  revenue: number;
  profit: number;
  customer_name?: string;
}

interface TopCustomer {
  id: string;
  name: string;
  email?: string;
  totalPurchases: number;
  totalSpent: number;
}

// Local stock status helper
const getStockStatus = (quantity: number, minLevel: number = 5) => {
  if (quantity === 0) {
    return { 
      status: "out-of-stock", 
      color: "#dc2626", 
      bg: "bg-red-100", 
      text: "Out of Stock" 
    };
  } else if (quantity <= minLevel) {
    return { 
      status: "low-stock", 
      color: "#d97706", 
      bg: "bg-yellow-100", 
      text: "Low Stock" 
    };
  } else {
    return { 
      status: "in-stock", 
      color: "#16a34a", 
      bg: "bg-green-100", 
      text: "In Stock" 
    };
  }
};

const ViewProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Delete product function
  const handleDeleteProduct = async () => {
    // Check if user has permission to delete products
    if (user?.role !== 'owner' && user?.role !== 'manager') {
      alert('You do not have permission to delete products. Only owners and managers can delete products.');
      return;
    }

    if (!product || !confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);
      
      // Delete product using service role to bypass RLS
      const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      console.log("✅ Product deleted successfully");
      navigate('/branch/stock');
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      alert(error instanceof Error ? error.message : 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  // Fetch product data using service role to bypass RLS
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || !user?.tenant_id || !user?.branch_id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabaseAdmin
          .from("products")
          .select("*")
          .eq("id", id)
          .eq("tenant_id", user.tenant_id)
          .eq("branch_id", user.branch_id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error instanceof Error ? error.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!id || !user?.tenant_id) return;
      
      try {
        setAnalyticsLoading(true);
        
        // Mock analytics data for now
        setAnalytics({
          totalSold: 0,
          totalRevenue: 0,
          totalProfit: 0,
          averageRating: 0,
          recentSales: [],
          topCustomers: [],
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [id, user]);

  const stockStatus = useMemo(() => {
    if (!product) return null;
    return getStockStatus(product.quantity, product.min_stock_level || 5);
  }, [product]);

  const profitMargin = useMemo(() => {
    if (!product || !product.cost_price) return 0;
    return ((product.price - product.cost_price) / product.price) * 100;
  }, [product]);

  if (loading) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </BranchDashboardLayout>
    );
  }

  if (error || !product) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Product not found
            </h3>
            <p className="text-gray-600 mb-6">
              The product you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate("/branch/stock")}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </button>
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/branch/stock")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-sm text-gray-500">
                {product.manufacturer_name && `${product.manufacturer_name} • `}
                Product Details
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Only show Edit button for Owner and Manager */}
            {(user?.role === 'owner' || user?.role === 'manager') && (
              <button
                onClick={() => navigate(`/branch/stock/edit-product/${product.id}`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiEdit className="mr-2 h-4 w-4" />
                Edit
              </button>
            )}
            
            {/* Only show Delete button for Owner and Manager */}
            {(user?.role === 'owner' || user?.role === 'manager') && (
              <button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Current Stock"
            value={product.quantity.toString()}
          />
          <DashboardCard
            title="Selling Price"
            value={formatCurrency(product.price)}
          />
          <DashboardCard
            title="Profit Margin"
            value={`${profitMargin.toFixed(1)}%`}
          />
          <DashboardCard
            title="Total Sold"
            value={analytics?.totalSold?.toString() || "0"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Information */}
          <div className="lg:col-span-2 space-y-6">
            <ContentCard title="Product Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <p className="text-sm text-gray-900">{product.name}</p>
                  </div>
                  
                  {product.manufacturer_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manufacturer
                      </label>
                      <p className="text-sm text-gray-900">{product.manufacturer_name}</p>
                    </div>
                  )}
                  
                  {product.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <p className="text-sm text-gray-900">{product.category}</p>
                    </div>
                  )}
                  
                  {product.barcode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Barcode
                      </label>
                      <p className="text-sm text-gray-900 font-mono">{product.barcode}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price
                    </label>
                    <p className="text-sm text-gray-900 font-semibold">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  
                  {product.cost_price && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost Price
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatCurrency(product.cost_price)}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock
                    </label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-900">{product.quantity}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stockStatus?.status === 'low-stock' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : stockStatus?.status === 'out-of-stock'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {stockStatus?.text}
                      </span>
                    </div>
                  </div>
                  
                  {product.min_stock_level && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Stock Level
                      </label>
                      <p className="text-sm text-gray-900">{product.min_stock_level}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {product.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <p className="text-sm text-gray-900">{product.description}</p>
                </div>
              )}
            </ContentCard>

            {/* Additional Details */}
            <ContentCard title="Additional Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {product.batch_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batch Number
                      </label>
                      <p className="text-sm text-gray-900 font-mono">{product.batch_number}</p>
                    </div>
                  )}
                  
                  {product.expiry_date && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDateTime(product.expiry_date)}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created At
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(product.created_at)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(product.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </ContentCard>
          </div>

          {/* Sales Analytics Sidebar */}
          <div className="space-y-6">
            <ContentCard title="Sales Performance">
              {analyticsLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Revenue
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(analytics?.totalRevenue || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Profit
                    </label>
                    <p className="text-lg font-semibold text-emerald-600">
                      {formatCurrency(analytics?.totalProfit || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Units Sold
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {analytics?.totalSold || 0}
                    </p>
                  </div>
                  
                  {analytics && analytics.averageRating > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Average Rating
                      </label>
                      <p className="text-lg font-semibold text-yellow-600">
                        {analytics.averageRating.toFixed(1)} / 5.0
                      </p>
                    </div>
                  )}
                </div>
              )}
            </ContentCard>

            {/* Recent Sales */}
            {analytics?.recentSales && analytics.recentSales.length > 0 && (
              <ContentCard title="Recent Sales">
                <div className="space-y-3">
                  {analytics.recentSales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {sale.quantity} units
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(sale.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(sale.revenue)}
                        </p>
                        <p className="text-xs text-emerald-600">
                          +{formatCurrency(sale.profit)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ContentCard>
            )}

            {/* Top Customers */}
            {analytics?.topCustomers && analytics.topCustomers.length > 0 && (
              <ContentCard title="Top Customers">
                <div className="space-y-3">
                  {analytics.topCustomers.slice(0, 5).map((customer) => (
                    <div key={customer.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {customer.totalPurchases} purchases
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                    </div>
                  ))}
                </div>
              </ContentCard>
            )}
          </div>
        </div>
      </div>
    </BranchDashboardLayout>
  );
};

export default ViewProduct;
