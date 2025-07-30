/**
 * Reusable Pie Chart Component
 * Generic pie chart for categories, payment methods, etc.
 */

import React, { memo, useCallback, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { PieChartProps } from '../../types/dashboard';
import { 
  CustomTooltip, 
  ChartWrapper, 
  GradientDefs 
} from '../../utils/chartUtils';
import { 
  PIE_CHART_CONFIG,
  getGradientUrl
} from '../../utils/chartConfig';
import { FiPieChart } from 'react-icons/fi';

const ReusablePieChartComponent: React.FC<PieChartProps> = ({
  data,
  loading,
  error,
  height = 80,
  formatCurrency,
  title,
  dataKey
}) => {
  // Create a stable label component to prevent blinking
  const StableLabel = useCallback((props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    
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
  }, []);
  
  // Memoize gradient prefix to prevent unnecessary re-renders
  const gradientPrefix = useMemo(() => 
    title?.toLowerCase().replace(/\s+/g, '') || 'chart', 
    [title]
  );

  // Memoize tooltip content to prevent flickering
  const tooltipContent = useCallback(
    (props: any) => <CustomTooltip formatCurrency={formatCurrency} {...props} />,
    [formatCurrency]
  );

  // Memoize gradient URLs to prevent recalculation
  const gradientUrls = useMemo(() => 
    data?.map((_, index) => getGradientUrl(gradientPrefix, index)) || [],
    [data, gradientPrefix]
  );

  return (
    <ChartWrapper
      loading={loading}
      error={error}
      data={data}
      height={height}
      noDataMessage={`No ${title?.toLowerCase() || 'chart'} data available`}
      noDataIcon={<FiPieChart className="h-12 w-12 text-gray-400" />}
    >
      <div style={{ height: `${height * 4}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <GradientDefs prefix={gradientPrefix} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={StableLabel}
              outerRadius={PIE_CHART_CONFIG.outerRadius}
              innerRadius={PIE_CHART_CONFIG.innerRadius}
              paddingAngle={PIE_CHART_CONFIG.paddingAngle}
              dataKey={dataKey}
              animationDuration={0}
              animationBegin={0}
              animationEasing="linear"
              isAnimationActive={false}
              key={`pie-${title}`}
            >
              {data?.map((entry, index) => (
                <Cell
                  key={`cell-${title}-${index}`}
                  fill={gradientUrls[index]}
                  stroke={PIE_CHART_CONFIG.stroke}
                  strokeWidth={PIE_CHART_CONFIG.strokeWidth}
                />
              ))}
            </Pie>
            <Tooltip
              content={tooltipContent}
              animationDuration={150}
              animationEasing="ease-out"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartWrapper>
  );
};

export const ReusablePieChart = memo(ReusablePieChartComponent);