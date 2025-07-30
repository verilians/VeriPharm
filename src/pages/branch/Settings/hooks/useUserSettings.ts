import { useState, useEffect, useCallback } from 'react';
import { SettingsService } from '../services/settingsService';
import { UserSettings, ApiResponse } from '../types';

interface UseUserSettingsReturn {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<UserSettings>) => Promise<ApiResponse<UserSettings>>;
  refreshSettings: () => Promise<void>;
}

export const useUserSettings = (): UseUserSettingsReturn => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await SettingsService.getUserSettings();
      
      if (response.error) {
        setError(response.error);
      } else {
        setSettings(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> => {
    try {
      const response = await SettingsService.updateUserSettings(newSettings);
      
      if (!response.error && response.data) {
        setSettings(response.data);
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update user settings',
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