import React, { useState, useEffect } from 'react';
import type { Product, CreateProductData, UpdateProductData, Category } from '../types';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (data: CreateProductData | UpdateProductData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    sku: '',
    description: '',
    unit_price: 0,
    cost_price: 0,
    stock_quantity: 0,
    min_stock_level: 0,
    max_stock_level: 0,
    reorder_point: 0,
    category_id: '',
    supplier_id: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        unit_price: product.unit_price,
        cost_price: product.cost_price || 0,
        stock_quantity: product.stock_quantity,
        min_stock_level: product.min_stock_level,
        max_stock_level: product.max_stock_level || 0,
        reorder_point: product.reorder_point || 0,
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        status: product.status,
      });
    }
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    if (formData.unit_price <= 0) {
      newErrors.unit_price = 'Unit price must be greater than 0';
    }

    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'Stock quantity cannot be negative';
    }

    if (formData.min_stock_level < 0) {
      newErrors.min_stock_level = 'Minimum stock level cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (product) {
        await onSubmit({ ...formData, id: product.id } as UpdateProductData);
      } else {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: keyof CreateProductData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* SKU */}
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
            SKU *
          </label>
          <input
            type="text"
            id="sku"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.sku ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter SKU"
          />
          {errors.sku && (
            <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
          )}
        </div>

        {/* Unit Price */}
        <div>
          <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 mb-2">
            Unit Price (UGX) *
          </label>
          <input
            type="number"
            id="unit_price"
            value={formData.unit_price}
            onChange={(e) => handleInputChange('unit_price', parseInt(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.unit_price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
            min="0"
          />
          {errors.unit_price && (
            <p className="mt-1 text-sm text-red-600">{errors.unit_price}</p>
          )}
        </div>

        {/* Cost Price */}
        <div>
          <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700 mb-2">
            Cost Price (UGX)
          </label>
          <input
            type="number"
            id="cost_price"
            value={formData.cost_price}
            onChange={(e) => handleInputChange('cost_price', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
        </div>

        {/* Stock Quantity */}
        <div>
          <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-2">
            Stock Quantity
          </label>
          <input
            type="number"
            id="stock_quantity"
            value={formData.stock_quantity}
            onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.stock_quantity ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
            min="0"
          />
          {errors.stock_quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.stock_quantity}</p>
          )}
        </div>

        {/* Minimum Stock Level */}
        <div>
          <label htmlFor="min_stock_level" className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Stock Level
          </label>
          <input
            type="number"
            id="min_stock_level"
            value={formData.min_stock_level}
            onChange={(e) => handleInputChange('min_stock_level', parseInt(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.min_stock_level ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="10"
            min="0"
          />
          {errors.min_stock_level && (
            <p className="mt-1 text-sm text-red-600">{errors.min_stock_level}</p>
          )}
        </div>

        {/* Maximum Stock Level */}
        <div>
          <label htmlFor="max_stock_level" className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Stock Level
          </label>
          <input
            type="number"
            id="max_stock_level"
            value={formData.max_stock_level}
            onChange={(e) => handleInputChange('max_stock_level', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="100"
            min="0"
          />
        </div>

        {/* Reorder Point */}
        <div>
          <label htmlFor="reorder_point" className="block text-sm font-medium text-gray-700 mb-2">
            Reorder Point
          </label>
          <input
            type="number"
            id="reorder_point"
            value={formData.reorder_point}
            onChange={(e) => handleInputChange('reorder_point', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="20"
            min="0"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category_id"
            value={formData.category_id}
            onChange={(e) => handleInputChange('category_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter product description"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}; 