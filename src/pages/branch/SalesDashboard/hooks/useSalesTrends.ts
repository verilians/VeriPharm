/**
 * Sales Trends Data Hook
 * Custom hook for fetching and managing sales trends data
 */

import { useState, useCallback, useEffect } from 'react';
import { supabaseAdmin } from '../../../../lib/supabase/supabaseClient';
import { useAuthStore } from '../../../../stores/authStore';
import type { SalesData, DashboardDataState } from '../types/dashboard';
import { generateSampleSalesData } from '../utils/sampleData';

export type DateRange = '7d' | '30d' | '90d' | 'custom';

interface UseSalesTrendsOptions {
  dateRange?: DateRange;
  startDate?: Date;
  endDate?: Date;
}

export const useSalesTrends = (
  refreshTrigger?: number,
  options: UseSalesTrendsOptions = {}
): DashboardDataState<SalesData[]> & {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  availableRanges: { value: DateRange; label: string }[];
} => {
  const { user } = useAuthStore();
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(options.dateRange || '7d');

  const availableRanges = [
    { value: '7d' as DateRange, label: 'Last 7 days' },
    { value: '30d' as DateRange, label: 'Last 30 days' },
    { value: '90d' as DateRange, label: 'Last 90 days' },
  ];

  const getDateRangeInDays = (range: DateRange): number => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  };

  const fetchSalesTrends = useCallback(async () => {
    if (!user?.tenant_id || !user?.branch_id) {
      setError('Missing user authentication data');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const daysBack = getDateRangeInDays(dateRange);
      const startDate = options.startDate || new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      
      const endDate = options.endDate || new Date();

      const { data: salesData, error: salesError } = await supabaseAdmin
        .from('sales')
        .select(`
          sale_date,
          total_amount,
          transaction_number
        `)
        .eq('tenant_id', user.tenant_id)
        .eq('branch_id', user.branch_id)
        .eq('status', 'completed')
        .gte('sale_date', startDate.toISOString())
        .lte('sale_date', endDate.toISOString())
        .order('sale_date', { ascending: true });

      if (salesError) {
        throw new Error(salesError.message);
      }

      // Create a complete date range for the selected period
      const dateRangeArray = [];
      const days = getDateRangeInDays(dateRange);
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dateRangeArray.push(date.toISOString().split('T')[0]);
      }

      // Group by date and calculate daily totals
      const dailyData = dateRangeArray.map(date => {
        const salesForDate = (salesData || []).filter((sale: { sale_date: string }) =>
          sale.sale_date.split('T')[0] === date
        );

        return {
          date,
          sales: salesForDate.length,
          revenue: salesForDate.reduce((sum: number, sale: { total_amount: number }) => 
            sum + sale.total_amount, 0
          ),
          transactions: salesForDate.length
        };
      });

      // If no real data, use sample data for testing
      const finalData = dailyData.some(d => d.sales > 0) ? dailyData : generateSampleSalesData(getDateRangeInDays(dateRange));
      setData(finalData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales trends';
      setError(errorMessage);
      console.error('Error fetching sales trends:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id, user?.branch_id, dateRange, options.startDate, options.endDate]);

  useEffect(() => {
    fetchSalesTrends();
  }, [fetchSalesTrends, refreshTrigger]);

  return {
    data,
    loading,
    error,
    refetch: fetchSalesTrends,
    dateRange,
    setDateRange,
    availableRanges
  };
};