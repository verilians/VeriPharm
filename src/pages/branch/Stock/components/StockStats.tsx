import React from 'react';
import type { StockStats as StockStatsType } from '../types';

interface StockStatsProps {
  stats: StockStatsType | null | undefined;
  loading?: boolean;
}

export const StockStats: React.FC<StockStatsProps> = ({ stats, loading = false }) => {
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

  if (!stats) {
    return <div className="text-center text-gray-500">No stock statistics available.</div>;
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.total_products,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '📦',
    },
    {
      title: 'Active Products',
      value: stats.active_products,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '✅',
    },
    {
      title: 'Low Stock',
      value: stats.low_stock_products,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: '⚠️',
    },
    {
      title: 'Out of Stock',
      value: stats.out_of_stock_products,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '❌',
    },
    {
      title: 'Total Stock Value',
      value: `UGX ${stats.total_stock_value.toLocaleString()}`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: '💰',
    },
    {
      title: 'Avg Stock Level',
      value: Math.round(stats.average_stock_level),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      icon: '📊',
    },
    {
      title: 'Added This Month',
      value: stats.products_added_this_month,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      icon: '📈',
    },
    {
      title: 'Movements Today',
      value: stats.stock_movements_today,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: '🔄',
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Audits</span>
              <span className="text-lg font-semibold text-yellow-600">
                {stats.pending_audits}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed This Month</span>
              <span className="text-lg font-semibold text-green-600">
                {stats.completed_audits_this_month}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Movements</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Today</span>
              <span className="text-lg font-semibold text-blue-600">
                {stats.stock_movements_today}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-lg font-semibold text-blue-600">
                {stats.stock_movements_this_month}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Stock</span>
              <span className="text-lg font-semibold text-green-600">
                {stats.active_products - stats.low_stock_products - stats.out_of_stock_products}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stock Coverage</span>
              <span className="text-lg font-semibold text-purple-600">
                {stats.total_products > 0 
                  ? Math.round(((stats.active_products - stats.out_of_stock_products) / stats.total_products) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 