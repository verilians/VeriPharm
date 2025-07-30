import React from 'react';
import type { SalesReport } from '../types';

interface SalesReportChartProps {
  salesReport: SalesReport;
  loading?: boolean;
}

export const SalesReportChart: React.FC<SalesReportChartProps> = ({
  salesReport,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!salesReport) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No sales data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
        <div className="h-64 flex items-center justify-center">
          {/* In a real implementation, this would render an actual chart using Chart.js or similar */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              UGX {salesReport.total_revenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="mt-4 text-xs text-gray-400">
              Chart visualization would be rendered here
            </div>
          </div>
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {salesReport.total_orders}
            </div>
            <div className="text-sm text-gray-500">Total Orders</div>
            <div className="mt-4 text-xs text-gray-400">
              Chart visualization would be rendered here
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Average Order Value</h4>
          <div className="text-2xl font-bold text-gray-900">
            UGX {Math.round(salesReport.average_order_value).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Total Sales</h4>
          <div className="text-2xl font-bold text-gray-900">
            {salesReport.total_sales}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Report Period</h4>
          <div className="text-sm text-gray-900">
            {new Date(salesReport.date_from).toLocaleDateString()} - {new Date(salesReport.date_to).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Top Products */}
      {salesReport.top_products.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {salesReport.top_products.slice(0, 5).map((product, index) => (
              <div key={product.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{product.product_name}</p>
                    <p className="text-sm text-gray-500">{product.quantity_sold} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    UGX {product.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{product.percentage.toFixed(1)}% of revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Customers */}
      {salesReport.top_customers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
          <div className="space-y-3">
            {salesReport.top_customers.slice(0, 5).map((customer, index) => (
              <div key={customer.customer_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{customer.customer_name}</p>
                    <p className="text-sm text-gray-500">{customer.total_orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    UGX {customer.total_spent.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Avg: UGX {Math.round(customer.average_order_value).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 