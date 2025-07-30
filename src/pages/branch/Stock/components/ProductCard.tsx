import React from 'react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onView,
}) => {
  const getStockStatus = (quantity: number, minLevel: number) => {
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= minLevel) return 'low_stock';
    return 'in_stock';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return 'text-red-600 bg-red-100';
      case 'low_stock':
        return 'text-yellow-600 bg-yellow-100';
      case 'in_stock':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const stockStatus = getStockStatus(product.stock_quantity, product.min_stock_level);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            SKU: {product.sku}
          </p>
          {product.description && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onView(product)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View
          </button>
          <button
            onClick={() => onEdit(product)}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
          <p className="text-lg font-semibold text-gray-900">
            UGX {product.unit_price.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Stock</p>
          <p className="text-lg font-semibold text-gray-900">
            {product.stock_quantity}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(stockStatus)}`}>
            {stockStatus.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.status === 'active' 
              ? 'text-green-600 bg-green-100' 
              : 'text-gray-600 bg-gray-100'
          }`}>
            {product.status}
          </span>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-gray-500">Category</p>
          <p className="text-sm font-medium text-gray-900">
            {product.categories?.name || 'Uncategorized'}
          </p>
        </div>
      </div>

      {product.suppliers && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">Supplier</p>
          <p className="text-sm font-medium text-gray-900">
            {product.suppliers.name}
          </p>
        </div>
      )}
    </div>
  );
}; 