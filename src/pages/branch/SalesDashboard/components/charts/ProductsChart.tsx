/**
 * Products Chart Component
 * Reusable horizontal bar chart for top performing products
 */

import React, { useMemo } from 'react';
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
import { FiPackage } from 'react-icons/fi';
import type { ProductsChartProps } from '../../types/dashboard';
import {
  CustomTooltip,
  ChartWrapper
} from '../../utils/chartUtils';

export const ProductsChart: React.FC<ProductsChartProps> = ({
  data,
  loading,
  error,
  height = 96,
  formatCurrency
}) => {
  // Transform data to match the dual-axis BarChart format (pv = stock, uv = revenue)
  const transformedData = useMemo(() => {
    return data.map((product, index) => ({
      name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
      fullName: product.name,
      pv: product.stock,
      uv: product.revenue,
      sales: product.sales,
      stock: product.stock
    }));
  }, [data]);

  return (
    <ChartWrapper
      loading={loading}
      error={error}
      data={data}
      height={height}
      noDataMessage="No product sales data available"
      noDataIcon={<FiPackage className="h-12 w-12 text-gray-400" />}
    >
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
            <XAxis dataKey="name" />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#8884d8"
              label={{
                value: 'Stock Units',
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
            <Bar yAxisId="left" dataKey="pv" fill="#8884d8" name="Stock Units" />
            <Bar yAxisId="right" dataKey="uv" fill="#82ca9d" name="Product Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stock levels indicator */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {data.slice(0, 5).map((product, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
            <div className="text-xs font-medium text-gray-600 truncate mb-1">
              {product.name}
            </div>
            <div className="flex items-center gap-2">
              <FiPackage className="w-3 h-3 text-gray-500" />
              <span className={`text-sm font-semibold ${
                product.stock < 10 ? 'text-red-600' :
                product.stock < 50 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {product.stock} units
              </span>
            </div>
          </div>
        ))}
      </div>
    </ChartWrapper>
  );
};