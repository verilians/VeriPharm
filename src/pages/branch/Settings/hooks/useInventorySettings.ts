import { useState, useEffect, useCallback } from 'react';
import { SettingsService } from '../services/settingsService';
import type { InventorySettings, ApiResponse } from '../types';

interface UseInventorySettingsReturn {
  settings: InventorySettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<InventorySettings>) => Promise<ApiResponse<InventorySettings>>;
  refreshSettings: () => Promise<void>;
}

export const useInventorySettings = (): UseInventorySettingsReturn => {
  const [settings, setSettings] = useState<InventorySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await SettingsService.getInventorySettings();
      
      if (response.error) {
        setError(response.error);
      } else {
        setSettings(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<InventorySettings>): Promise<ApiResponse<InventorySettings>> => {
    try {
      const response = await SettingsService.updateInventorySettings(newSettings);
      
      if (!response.error && response.data) {
        setSettings(response.data);
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update inventory settings',
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