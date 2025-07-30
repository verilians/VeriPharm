/**
 * Stock Alerts List Component
 * Reusable component for displaying stock alerts with action buttons
 */

import React from 'react';
import { FiAlertTriangle, FiPackage, FiActivity } from 'react-icons/fi';
import type { StockAlertsListProps } from '../../types/dashboard';
import { ChartWrapper } from '../../utils/chartUtils';

export const StockAlertsList: React.FC<StockAlertsListProps> = ({
  data,
  loading,
  error
}) => {
  return (
    <ChartWrapper
      loading={loading}
      error={error}
      data={data}
      height={24}
      noDataMessage="All products well stocked!"
      noDataIcon={
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center">
          <FiPackage className="h-10 w-10 text-green-600" />
        </div>
      }
    >
      <div className="space-y-3">
        {data.map((alert, index) => (
          <div
            key={index}
            className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ease-in-out transform hover:-translate-y-1 ${
              alert.alert_type === 'out_of_stock'
                ? 'bg-gradient-to-r from-red-50 via-pink-50 to-red-50 border-red-200 hover:border-red-300'
                : 'bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border-yellow-200 hover:border-yellow-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  alert.alert_type === 'out_of_stock'
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                    : 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'
                }`}>
                  <FiAlertTriangle className="w-6 h-6" />
                </div>
                {alert.alert_type === 'out_of_stock' && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">!</span>
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg group-hover:text-gray-700 transition-colors">
                  {alert.product_name}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FiPackage className="w-3 h-3" />
                    Min level: {alert.min_stock_level}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.alert_type === 'out_of_stock'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {alert.alert_type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold text-2xl ${
                alert.alert_type === 'out_of_stock' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {alert.current_stock}
              </div>
              <div className="text-sm text-gray-500">units left</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick action buttons */}
      {data.length > 0 && (
        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
            <FiPackage className="w-4 h-4" />
            Restock Items
          </button>
          <button className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
            <FiActivity className="w-4 h-4" />
            View Inventory
          </button>
        </div>
      )}
    </ChartWrapper>
  );
};