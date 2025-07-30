/**
 * Customers List Component
 * Reusable component for displaying top customers
 */

import React from 'react';
import { FiUsers, FiShoppingCart, FiCalendar } from 'react-icons/fi';
import type { CustomersListProps } from '../../types/dashboard';
import { ChartWrapper } from '../../utils/chartUtils';

export const CustomersList: React.FC<CustomersListProps> = ({
  data,
  loading,
  error,
  formatCurrency
}) => {
  return (
    <ChartWrapper
      loading={loading}
      error={error}
      data={data}
      height={24}
      noDataMessage="No customer data available"
      noDataIcon={<FiUsers className="h-16 w-16 text-gray-300" />}
    >
      <div className="space-y-3">
        {data.map((customer, index) => (
          <div
            key={index}
            className="group flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-200 ease-in-out transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <FiUsers className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md">
                  {index + 1}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                  {customer.name}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FiShoppingCart className="w-3 h-3" />
                    {customer.transactions} purchases
                  </span>
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    {new Date(customer.last_purchase).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900 text-xl group-hover:text-blue-700 transition-colors">
                {formatCurrency(customer.total_spent)}
              </div>
              <div className="text-sm text-gray-500">
                Avg: {formatCurrency(customer.total_spent / customer.transactions)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ChartWrapper>
  );
};