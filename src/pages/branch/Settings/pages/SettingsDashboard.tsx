import React, { useState } from 'react';
import {
  useGeneralSettings,
  useSalesSettings,
  useInventorySettings,
  useUserSettings,
  useNotificationSettings,
  useSecuritySettings,
  useSettingsStats,
} from '../hooks';
import {
  GeneralSettingsForm,
  SalesSettingsForm,
  SecuritySettingsForm,
  SettingsStats,
} from '../components';

export const SettingsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'general' | 'sales' | 'inventory' | 'user' | 'notifications' | 'security' | 'backup' | 'integration' | 'system'>('overview');

  // Hooks for different settings
  const {
    settings: generalSettings,
    loading: generalLoading,
    error: generalError,
    updateSettings: updateGeneralSettings,
  } = useGeneralSettings();

  const {
    settings: salesSettings,
    loading: salesLoading,
    error: salesError,
    updateSettings: updateSalesSettings,
  } = useSalesSettings();

  const {
    settings: inventorySettings,
    loading: inventoryLoading,
    error: inventoryError,
    updateSettings: updateInventorySettings,
  } = useInventorySettings();

  const {
    settings: userSettings,
    loading: userLoading,
    error: userError,
    updateSettings: updateUserSettings,
  } = useUserSettings();

  const {
    settings: notificationSettings,
    loading: notificationLoading,
    error: notificationError,
    updateSettings: updateNotificationSettings,
  } = useNotificationSettings();

  const {
    settings: securitySettings,
    loading: securityLoading,
    error: securityError,
    updateSettings: updateSecuritySettings,
  } = useSecuritySettings();

  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useSettingsStats();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'sales', label: 'Sales', icon: '💰' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'user', label: 'User', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'backup', label: 'Backup', icon: '💾' },
    { id: 'integration', label: 'Integration', icon: '🔗' },
    { id: 'system', label: 'System', icon: '🖥️' },
  ];

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'general':
        return generalLoading;
      case 'sales':
        return salesLoading;
      case 'inventory':
        return inventoryLoading;
      case 'user':
        return userLoading;
      case 'notifications':
        return notificationLoading;
      case 'security':
        return securityLoading;
      default:
        return false;
    }
  };

  const getCurrentError = () => {
    switch (activeTab) {
      case 'general':
        return generalError;
      case 'sales':
        return salesError;
      case 'inventory':
        return inventoryError;
      case 'user':
        return userError;
      case 'notifications':
        return notificationError;
      case 'security':
        return securityError;
      default:
        return null;
    }
  };

  const handleSaveSettings = async (settings: any) => {
    try {
      switch (activeTab) {
        case 'general':
          await updateGeneralSettings(settings);
          break;
        case 'sales':
          await updateSalesSettings(settings);
          break;
        case 'inventory':
          await updateInventorySettings(settings);
          break;
        case 'user':
          await updateUserSettings(settings);
          break;
        case 'notifications':
          await updateNotificationSettings(settings);
          break;
        case 'security':
          await updateSecuritySettings(settings);
          break;
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {statsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading settings overview...</p>
                </div>
              ) : statsError ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{statsError}</p>
                </div>
              ) : (
                <SettingsStats stats={stats} loading={statsLoading} />
              )}
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div>
              {getCurrentError() ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{getCurrentError()}</p>
                </div>
              ) : (
                <GeneralSettingsForm
                  settings={generalSettings}
                  onSave={handleSaveSettings}
                  loading={getCurrentLoading()}
                />
              )}
            </div>
          )}

          {/* Sales Settings Tab */}
          {activeTab === 'sales' && (
            <div>
              {getCurrentError() ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{getCurrentError()}</p>
                </div>
              ) : (
                <SalesSettingsForm
                  settings={salesSettings}
                  onSave={handleSaveSettings}
                  loading={getCurrentLoading()}
                />
              )}
            </div>
          )}

          {/* Inventory Settings Tab */}
          {activeTab === 'inventory' && (
            <div>
              {getCurrentError() ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{getCurrentError()}</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="auto_update_stock"
                        checked={inventorySettings?.auto_update_stock || false}
                        onChange={(e) => handleSaveSettings({ auto_update_stock: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="auto_update_stock" className="ml-2 text-sm text-gray-700">
                        Automatically update stock levels
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="track_expiry_dates"
                        checked={inventorySettings?.track_expiry_dates || false}
                        onChange={(e) => handleSaveSettings({ track_expiry_dates: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="track_expiry_dates" className="ml-2 text-sm text-gray-700">
                        Track product expiry dates
                      </label>
                    </div>

                    <div>
                      <label htmlFor="expiry_alert_days" className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Alert Days
                      </label>
                      <input
                        type="number"
                        id="expiry_alert_days"
                        value={inventorySettings?.expiry_alert_days || 30}
                        onChange={(e) => handleSaveSettings({ expiry_alert_days: parseInt(e.target.value) || 30 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="30"
                        min="1"
                        max="365"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="barcode_enabled"
                        checked={inventorySettings?.barcode_enabled || false}
                        onChange={(e) => handleSaveSettings({ barcode_enabled: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="barcode_enabled" className="ml-2 text-sm text-gray-700">
                        Enable barcode scanning
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sku_auto_generate"
                        checked={inventorySettings?.sku_auto_generate || false}
                        onChange={(e) => handleSaveSettings({ sku_auto_generate: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sku_auto_generate" className="ml-2 text-sm text-gray-700">
                        Auto-generate SKU codes
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Settings Tab */}
          {activeTab === 'user' && (
            <div>
              {getCurrentError() ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{getCurrentError()}</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">User Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select
                        id="theme"
                        value={userSettings?.theme || 'light'}
                        onChange={(e) => handleSaveSettings({ theme: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="notifications_enabled"
                        checked={userSettings?.notifications_enabled || false}
                        onChange={(e) => handleSaveSettings({ notifications_enabled: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="notifications_enabled" className="ml-2 text-sm text-gray-700">
                        Enable notifications
                      </label>
                    </div>

                    <div>
                      <label htmlFor="auto_logout_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                        Auto Logout (minutes)
                      </label>
                      <input
                        type="number"
                        id="auto_logout_minutes"
                        value={userSettings?.auto_logout_minutes || 30}
                        onChange={(e) => handleSaveSettings({ auto_logout_minutes: parseInt(e.target.value) || 30 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="30"
                        min="5"
                        max="480"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Settings Tab */}
          {activeTab === 'notifications' && (
            <div>
              {getCurrentError() ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{getCurrentError()}</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="low_stock_alerts"
                          checked={notificationSettings?.low_stock_alerts || false}
                          onChange={(e) => handleSaveSettings({ low_stock_alerts: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="low_stock_alerts" className="ml-2 text-sm text-gray-700">
                          Low stock alerts
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="expiry_alerts"
                          checked={notificationSettings?.expiry_alerts || false}
                          onChange={(e) => handleSaveSettings({ expiry_alerts: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="expiry_alerts" className="ml-2 text-sm text-gray-700">
                          Expiry date alerts
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sales_alerts"
                          checked={notificationSettings?.sales_alerts || false}
                          onChange={(e) => handleSaveSettings({ sales_alerts: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sales_alerts" className="ml-2 text-sm text-gray-700">
                          Sales alerts
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="customer_alerts"
                          checked={notificationSettings?.customer_alerts || false}
                          onChange={(e) => handleSaveSettings({ customer_alerts: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="customer_alerts" className="ml-2 text-sm text-gray-700">
                          Customer alerts
                        </label>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="alert_frequency" className="block text-sm font-medium text-gray-700 mb-2">
                        Alert Frequency
                      </label>
                      <select
                        id="alert_frequency"
                        value={notificationSettings?.alert_frequency || 'immediate'}
                        onChange={(e) => handleSaveSettings({ alert_frequency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Settings Tab */}
          {activeTab === 'security' && (
            <div>
              {getCurrentError() ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{getCurrentError()}</p>
                </div>
              ) : (
                <SecuritySettingsForm
                  settings={securitySettings}
                  onSave={handleSaveSettings}
                  loading={getCurrentLoading()}
                />
              )}
            </div>
          )}

          {/* Backup Settings Tab */}
          {activeTab === 'backup' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Backup Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto_backup_enabled"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto_backup_enabled" className="ml-2 text-sm text-gray-700">
                    Enable automatic backups
                  </label>
                </div>

                <div>
                  <label htmlFor="backup_frequency" className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    id="backup_frequency"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="backup_retention_days" className="block text-sm font-medium text-gray-700 mb-2">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    id="backup_retention_days"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                    min="1"
                    max="365"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Integration Settings Tab */}
          {activeTab === 'integration' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Integration Settings</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">SMS Provider</h4>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select SMS provider</option>
                    <option value="twilio">Twilio</option>
                    <option value="africastalking">Africa's Talking</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Email Provider</h4>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select email provider</option>
                    <option value="smtp">SMTP</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
                  </select>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Payment Gateway</h4>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select payment gateway</option>
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="mpesa">M-Pesa</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === 'system' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">System Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenance_mode"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="maintenance_mode" className="ml-2 text-sm text-gray-700">
                    Maintenance mode
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="debug_mode"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="debug_mode" className="ml-2 text-sm text-gray-700">
                    Debug mode
                  </label>
                </div>

                <div>
                  <label htmlFor="log_level" className="block text-sm font-medium text-gray-700 mb-2">
                    Log Level
                  </label>
                  <select
                    id="log_level"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="cache_enabled"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="cache_enabled" className="ml-2 text-sm text-gray-700">
                    Enable caching
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 