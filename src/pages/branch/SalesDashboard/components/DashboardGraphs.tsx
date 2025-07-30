/**
 * Improved Dashboard Graphs Component
 * Refactored version with reusable components and custom hooks
 * Reduced from 985 lines to ~150 lines with better maintainability
 */

import React, { useState } from 'react';
import { ContentCard } from '../../../../components/UI';
import { useTenantCurrency } from '../../../../lib/hooks/useTenantCurrency';
import {
  SalesChart,
  ProductsChart,
  ReusablePieChart,
  CustomersList,
  StockAlertsList,
  useSalesTrends,
  useTopProducts,
  useDashboardData
} from './index';
import { FiCreditCard } from 'react-icons/fi';
import type { DateRange } from '../hooks/useSalesTrends';

interface DashboardGraphsProps {
  refreshTrigger?: number;
}

/**
 * Main Dashboard Graphs Component
 * Now clean, maintainable, and highly reusable
 */
export const DashboardGraphs: React.FC<DashboardGraphsProps> = ({ 
  refreshTrigger 
}) => {
  const { formatCurrency } = useTenantCurrency();
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('7d');
  
  // Custom hooks for data fetching
  const salesTrends = useSalesTrends(refreshTrigger, { dateRange: selectedDateRange });
  const topProducts = useTopProducts(refreshTrigger);
  const dashboardData = useDashboardData(refreshTrigger);

  const handleDateRangeChange = (range: DateRange) => {
    setSelectedDateRange(range);
    salesTrends.setDateRange(range);
  };

  return (
    <div className="space-y-8 mt-8">
      {/* Sales Performance Chart */}
      <ContentCard
        title="Sales Performance"
        subtitle="Daily sales trends and revenue over the last 30 days"
      >
        <SalesChart
          data={salesTrends.data}
          loading={salesTrends.loading}
          error={salesTrends.error}
          formatCurrency={formatCurrency}
          dateRange={salesTrends.dateRange}
          onDateRangeChange={handleDateRangeChange}
          availableRanges={salesTrends.availableRanges}
        />
      </ContentCard>

      {/* Top Products Performance */}
      <ContentCard
        title="Top Performing Products"
        subtitle="Revenue leaders and current stock levels"
      >
        <ProductsChart
          data={topProducts.data}
          loading={topProducts.loading}
          error={topProducts.error}
          formatCurrency={formatCurrency}
        />
      </ContentCard>

      {/* Analytics Overview with Charts on Left and Details on Right */}
      <ContentCard
        title="Analytics Overview"
        subtitle="Category performance and payment methods distribution"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Charts Section - Left Side */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Performance Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Category Performance</h4>
              <ReusablePieChart
                data={dashboardData.data.categories}
                loading={dashboardData.loading}
                error={dashboardData.error}
                title="Category Performance"
                dataKey="revenue"
                formatCurrency={formatCurrency}
                height={60}
              />
            </div>

            {/* Payment Methods Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Payment Methods</h4>
              <ReusablePieChart
                data={dashboardData.data.paymentMethods}
                loading={dashboardData.loading}
                error={dashboardData.error}
                title="Payment Methods"
                dataKey="amount"
                formatCurrency={formatCurrency}
                height={60}
              />
            </div>
          </div>

          {/* Details Section - Right Side */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Categories Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Categories Breakdown</h4>
              <div className="space-y-2">
                {dashboardData.data.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(category.revenue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.sales} items
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Payment Methods Breakdown</h4>
              <div className="space-y-2">
                {dashboardData.data.paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiCreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {method.method.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(method.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {method.count} transactions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Top Customers */}
      <ContentCard
        title="Top Customers"
        subtitle="Your most valuable customers by total spending"
      >
        <CustomersList
          data={dashboardData.data.customers}
          loading={dashboardData.loading}
          error={dashboardData.error}
          formatCurrency={formatCurrency}
        />
      </ContentCard>

      {/* Stock Alerts */}
      <ContentCard
        title="Stock Alerts"
        subtitle="Products requiring immediate attention"
      >
        <StockAlertsList
          data={dashboardData.data.stockAlerts}
          loading={dashboardData.loading}
          error={dashboardData.error}
        />
      </ContentCard>
    </div>
  );
};

export default DashboardGraphs;