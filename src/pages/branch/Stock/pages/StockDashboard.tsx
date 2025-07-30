import React, { useState } from 'react';
import { useProducts, useCategories, useStockStats } from '../hooks';
import { ProductCard, ProductForm, StockStats } from '../components';
import type { Product, CreateProductData, UpdateProductData } from '../types';

export const StockDashboard: React.FC = () => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'movements' | 'audits'>('overview');

  const {
    products,
    loading: productsLoading,
    error: productsError,
    filters: productFilters,
    setFilters: setProductFilters,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useStockStats();

  const handleCreateProduct = async (data: CreateProductData) => {
    try {
      const response = await createProduct(data);
      if (!response.error) {
        setShowProductForm(false);
      }
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleUpdateProduct = async (data: UpdateProductData) => {
    try {
      const response = await updateProduct(data);
      if (!response.error) {
        setShowProductForm(false);
        setEditingProduct(null);
      }
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
  };

  const handleCancelForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleSubmitProduct = async (data: CreateProductData | UpdateProductData) => {
    try {
      if (editingProduct) {
        const response = await updateProduct(data as UpdateProductData);
        if (!response.error) {
          setShowProductForm(false);
          setEditingProduct(null);
        }
      } else {
        const response = await createProduct(data as CreateProductData);
        if (!response.error) {
          setShowProductForm(false);
        }
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'movements', label: 'Movements', icon: '🔄' },
    { id: 'audits', label: 'Audits', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {statsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading statistics...</p>
                </div>
              ) : statsError ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{statsError}</p>
                </div>
              ) : stats ? (
                <StockStats stats={stats} />
              ) : null}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productFilters.search || ''}
                    onChange={(e) => setProductFilters({ ...productFilters, search: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Product
                </button>
              </div>

              {productsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading products...</p>
                </div>
              ) : productsError ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{productsError}</p>
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                      onView={handleViewProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products found</p>
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                {categoriesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : categoriesError ? (
                  <p className="text-red-600">{categoriesError}</p>
                ) : categories && categories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div key={category.id} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-600">{category.description || 'No description'}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          category.status === 'active' 
                            ? 'text-green-600 bg-green-100' 
                            : 'text-gray-600 bg-gray-100'
                        }`}>
                          {category.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No categories found</p>
                )}
              </div>
            </div>
          )}

          {/* Movements Tab */}
          {activeTab === 'movements' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Movements</h3>
              <p className="text-gray-600">Stock movement tracking will be implemented here.</p>
            </div>
          )}

          {/* Audits Tab */}
          {activeTab === 'audits' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Audits</h3>
              <p className="text-gray-600">Stock audit functionality will be implemented here.</p>
            </div>
          )}
        </div>

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <ProductForm
                  product={editingProduct || undefined}
                  categories={categories || []}
                  onSubmit={handleSubmitProduct}
                  onCancel={handleCancelForm}
                  loading={productsLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Product View Modal */}
        {viewingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {viewingProduct.name}
                  </h2>
                  <button
                    onClick={() => setViewingProduct(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">SKU</p>
                      <p className="font-medium">{viewingProduct.sku}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium">UGX {viewingProduct.unit_price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Stock</p>
                      <p className="font-medium">{viewingProduct.stock_quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Min Level</p>
                      <p className="font-medium">{viewingProduct.min_stock_level}</p>
                    </div>
                  </div>
                  {viewingProduct.description && (
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-medium">{viewingProduct.description}</p>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        handleEditProduct(viewingProduct);
                        setViewingProduct(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setViewingProduct(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 