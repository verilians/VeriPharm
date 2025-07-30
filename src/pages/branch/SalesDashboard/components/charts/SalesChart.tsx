/**
 * Sales Chart Component
 * Reusable sales trends chart with revenue and transaction data
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { SalesChartProps } from '../../types/dashboard';
import {
  CustomTooltip,
  ChartWrapper
} from '../../utils/chartUtils';
import {
  formatChartDate
} from '../../utils/chartConfig';
import { FiTrendingUp, FiCalendar } from 'react-icons/fi';
import type { DateRange } from '../../hooks/useSalesTrends';

interface ExtendedSalesChartProps extends SalesChartProps {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  availableRanges?: { value: DateRange; label: string }[];
}

export const SalesChart: React.FC<ExtendedSalesChartProps> = ({
  data,
  loading,
  error,
  height = 96,
  formatCurrency,
  dateRange = '7d',
  onDateRangeChange,
  availableRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
  ]
}) => {
  // Log the data prop to the console to inspect its structure
  console.log('Data passed to SalesChart:', data);

  // Transform data to match the example format (pv = sales, uv = revenue)
  const transformedData = useMemo(() => {
    return (data || []).map(item => ({
      name: item.date,
      pv: item.sales,
      uv: item.revenue
    }));
  }, [data]);

  return (
    <ChartWrapper
      loading={loading}
      error={error}
      data={data}
      height={height}
      noDataMessage="No sales data available"
      noDataIcon={<FiTrendingUp className="h-12 w-12 text-gray-400" />}
    >
      {/* Date Range Selector */}
      {onDateRangeChange && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Time Period:</span>
          </div>
          <div className="flex gap-2">
            {availableRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => onDateRangeChange(range.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  dateRange === range.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: `${height * 4}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={transformedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickFormatter={formatChartDate}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#8884d8"
              label={{
                value: 'Sales Count',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#8884d8', fontSize: '12px' }
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#82ca9d"
              tickFormatter={(value) => formatCurrency(value)}
              label={{
                value: 'Revenue',
                angle: 90,
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: '#82ca9d', fontSize: '12px' }
              }}
            />
            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
            <Legend />
            <Bar yAxisId="left" dataKey="pv" fill="#8884d8" name="Daily Sales" />
            <Bar yAxisId="right" dataKey="uv" fill="#82ca9d" name="Daily Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartWrapper>
  );
};