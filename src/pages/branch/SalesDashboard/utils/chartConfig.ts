/**
 * Chart Configuration and Utilities
 * Shared configurations, colors, and utility functions for dashboard charts
 */

import type { ChartGradient } from '../types/dashboard';

// Enhanced color palette for better visibility and context
export const CHART_COLORS = [
  '#2563EB', // Strong Blue (Primary)
  '#DC2626', // Strong Red (Revenue/Important)
  '#059669', // Strong Green (Success/Growth)
  '#D97706', // Strong Orange (Warning/Secondary)
  '#7C3AED', // Strong Purple (Premium)
  '#0891B2', // Strong Cyan (Info)
  '#65A30D', // Strong Lime (Nature/Health)
  '#EA580C', // Strong Orange-Red (Alert)
  '#BE185D', // Strong Pink (Accent)
  '#4338CA', // Strong Indigo (Professional)
] as const;

// Gradient color definitions with better contrast
export const GRADIENT_COLORS: ChartGradient[] = [
  { start: '#3B82F6', end: '#1E40AF' }, // Blue gradient (deeper)
  { start: '#EF4444', end: '#B91C1C' }, // Red gradient (deeper)
  { start: '#10B981', end: '#047857' }, // Green gradient (deeper)
  { start: '#F59E0B', end: '#D97706' }, // Amber gradient (deeper)
  { start: '#8B5CF6', end: '#6D28D9' }, // Purple gradient (deeper)
  { start: '#06B6D4', end: '#0E7490' }, // Cyan gradient (deeper)
  { start: '#84CC16', end: '#4D7C0F' }, // Lime gradient (deeper)
  { start: '#F97316', end: '#C2410C' }, // Orange gradient (deeper)
];

// Common chart margins
export const CHART_MARGINS = {
  default: { top: 20, right: 30, left: 20, bottom: 20 },
  withLegend: { top: 20, right: 30, left: 20, bottom: 60 },
  horizontal: { top: 20, right: 30, left: 20, bottom: 100 },
} as const;

// Common chart styles
export const CHART_STYLES = {
  grid: {
    strokeDasharray: "3 3",
    stroke: "#f1f5f9",
    strokeOpacity: 0.6,
  },
  axis: {
    tick: { fontSize: 11, fill: '#64748b' },
    tickLine: false,
    axisLine: false,
  },
  legend: {
    wrapperStyle: { paddingTop: '20px', fontSize: '12px' },
    iconType: 'circle' as const,
  },
} as const;

// Animation configurations
export const CHART_ANIMATIONS = {
  default: {
    animationDuration: 800,
    animationBegin: 0,
  },
  staggered: {
    animationDuration: 600,
    animationBegin: 200,
  },
  fast: {
    animationDuration: 400,
    animationBegin: 0,
  },
} as const;

// Gradient configuration helpers
export const getGradientId = (prefix: string, index: number): string => {
  return `${prefix}Gradient${index % GRADIENT_COLORS.length}`;
};

export const getGradientUrl = (prefix: string, index: number): string => {
  return `url(#${getGradientId(prefix, index)})`;
};

// Predefined gradient IDs for common use cases
export const GRADIENT_IDS = {
  revenue: 'revenueGradient',
  sales: 'salesGradient',
  category: 'categoryGradient',
  payment: 'paymentGradient',
  product: 'productGradient',
} as const;

// Utility functions
export const formatChartDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatChartValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

export const getColorByIndex = (index: number): string => {
  return CHART_COLORS[index % CHART_COLORS.length];
};

export const getGradientById = (index: number, prefix: string): string => {
  return `url(#${prefix}Gradient${index % GRADIENT_COLORS.length})`;
};

// Chart-specific configurations
export const PIE_CHART_CONFIG = {
  outerRadius: 100,
  innerRadius: 40,
  paddingAngle: 2,
  strokeWidth: 2,
  stroke: '#fff',
} as const;

export const BAR_CHART_CONFIG = {
  radius: [4, 4, 0, 0] as [number, number, number, number],
  horizontalRadius: [0, 4, 4, 0] as [number, number, number, number],
} as const;

export const LINE_CHART_CONFIG = {
  strokeWidth: 3,
  dot: { strokeWidth: 2, r: 4 },
  activeDot: { r: 6, strokeWidth: 2 },
} as const;