import { useState, useEffect, useCallback } from 'react';
import { SettingsService } from '../services/settingsService';
import { SecuritySettings, ApiResponse } from '../types';

interface UseSecuritySettingsReturn {
  settings: SecuritySettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<SecuritySettings>) => Promise<ApiResponse<SecuritySettings>>;
  refreshSettings: () => Promise<void>;
}

export const useSecuritySettings = (): UseSecuritySettingsReturn => {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await SettingsService.getSecuritySettings();
      
      if (response.error) {
        setError(response.error);
      } else {
        setSettings(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<SecuritySettings>): Promise<ApiResponse<SecuritySettings>> => {
    try {
      const response = await SettingsService.updateSecuritySettings(newSettings);
      
      if (!response.error && response.data) {
        setSettings(response.data);
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update security settings',
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