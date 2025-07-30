import { supabase } from '../../../../lib/supabase/supabaseClient';
import type {
  GeneralSettings,
  SalesSettings,
  InventorySettings,
  UserSettings,
  NotificationSettings,
  BackupSettings,
  SecuritySettings,
  IntegrationSettings,
  SystemSettings,
  SettingsUpdateRequest,
  SettingsValidation,
  SettingsExport,
  SettingsStats,
  SettingsFilters,
  ApiResponse,
} from '../types';

export class SettingsService {
  private static getBranchId(): string {
    // In a real app, this would come from auth context
    return 'branch-123'; // Replace with actual branch ID
  }

  private static getUserId(): string {
    // In a real app, this would come from auth context
    return 'user-123'; // Replace with actual user ID
  }

  // General Settings
  static async getGeneralSettings(): Promise<ApiResponse<GeneralSettings>> {
    try {
      const { data, error } = await supabase
        .from('general_settings')
        .select('*')
        .eq('branch_id', this.getBranchId())
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch general settings',
        loading: false,
      };
    }
  }

  static async updateGeneralSettings(settings: Partial<GeneralSettings>): Promise<ApiResponse<GeneralSettings>> {
    try {
      const { data, error } = await supabase
        .from('general_settings')
        .upsert({
          ...settings,
          branch_id: this.getBranchId(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update general settings',
        loading: false,
      };
    }
  }

  // Sales Settings
  static async getSalesSettings(): Promise<ApiResponse<SalesSettings>> {
    try {
      const { data, error } = await supabase
        .from('sales_settings')
        .select('*')
        .eq('branch_id', this.getBranchId())
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch sales settings',
        loading: false,
      };
    }
  }

  static async updateSalesSettings(settings: Partial<SalesSettings>): Promise<ApiResponse<SalesSettings>> {
    try {
      const { data, error } = await supabase
        .from('sales_settings')
        .upsert({
          ...settings,
          branch_id: this.getBranchId(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update sales settings',
        loading: false,
      };
    }
  }

  // Inventory Settings
  static async getInventorySettings(): Promise<ApiResponse<InventorySettings>> {
    try {
      const { data, error } = await supabase
        .from('inventory_settings')
        .select('*')
        .eq('branch_id', this.getBranchId())
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch inventory settings',
        loading: false,
      };
    }
  }

  static async updateInventorySettings(settings: Partial<InventorySettings>): Promise<ApiResponse<InventorySettings>> {
    try {
      const { data, error } = await supabase
        .from('inventory_settings')
        .upsert({
          ...settings,
          branch_id: this.getBranchId(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update inventory settings',
        loading: false,
      };
    }
  }

  // User Settings
  static async getUserSettings(): Promise<ApiResponse<UserSettings>> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', this.getUserId())
        .eq('branch_id', this.getBranchId())
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch user settings',
        loading: false,
      };
    }
  }

  static async updateUserSettings(settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          ...settings,
          user_id: this.getUserId(),
          branch_id: this.getBranchId(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update user settings',
        loading: false,
      };
    }
  }

  // Notification Settings
  static async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('branch_id', this.getBranchId())
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch notification settings',
        loading: false,
      };
    }
  }

  static async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .upsert({
          ...settings,
          branch_id: this.getBranchId(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update notification settings',
        loading: false,
      };
    }
  }

  // Backup Settings
  static async getBackupSettings(): Promise<ApiResponse<BackupSettings>> {
    try {
      const { data, error } = await supabase
        .from('backup_settings')
        .select('*')
        .eq('branch_id', this.getBranchId())
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch backup settings',
        loading: false,
      };
    }
  }

  static async updateBackupSettings(settings: Partial<BackupSettings>): Promise<ApiResponse<BackupSettings>> {
    try {
      const { data, error } = await supabase
        .from('backup_settings')
        .upsert({
          ...settings,
          branch_id: this.getBranchId(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update backup settings',
        loading: false,
      };
    }
  }

  // Security Settings
  static async getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    try {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('branch_id', this.getBranchId())
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch security settings',
        loading: false,
      };
    }
  }

  static async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<ApiResponse<SecuritySettings>> {
    try {
      const { data, error } = await supabase
        .from('security_settings')
        .upsert({
          ...settings,
          branch_id: this.getBranchId(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update security settings',
        loading: false,
      };
    }
  }

  // Integration Settings
  static async getIntegrationSettings(): Promise<ApiResponse<IntegrationSettings>> {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('branch_id', this.getBranchId())
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch integration settings',
        loading: false,
      };
    }
  }

  static async updateIntegrationSettings(settings: Partial<IntegrationSettings>): Promise<ApiResponse<IntegrationSettings>> {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .upsert({
          ...settings,
          branch_id: this.getBranchId(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update integration settings',
        loading: false,
      };
    }
  }

  // System Settings
  static async getSystemSettings(): Promise<ApiResponse<SystemSettings>> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('branch_id', this.getBranchId())
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch system settings',
        loading: false,
      };
    }
  }

  static async updateSystemSettings(settings: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .upsert({
          ...settings,
          branch_id: this.getBranchId(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update system settings',
        loading: false,
      };
    }
  }

  // Settings Validation
  static validateSettings(category: string, settings: any): SettingsValidation {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    switch (category) {
      case 'general':
        if (!settings.business_name?.trim()) {
          errors.business_name = 'Business name is required';
        }
        if (settings.business_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.business_email)) {
          errors.business_email = 'Invalid email format';
        }
        break;

      case 'sales':
        if (settings.tax_enabled && (settings.tax_rate < 0 || settings.tax_rate > 100)) {
          errors.tax_rate = 'Tax rate must be between 0 and 100';
        }
        if (settings.max_discount_percentage < 0 || settings.max_discount_percentage > 100) {
          errors.max_discount_percentage = 'Max discount must be between 0 and 100';
        }
        break;

      case 'inventory':
        if (settings.low_stock_threshold < 0) {
          errors.low_stock_threshold = 'Low stock threshold cannot be negative';
        }
        if (settings.expiry_alert_days < 0) {
          errors.expiry_alert_days = 'Expiry alert days cannot be negative';
        }
        break;

      case 'security':
        if (settings.password_min_length < 6) {
          errors.password_min_length = 'Password minimum length must be at least 6';
        }
        if (settings.session_timeout_minutes < 5) {
          errors.session_timeout_minutes = 'Session timeout must be at least 5 minutes';
        }
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    };
  }

  // Settings Export/Import
  static async exportSettings(): Promise<ApiResponse<SettingsExport>> {
    try {
      const [
        generalSettings,
        salesSettings,
        inventorySettings,
        notificationSettings,
        backupSettings,
        securitySettings,
        integrationSettings,
        systemSettings,
      ] = await Promise.all([
        this.getGeneralSettings(),
        this.getSalesSettings(),
        this.getInventorySettings(),
        this.getNotificationSettings(),
        this.getBackupSettings(),
        this.getSecuritySettings(),
        this.getIntegrationSettings(),
        this.getSystemSettings(),
      ]);

      const exportData: SettingsExport = {
        version: '1.0.0',
        export_date: new Date().toISOString(),
        branch_id: this.getBranchId(),
        settings: {
          general: generalSettings.data || undefined,
          sales: salesSettings.data || undefined,
          inventory: inventorySettings.data || undefined,
          notifications: notificationSettings.data || undefined,
          backup: backupSettings.data || undefined,
          security: securitySettings.data || undefined,
          integration: integrationSettings.data || undefined,
          system: systemSettings.data || undefined,
        },
      };

      return {
        data: exportData,
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to export settings',
        loading: false,
      };
    }
  }

  // Settings Statistics
  static async getSettingsStats(): Promise<ApiResponse<SettingsStats>> {
    try {
      // In a real implementation, this would calculate actual statistics
      return {
        data: {
          total_settings: 8,
          categories_count: 8,
          last_updated: new Date().toISOString(),
          backup_status: 'enabled',
          notifications_enabled: true,
          security_score: 85,
        },
        error: null,
        loading: false,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch settings statistics',
        loading: false,
      };
    }
  }
} 