import { useState, useEffect, useCallback } from 'react';
import { ReportsService } from '../services/reportsService';
import type { DashboardSummary } from '../types';

interface UseDashboardSummaryReturn {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  refreshSummary: () => Promise<void>;
}

export const useDashboardSummary = (): UseDashboardSummaryReturn => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ReportsService.getDashboardSummary();
      
      if (response.error) {
        setError(response.error);
      } else {
        setSummary(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard summary');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSummary = useCallback(async () => {
    await fetchSummary();
  }, [fetchSummary]);

  // Fetch summary on mount
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refreshSummary,
  };
}; 