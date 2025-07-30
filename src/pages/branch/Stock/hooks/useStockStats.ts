import { useState, useEffect, useCallback } from 'react';
import { StockService } from '../services/stockService';
import type { StockStats } from '../types';

interface UseStockStatsReturn {
  stats: StockStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const useStockStats = (): UseStockStatsReturn => {
  const [stats, setStats] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await StockService.getStockStats();
      
      if (response.error) {
        setError(response.error);
      } else {
        setStats(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock statistics');
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