import { useState, useEffect, useCallback } from 'react';
import { SupplierService } from '../services/supplierService';
import type { SupplierStats } from '../types';

interface UseSupplierStatsReturn {
  stats: SupplierStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const useSupplierStats = (): UseSupplierStatsReturn => {
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await SupplierService.getSupplierStats();
      
      if (response.error) {
        setError(response.error);
      } else {
        setStats(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch supplier statistics');
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