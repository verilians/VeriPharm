import { useState, useEffect, useCallback } from 'react';
import { ReportsService } from '../services/reportsService';
import type { ReportStats } from '../types';

interface UseReportStatsReturn {
  stats: ReportStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const useReportStats = (): UseReportStatsReturn => {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ReportsService.getReportStats();
      
      if (response.error) {
        setError(response.error);
      } else {
        setStats(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
}; 