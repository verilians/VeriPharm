import React, { useState, useEffect } from 'react';
import type { ReportFilters as ReportFiltersType } from '../types';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: ReportFiltersType) => void;
  reportType: 'sales' | 'inventory' | 'financial' | 'customer' | 'purchase';
  loading?: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  reportType,
  loading = false,
}) => {
  const [localFilters, setLocalFilters] = useState<ReportFiltersType>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (field: keyof ReportFiltersType, value: string | undefined) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleResetFilters = () => {
    const resetFilters: ReportFiltersType = {
      date_from: undefined,
      date_to: undefined,
      category_id: undefined,
      supplier_id: undefined,
      customer_id: undefined,
      product_id: undefined,
      status: undefined,
      payment_status: undefined,
      export_format: undefined,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const getQuickDateRanges = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastQuarter = new Date(today);
    lastQuarter.setMonth(lastQuarter.getMonth() - 3);

    return [
      { label: 'Today', from: today.toISOString().split('T')[0], to: today.toISOString().split('T')[0] },
      { label: 'Yesterday', from: yesterday.toISOString().split('T')[0], to: yesterday.toISOString().split('T')[0] },
      { label: 'Last 7 Days', from: lastWeek.toISOString().split('T')[0], to: today.toISOString().split('T')[0] },
      { label: 'Last 30 Days', from: lastMonth.toISOString().split('T')[0], to: today.toISOString().split('T')[0] },
      { label: 'Last 3 Months', from: lastQuarter.toISOString().split('T')[0], to: today.toISOString().split('T')[0] },
    ];
  };

  const quickRanges = getQuickDateRanges();

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Report Filters</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleResetFilters}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset
          </button>
          <button
            onClick={handleApplyFilters}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date Range */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={localFilters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={localFilters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Date Ranges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Ranges
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => {
                    handleFilterChange('date_from', range.from);
                    handleFilterChange('date_to', range.to);
                  }}
                  className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="space-y-4">
          {reportType === 'sales' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Status
              </label>
              <select
                value={localFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {reportType === 'purchase' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Status
                </label>
                <select
                  value={localFilters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={localFilters.payment_status || ''}
                  onChange={(e) => handleFilterChange('payment_status', e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Payment Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <select
            value={localFilters.export_format || ''}
            onChange={(e) => handleFilterChange('export_format', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No Export</option>
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>

      {/* Additional Filters based on Report Type */}
      {reportType === 'inventory' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Inventory Filters</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <select
                value={localFilters.category_id || ''}
                onChange={(e) => handleFilterChange('category_id', e.target.value || undefined)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {/* Categories would be populated from API */}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Supplier</label>
              <select
                value={localFilters.supplier_id || ''}
                onChange={(e) => handleFilterChange('supplier_id', e.target.value || undefined)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Suppliers</option>
                {/* Suppliers would be populated from API */}
              </select>
            </div>
          </div>
        </div>
      )}

      {reportType === 'sales' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sales Filters</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Customer</label>
              <select
                value={localFilters.customer_id || ''}
                onChange={(e) => handleFilterChange('customer_id', e.target.value || undefined)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Customers</option>
                {/* Customers would be populated from API */}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Product</label>
              <select
                value={localFilters.product_id || ''}
                onChange={(e) => handleFilterChange('product_id', e.target.value || undefined)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Products</option>
                {/* Products would be populated from API */}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 