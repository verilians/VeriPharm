import React, { useState, useEffect } from 'react';
import type { SalesSettings } from '../types';

interface SalesSettingsFormProps {
  settings: SalesSettings | null;
  onSave: (settings: Partial<SalesSettings>) => Promise<void>;
  loading?: boolean;
}

export const SalesSettingsForm: React.FC<SalesSettingsFormProps> = ({
  settings,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState<Partial<SalesSettings>>({
    tax_enabled: false,
    tax_rate: 0,
    tax_name: 'VAT',
    discount_enabled: false,
    max_discount_percentage: 0,
    receipt_header: '',
    receipt_footer: '',
    auto_print_receipts: false,
    require_customer_info: false,
    allow_negative_stock: false,
    low_stock_threshold: 10,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      setFormData({
        tax_enabled: settings.tax_enabled || false,
        tax_rate: settings.tax_rate || 0,
        tax_name: settings.tax_name || 'VAT',
        discount_enabled: settings.discount_enabled || false,
        max_discount_percentage: settings.max_discount_percentage || 0,
        receipt_header: settings.receipt_header || '',
        receipt_footer: settings.receipt_footer || '',
        auto_print_receipts: settings.auto_print_receipts || false,
        require_customer_info: settings.require_customer_info || false,
        allow_negative_stock: settings.allow_negative_stock || false,
        low_stock_threshold: settings.low_stock_threshold || 10,
      });
    }
  }, [settings]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.tax_enabled && ((formData.tax_rate ?? 0) < 0 || (formData.tax_rate ?? 0) > 100)) {
      newErrors.tax_rate = 'Tax rate must be between 0 and 100';
    }

    if (formData.discount_enabled && ((formData.max_discount_percentage ?? 0) < 0 || (formData.max_discount_percentage ?? 0) > 100)) {
      newErrors.max_discount_percentage = 'Max discount percentage must be between 0 and 100';
    }

    if ((formData.low_stock_threshold ?? 0) < 0) {
      newErrors.low_stock_threshold = 'Low stock threshold must be positive';
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
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleInputChange = (field: keyof SalesSettings, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Tax Settings</h3>
        
        <div className="space-y-4">
          {/* Tax Enabled */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="tax_enabled"
              checked={formData.tax_enabled || false}
              onChange={(e) => handleInputChange('tax_enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="tax_enabled" className="ml-2 text-sm text-gray-700">
              Enable tax calculation
            </label>
          </div>

          {formData.tax_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tax Rate */}
              <div>
                <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  id="tax_rate"
                  value={formData.tax_rate || 0}
                  onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tax_rate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
                {errors.tax_rate && (
                  <p className="mt-1 text-sm text-red-600">{errors.tax_rate}</p>
                )}
              </div>

              {/* Tax Name */}
              <div>
                <label htmlFor="tax_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Name
                </label>
                <input
                  type="text"
                  id="tax_name"
                  value={formData.tax_name || ''}
                  onChange={(e) => handleInputChange('tax_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VAT"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Discount Settings</h3>
        
        <div className="space-y-4">
          {/* Discount Enabled */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="discount_enabled"
              checked={formData.discount_enabled || false}
              onChange={(e) => handleInputChange('discount_enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="discount_enabled" className="ml-2 text-sm text-gray-700">
              Enable discount functionality
            </label>
          </div>

          {formData.discount_enabled && (
            <div>
              <label htmlFor="max_discount_percentage" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Discount Percentage (%)
              </label>
              <input
                type="number"
                id="max_discount_percentage"
                value={formData.max_discount_percentage || 0}
                onChange={(e) => handleInputChange('max_discount_percentage', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.max_discount_percentage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
              />
              {errors.max_discount_percentage && (
                <p className="mt-1 text-sm text-red-600">{errors.max_discount_percentage}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Receipt Settings</h3>
        
        <div className="space-y-4">
          {/* Receipt Header */}
          <div>
            <label htmlFor="receipt_header" className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Header
            </label>
            <textarea
              id="receipt_header"
              value={formData.receipt_header || ''}
              onChange={(e) => handleInputChange('receipt_header', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter receipt header text"
            />
          </div>

          {/* Receipt Footer */}
          <div>
            <label htmlFor="receipt_footer" className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Footer
            </label>
            <textarea
              id="receipt_footer"
              value={formData.receipt_footer || ''}
              onChange={(e) => handleInputChange('receipt_footer', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter receipt footer text"
            />
          </div>

          {/* Auto Print Receipts */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="auto_print_receipts"
              checked={formData.auto_print_receipts || false}
              onChange={(e) => handleInputChange('auto_print_receipts', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="auto_print_receipts" className="ml-2 text-sm text-gray-700">
              Automatically print receipts after sale
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Behavior</h3>
        
        <div className="space-y-4">
          {/* Require Customer Info */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="require_customer_info"
              checked={formData.require_customer_info || false}
              onChange={(e) => handleInputChange('require_customer_info', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="require_customer_info" className="ml-2 text-sm text-gray-700">
              Require customer information for sales
            </label>
          </div>

          {/* Allow Negative Stock */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allow_negative_stock"
              checked={formData.allow_negative_stock || false}
              onChange={(e) => handleInputChange('allow_negative_stock', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allow_negative_stock" className="ml-2 text-sm text-gray-700">
              Allow sales when stock is negative
            </label>
          </div>

          {/* Low Stock Threshold */}
          <div>
            <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-gray-700 mb-2">
              Low Stock Threshold
            </label>
            <input
              type="number"
              id="low_stock_threshold"
              value={formData.low_stock_threshold || 0}
              onChange={(e) => handleInputChange('low_stock_threshold', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.low_stock_threshold ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="10"
              min="0"
            />
            {errors.low_stock_threshold && (
              <p className="mt-1 text-sm text-red-600">{errors.low_stock_threshold}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}; 