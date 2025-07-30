import { useState, useEffect, useCallback } from 'react';
import { SettingsService } from '../services/settingsService';
import type { GeneralSettings, ApiResponse } from '../types';

interface UseGeneralSettingsReturn {
  settings: GeneralSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<GeneralSettings>) => Promise<ApiResponse<GeneralSettings>>;
  refreshSettings: () => Promise<void>;
}

export const useGeneralSettings = (): UseGeneralSettingsReturn => {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await SettingsService.getGeneralSettings();
      
      if (response.error) {
        setError(response.error);
      } else {
        setSettings(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch general settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<GeneralSettings>): Promise<ApiResponse<GeneralSettings>> => {
    try {
      const response = await SettingsService.updateGeneralSettings(newSettings);
      
      if (!response.error && response.data) {
        setSettings(response.data);
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update general settings',
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