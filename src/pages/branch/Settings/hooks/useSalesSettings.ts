import { useState, useEffect, useCallback } from 'react';
import { SettingsService } from '../services/settingsService';
import { SalesSettings, ApiResponse } from '../types';

interface UseSalesSettingsReturn {
  settings: SalesSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<SalesSettings>) => Promise<ApiResponse<SalesSettings>>;
  refreshSettings: () => Promise<void>;
}

export const useSalesSettings = (): UseSalesSettingsReturn => {
  const [settings, setSettings] = useState<SalesSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await SettingsService.getSalesSettings();
      
      if (response.error) {
        setError(response.error);
      } else {
        setSettings(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<SalesSettings>): Promise<ApiResponse<SalesSettings>> => {
    try {
      const response = await SettingsService.updateSalesSettings(newSettings);
      
      if (!response.error && response.data) {
        setSettings(response.data);
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update sales settings',
        loading: false,
      };
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings,
  };
}; 