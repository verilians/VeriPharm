/**
 * Chart Utility Components
 * Reusable chart components like tooltips, labels, and gradients
 */

import React, { memo } from 'react';
import type { ChartTooltipProps, PieLabelProps, ChartGradient } from '../types/dashboard';
import { GRADIENT_COLORS, CHART_COLORS } from './chartConfig';

/**
 * Custom tooltip component with enhanced styling
 */
export const CustomTooltip: React.FC<ChartTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  formatCurrency 
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-xl shadow-xl">
        <p className="font-semibold text-gray-900 mb-2 text-sm">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name || 'Unknown'}:</span>
            <span className="font-medium text-gray-900">
              {entry.name && typeof entry.name === 'string' && 
               (entry.name.toLowerCase().includes('revenue') || 
                entry.name.toLowerCase().includes('amount') || 
                entry.name.toLowerCase().includes('spent'))
                ? formatCurrency(entry.value)
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Custom label component for pie charts
 */
export const CustomPieLabel: React.FC<PieLabelProps> = memo(({ 
  cx, 
  cy, 
  midAngle, 
  innerRadius, 
  outerRadius, 
  percent 
}) => {
  if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent || percent < 0.05) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
      style={{ pointerEvents: 'none' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
});

/**
 * Generate gradient definitions for charts
 */
export const GradientDefs: React.FC<{ prefix: string }> = ({ prefix }) => (
  <defs>
    {GRADIENT_COLORS.map((gradient, index) => (
      <linearGradient 
        key={index} 
        id={`${prefix}Gradient${index}`} 
        x1="0" 
        y1="0" 
        x2="1" 
        y2="1"
      >
        <stop offset="0%" stopColor={gradient.start} stopOpacity={0.9} />
        <stop offset="100%" stopColor={gradient.end} stopOpacity={0.7} />
      </linearGradient>
    ))}
  </defs>
);

/**
 * Generate area gradient definitions for line/area charts
 */
export const AreaGradientDefs: React.FC = () => (
  <defs>
    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.3} />
      <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0.05} />
    </linearGradient>
    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.8} />
      <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0.6} />
    </linearGradient>
  </defs>
);

/**
 * Loading spinner component for charts
 */
export const ChartLoader: React.FC<{ height?: number }> = ({ height = 96 }) => (
  <div className="flex items-center justify-center" style={{ height: `${height * 4}px` }}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
  </div>
);

/**
 * Error display component for charts
 */
export const ChartError: React.FC<{ error: string; height?: number }> = ({ 
  error, 
  height = 96 
}) => (
  <div 
    className="flex items-center justify-center bg-red-50 border border-red-200 text-red-700 rounded-md text-sm"
    style={{ height: `${height * 4}px` }}
  >
    {error}
  </div>
);

/**
 * No data display component for charts
 */
export const ChartNoData: React.FC<{ 
  message?: string; 
  height?: number;
  icon?: React.ReactNode;
}> = ({ 
  message = "No data available", 
  height = 96,
  icon 
}) => (
  <div 
    className="flex flex-col items-center justify-center text-gray-500"
    style={{ height: `${height * 4}px` }}
  >
    {icon && <div className="mb-4">{icon}</div>}
    <p className="text-lg font-medium text-gray-700 mb-2">{message}</p>
    <p className="text-sm text-gray-500">Data will appear once available.</p>
  </div>
);

/**
 * Chart wrapper with consistent styling and error handling
 */
export const ChartWrapper: React.FC<{
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  data?: any[];
  height?: number;
  noDataMessage?: string;
  noDataIcon?: React.ReactNode;
}> = ({ 
  children, 
  loading, 
  error, 
  data, 
  height = 96,
  noDataMessage,
  noDataIcon 
}) => {
  if (loading) {
    return <ChartLoader height={height} />;
  }

  if (error) {
    return <ChartError error={error} height={height} />;
  }

  if (!data || data.length === 0) {
    return (
      <ChartNoData 
        message={noDataMessage} 
        height={height} 
        icon={noDataIcon} 
      />
    );
  }

  return <>{children}</>;
};