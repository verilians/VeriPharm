// Base API Response type
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// General Settings
export interface GeneralSettings {
  id: string;
  branch_id: string;
  tenant_id: string;
  business_name: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  business_website?: string;
  tax_number?: string;
  currency: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  language: string;
  created_at: string;
  updated_at: string;
}

// Sales Settings
export interface SalesSettings {
  id: string;
  branch_id: string;
  tenant_id: string;
  tax_enabled: boolean;
  tax_rate: number;
  tax_name: string;
  discount_enabled: boolean;
  max_discount_percentage: number;
  receipt_header?: string;
  receipt_footer?: string;
  receipt_logo_url?: string;
  auto_print_receipts: boolean;
  require_customer_info: boolean;
  allow_negative_stock: boolean;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

// Inventory Settings
export interface InventorySettings {
  id: string;
  branch_id: string;
  tenant_id: string;
  auto_update_stock: boolean;
  track_expiry_dates: boolean;
  expiry_alert_days: number;
  barcode_enabled: boolean;
  barcode_prefix?: string;
  sku_auto_generate: boolean;
  sku_prefix?: string;
  sku_counter: number;
  stock_audit_frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  last_audit_date?: string;
  created_at: string;
  updated_at: string;
}

// User Settings
export interface UserSettings {
  id: string;
  user_id: string;
  branch_id: string;
  tenant_id: string;
  theme: 'light' | 'dark' | 'auto';
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  dashboard_layout: 'grid' | 'list';
  default_page_size: number;
  auto_logout_minutes: number;
  created_at: string;
  updated_at: string;
}

// Notification Settings
export interface NotificationSettings {
  id: string;
  branch_id: string;
  tenant_id: string;
  low_stock_alerts: boolean;
  expiry_alerts: boolean;
  sales_alerts: boolean;
  purchase_alerts: boolean;
  customer_alerts: boolean;
  audit_reminders: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  alert_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  created_at: string;
  updated_at: string;
}

// Backup Settings
export interface BackupSettings {
  id: string;
  branch_id: string;
  tenant_id: string;
  auto_backup_enabled: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  backup_retention_days: number;
  backup_location: 'local' | 'cloud';
  cloud_provider?: 'aws' | 'google' | 'azure';
  last_backup_date?: string;
  next_backup_date?: string;
  created_at: string;
  updated_at: string;
}

// Security Settings
export interface SecuritySettings {
  id: string;
  branch_id: string;
  tenant_id: string;
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_special: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  two_factor_enabled: boolean;
  ip_whitelist?: string[];
  created_at: string;
  updated_at: string;
}

// Integration Settings
export interface IntegrationSettings {
  id: string;
  branch_id: string;
  tenant_id: string;
  sms_provider?: 'twilio' | 'africastalking' | 'custom';
  sms_api_key?: string;
  sms_api_secret?: string;
  email_provider?: 'smtp' | 'sendgrid' | 'mailgun';
  email_api_key?: string;
  email_from_address?: string;
  payment_gateway?: 'stripe' | 'paypal' | 'mpesa';
  payment_api_key?: string;
  payment_webhook_url?: string;
  created_at: string;
  updated_at: string;
}

// System Settings
export interface SystemSettings {
  id: string;
  branch_id: string;
  tenant_id: string;
  maintenance_mode: boolean;
  debug_mode: boolean;
  log_level: 'error' | 'warning' | 'info' | 'debug';
  cache_enabled: boolean;
  cache_ttl_minutes: number;
  rate_limiting_enabled: boolean;
  max_requests_per_minute: number;
  created_at: string;
  updated_at: string;
}

// Settings Categories
export interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  permissions: string[];
}

// Settings Update Request
export interface SettingsUpdateRequest {
  category: string;
  settings: Partial<GeneralSettings | SalesSettings | InventorySettings | UserSettings | NotificationSettings | BackupSettings | SecuritySettings | IntegrationSettings | SystemSettings>;
}

// Settings Validation
export interface SettingsValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

// Settings Export/Import
export interface SettingsExport {
  version: string;
  export_date: string;
  branch_id: string;
  settings: {
    general?: GeneralSettings;
    sales?: SalesSettings;
    inventory?: InventorySettings;
    notifications?: NotificationSettings;
    backup?: BackupSettings;
    security?: SecuritySettings;
    integration?: IntegrationSettings;
    system?: SystemSettings;
  };
}

// Settings Statistics
export interface SettingsStats {
  total_settings: number;
  categories_count: number;
  last_updated: string;
  backup_status: 'enabled' | 'disabled' | 'error';
  notifications_enabled: boolean;
  security_score: number;
}

// Settings Filter
export interface SettingsFilters {
  category?: string;
  search?: string;
  status?: 'active' | 'inactive' | 'error';
  sortBy?: 'name' | 'updated_at' | 'category';
  sortOrder?: 'asc' | 'desc';
} 