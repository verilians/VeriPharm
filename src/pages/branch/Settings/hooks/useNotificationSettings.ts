import { useState, useEffect, useCallback } from 'react';
import { SettingsService } from '../services/settingsService';
import { NotificationSettings, ApiResponse } from '../types';

interface UseNotificationSettingsReturn {
  settings: NotificationSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<ApiResponse<NotificationSettings>>;
  refreshSettings: () => Promise<void>;
}

export const useNotificationSettings = (): UseNotificationSettingsReturn => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await SettingsService.getNotificationSettings();
      
      if (response.error) {
        setError(response.error);
      } else {
        setSettings(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notification settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> => {
    try {
      const response = await SettingsService.updateNotificationSettings(newSettings);
      
      if (!response.error && response.data) {
        setSettings(response.data);
      }
      
      return response;
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update notification settings',
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