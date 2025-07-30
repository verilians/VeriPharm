import { useState, useEffect, useCallback } from 'react';
import { SettingsService } from '../services/settingsService';
import { SettingsStats, ApiResponse } from '../types';

interface UseSettingsStatsReturn {
  stats: SettingsStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const useSettingsStats = (): UseSettingsStatsReturn => {
  const [stats, setStats] = useState<SettingsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await SettingsService.getSettingsStats();
      
      if (response.error) {
        setError(response.error);
      } else {
        setStats(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings statistics');
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