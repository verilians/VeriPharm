import React from 'react';
import type { SupplierStats as SupplierStatsType } from '../types';

interface SupplierStatsProps {
  stats: SupplierStatsType;
  loading?: boolean;
}

export const SupplierStats: React.FC<SupplierStatsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Suppliers',
      value: stats.total_suppliers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '🏢',
    },
    {
      title: 'Active Suppliers',
      value: stats.active_suppliers,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '✅',
    },
    {
      title: 'Inactive Suppliers',
      value: stats.inactive_suppliers,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: '⏸️',
    },
    {
      title: 'Suspended Suppliers',
      value: stats.suspended_suppliers,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '🚫',
    },
    {
      title: 'Total Purchase Orders',
      value: stats.total_purchase_orders,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: '📋',
    },
    {
      title: 'Pending Orders',
      value: stats.pending_orders,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: '⏳',
    },
    {
      title: 'Total Spent',
      value: `UGX ${stats.total_spent.toLocaleString()}`,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      icon: '💰',
    },
    {
      title: 'Avg Order Value',
      value: `UGX ${Math.round(stats.average_order_value).toLocaleString()}`,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      icon: '📊',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow p-6 ${card.bgColor} hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div className="text-2xl">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Suppliers Added</span>
              <span className="text-lg font-semibold text-blue-600">
                {stats.suppliers_added_this_month}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Orders This Month</span>
              <span className="text-lg font-semibold text-green-600">
                {stats.orders_this_month}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Orders</span>
              <span className="text-lg font-semibold text-purple-600">
                {stats.total_purchase_orders}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-lg font-semibold text-yellow-600">
                {stats.pending_orders}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Spent</span>
              <span className="text-lg font-semibold text-indigo-600">
                UGX {stats.total_spent.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Order</span>
              <span className="text-lg font-semibold text-teal-600">
                UGX {Math.round(stats.average_order_value).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Suppliers */}
      {stats.top_suppliers && stats.top_suppliers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Suppliers</h3>
          <div className="space-y-3">
            {stats.top_suppliers.slice(0, 5).map((supplier, index) => (
              <div key={supplier.supplier_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{supplier.supplier_name}</p>
                    <p className="text-sm text-gray-600">
                      {supplier.total_orders} orders • UGX {supplier.total_spent.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    UGX {Math.round(supplier.average_order_value).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">avg order</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 