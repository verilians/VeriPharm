import React, { useState, useEffect } from "react";
import {
  FiSave,
  FiRefreshCw,
  FiUser,
  FiShield,
  FiDatabase,
  FiBell,
  FiMoon,
  FiSun,
  FiGlobe,
  FiDollarSign,
  FiPackage,
  FiMail,
  FiPhone,
  FiMapPin,
  FiChevronRight,
  FiCheck,
  FiXCircle,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiExternalLink,
  FiSettings as FiSettingsIcon,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiStar,
  FiMoreHorizontal,
  FiChevronUp,
  FiChevronDown,
  FiFilter,
  FiTarget,
  FiAward,
  FiClock,
  FiShield as FiShieldIcon,
  FiLock,
  FiUnlock,
  FiEye,
  FiEyeOff
} from "react-icons/fi";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";

// Types
interface Settings {
  id?: string;
  user_id: string;
  store_name: string;
  pharmacy_name: string;
  address: string;
  phone: string;
  email: string;
  pharmacy_license: string;
  currency: string;
  tax_rate: number;
  timezone: string;
  date_format: string;
  low_stock_threshold: number;
  auto_reorder_point: number;
  low_stock_alerts: boolean;
  expiry_alerts: boolean;
  alert_threshold: number;
  theme: 'light' | 'dark';
  language: string;
  session_timeout: number;
  enable_audit_log: boolean;
  synced: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

interface Message {
  type: 'success' | 'error' | '';
  text: string;
}

const Settings: React.FC = () => {
  const { user } = useAuthStore();
  
  // State
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>({ type: "", text: "" });
  const [formSettings, setFormSettings] = useState<Settings | null>(null);

  // Tab configuration
  const tabs: Tab[] = [
    { id: "general", label: "General", icon: FiSettingsIcon, description: "Basic settings", color: "blue" },
    { id: "business", label: "Business", icon: FiUser, description: "Store info", color: "green" },
    { id: "notifications", label: "Notifications", icon: FiBell, description: "Alerts & notifications", color: "orange" },
    { id: "appearance", label: "Appearance", icon: FiMoon, description: "Theme & UI", color: "purple" },
    { id: "system", label: "System", icon: FiDatabase, description: "Advanced settings", color: "red" },
  ];

  // Fetch settings from database
  const fetchSettings = async () => {
    if (!user?.id) {
      console.log("❌ No user ID, skipping settings fetch");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("🔄 [Settings] Fetching settings for user:", user.id);

      const { data, error } = await supabaseAdmin
        .from('settings')
        .select('*')
        .eq('tenant_id', user.tenant_id) // Use correct field name from schema
        .eq('branch_id', user.branch_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        console.log("✅ [Settings] Loaded settings:", data);
        setSettings(data);
        setFormSettings(data);
      } else {
        console.log("ℹ️ [Settings] No settings found, creating default");
        const defaultSettings: Settings = {
          user_id: user.id,
          store_name: "",
          pharmacy_name: "",
          address: "",
          phone: "",
          email: user.email || "",
          pharmacy_license: "",
          currency: "UGX",
          tax_rate: 18,
          timezone: "Africa/Kampala",
          date_format: "DD/MM/YYYY",
          low_stock_threshold: 10,
          auto_reorder_point: 5,
          low_stock_alerts: true,
          expiry_alerts: true,
          alert_threshold: 30,
          theme: "light",
          language: "en",
          session_timeout: 30,
          enable_audit_log: true,
          synced: false,
        };
        setSettings(defaultSettings);
        setFormSettings(defaultSettings);
      }
    } catch (error) {
      console.error("❌ [Settings] Error fetching settings:", error);
      setError("Failed to load settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update form setting
  const updateFormSetting = (key: keyof Settings, value: any) => {
    if (formSettings) {
      setFormSettings({ ...formSettings, [key]: value });
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    if (!formSettings || !user?.id) return;

    try {
      setSaving(true);
      console.log("🔄 [Settings] Saving settings...");

      const { error } = await supabaseAdmin
        .from('settings')
        .upsert({
          ...formSettings,
          tenant_id: user.tenant_id, // Use correct field names from schema
          branch_id: user.branch_id,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      console.log("✅ [Settings] Settings saved successfully");
      setSettings(formSettings);
      setMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("❌ [Settings] Error saving settings:", error);
      setMessage({ type: "error", text: "Failed to save settings. Please try again." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Reset settings
  const handleResetSettings = () => {
    if (settings) {
      setFormSettings(settings);
      setMessage({ type: "success", text: "Settings reset to last saved state" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  // Fetch settings when user is available
  useEffect(() => {
    if (user) {
      fetchSettings();
    } else if (user === null) {
      // If user is explicitly null (not logged in), stop loading
      setIsLoading(false);
    }
  }, [user]);

  // Add a timeout fallback to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log("⚠️ [Settings] Loading timeout, stopping loading state");
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="settings-modern-container">
        <div className="settings-modern-loading">
          <div className="settings-modern-loading-spinner"></div>
          <p className="settings-modern-loading-text">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="settings-modern-container">
        <div className="settings-modern-auth-required">
          <FiAlertCircle className="settings-modern-auth-icon" />
          <h3 className="settings-modern-auth-title">Authentication Required</h3>
          <p className="settings-modern-auth-subtitle">
            Please log in to access settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-modern-container">
      {/* Header Section */}
      <div className="settings-modern-header">
        <div className="settings-modern-header-right">
          <button 
            onClick={handleResetSettings}
            className="settings-modern-reset-btn"
          >
            <FiRefreshCw size={16} />
            Reset
          </button>
          
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="settings-modern-save-btn"
          >
            <FiSave size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`settings-modern-message ${message.type}`}>
          {message.type === "success" ? (
            <FiCheck className="settings-modern-message-icon" />
          ) : (
            <FiXCircle className="settings-modern-message-icon" />
          )}
          <span className="settings-modern-message-text">{message.text}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="settings-modern-content">
        {/* Sidebar Navigation */}
        <div className="settings-modern-sidebar">
          <div className="settings-modern-sidebar-header">
            <h3 className="settings-modern-sidebar-title">Settings Categories</h3>
          </div>

          <div className="settings-modern-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`settings-modern-tab ${isActive ? 'active' : ''} ${tab.color}`}
                >
                  <div className="settings-modern-tab-icon">
                    <Icon size={20} />
                  </div>
                  <div className="settings-modern-tab-content">
                    <div className="settings-modern-tab-label">{tab.label}</div>
                    <div className="settings-modern-tab-description">{tab.description}</div>
                  </div>
                  <FiChevronRight className="settings-modern-tab-arrow" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Panel */}
        <div className="settings-modern-main">
          {/* General Settings Tab */}
          {activeTab === "general" && (
            <div className="settings-modern-tab-content">
              <div className="settings-modern-tab-header">
                <h2 className="settings-modern-tab-title">General Settings</h2>
                <p className="settings-modern-tab-subtitle">
                  Configure basic system settings and business information
                </p>
              </div>

              <div className="settings-modern-form-grid">
                {/* Business Information Column */}
                <div className="settings-modern-form-section">
                  <div className="settings-modern-section-header">
                    <FiUser className="settings-modern-section-icon" />
                    <h3 className="settings-modern-section-title">Business Information</h3>
                  </div>

                  <div className="settings-modern-form-fields">
                    <div className="settings-modern-form-field">
                      <label className="settings-modern-form-label">Business Name</label>
                      <input
                        type="text"
                        value={formSettings?.pharmacy_name || ""}
                        onChange={(e) => updateFormSetting("pharmacy_name", e.target.value)}
                        className="settings-modern-form-input"
                        placeholder="Enter your pharmacy name"
                      />
                    </div>

                    <div className="settings-modern-form-field">
                      <label className="settings-modern-form-label">Address</label>
                      <textarea
                        value={formSettings?.address || ""}
                        onChange={(e) => updateFormSetting("address", e.target.value)}
                        rows={3}
                        className="settings-modern-form-textarea"
                        placeholder="Enter your pharmacy address"
                      />
                    </div>

                    <div className="settings-modern-form-row">
                      <div className="settings-modern-form-field">
                        <label className="settings-modern-form-label">Phone Number</label>
                        <input
                          type="tel"
                          value={formSettings?.phone || ""}
                          onChange={(e) => updateFormSetting("phone", e.target.value)}
                          className="settings-modern-form-input"
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="settings-modern-form-field">
                        <label className="settings-modern-form-label">Email Address</label>
                        <input
                          type="email"
                          value={formSettings?.email || ""}
                          onChange={(e) => updateFormSetting("email", e.target.value)}
                          className="settings-modern-form-input"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    <div className="settings-modern-form-field">
                      <label className="settings-modern-form-label">Pharmacy License Number</label>
                      <input
                        type="text"
                        value={formSettings?.pharmacy_license || ""}
                        onChange={(e) => updateFormSetting("pharmacy_license", e.target.value)}
                        className="settings-modern-form-input"
                        placeholder="Enter pharmacy license number"
                      />
                    </div>
                  </div>
                </div>

                {/* System Settings Column */}
                <div className="settings-modern-form-section">
                  <div className="settings-modern-section-header">
                    <FiSettingsIcon className="settings-modern-section-icon" />
                    <h3 className="settings-modern-section-title">System Settings</h3>
                  </div>

                  <div className="settings-modern-form-fields">
                    <div className="settings-modern-form-field">
                      <label className="settings-modern-form-label">Currency</label>
                      <select
                        value={formSettings?.currency || "UGX"}
                        onChange={(e) => updateFormSetting("currency", e.target.value)}
                        className="settings-modern-form-select"
                      >
                        <option value="UGX">UGX - Ugandan Shilling</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>

                    <div className="settings-modern-form-field">
                      <label className="settings-modern-form-label">Tax Rate (%)</label>
                      <input
                        type="number"
                        value={formSettings?.tax_rate || 18}
                        onChange={(e) => updateFormSetting("tax_rate", parseFloat(e.target.value))}
                        className="settings-modern-form-input"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    <div className="settings-modern-form-field">
                      <label className="settings-modern-form-label">Timezone</label>
                      <select
                        value={formSettings?.timezone || "Africa/Kampala"}
                        onChange={(e) => updateFormSetting("timezone", e.target.value)}
                        className="settings-modern-form-select"
                      >
                        <option value="Africa/Kampala">Africa/Kampala</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="Europe/London">Europe/London</option>
                      </select>
                    </div>

                    <div className="settings-modern-form-field">
                      <label className="settings-modern-form-label">Date Format</label>
                      <select
                        value={formSettings?.date_format || "DD/MM/YYYY"}
                        onChange={(e) => updateFormSetting("date_format", e.target.value)}
                        className="settings-modern-form-select"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Settings Tab */}
          {activeTab === "business" && (
            <div className="settings-modern-tab-content">
              <div className="settings-modern-tab-header">
                <h2 className="settings-modern-tab-title">Business Settings</h2>
                <p className="settings-modern-tab-subtitle">
                  Configure your business settings and preferences
                </p>
              </div>
              
              <div className="settings-modern-empty-state">
                <FiUser className="settings-modern-empty-icon" />
                <h3 className="settings-modern-empty-title">Business Configuration</h3>
                <p className="settings-modern-empty-subtitle">
                  Configure your business settings and preferences.
                </p>
              </div>
            </div>
          )}

          {/* Notifications Settings Tab */}
          {activeTab === "notifications" && (
            <div className="settings-modern-tab-content">
              <div className="settings-modern-tab-header">
                <h2 className="settings-modern-tab-title">Notification Settings</h2>
                <p className="settings-modern-tab-subtitle">
                  Configure alerts and notification preferences
                </p>
              </div>

              <div className="settings-modern-notifications">
                <div className="settings-modern-notification-section">
                  <div className="settings-modern-section-header">
                    <FiPackage className="settings-modern-section-icon" />
                    <h3 className="settings-modern-section-title">Stock Alerts</h3>
                  </div>

                  <div className="settings-modern-notification-items">
                    <div className="settings-modern-notification-item">
                      <div className="settings-modern-notification-info">
                        <div className="settings-modern-notification-title">Low Stock Alerts</div>
                        <div className="settings-modern-notification-description">
                          Get notified when products are running low
                        </div>
                      </div>
                      <label className="settings-modern-toggle">
                        <input
                          type="checkbox"
                          checked={formSettings?.low_stock_alerts || false}
                          onChange={(e) => updateFormSetting("low_stock_alerts", e.target.checked)}
                          className="settings-modern-toggle-input"
                        />
                        <span className="settings-modern-toggle-slider"></span>
                      </label>
                    </div>

                    <div className="settings-modern-form-field">
                      <label className="settings-modern-form-label">Low Stock Threshold</label>
                      <input
                        type="number"
                        value={formSettings?.low_stock_threshold || 10}
                        onChange={(e) => updateFormSetting("low_stock_threshold", parseInt(e.target.value))}
                        className="settings-modern-form-input"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-modern-notification-section">
                  <div className="settings-modern-section-header">
                    <FiAlertCircle className="settings-modern-section-icon" />
                    <h3 className="settings-modern-section-title">Expiry Alerts</h3>
                  </div>

                  <div className="settings-modern-notification-items">
                    <div className="settings-modern-notification-item">
                      <div className="settings-modern-notification-info">
                        <div className="settings-modern-notification-title">Expiry Notifications</div>
                        <div className="settings-modern-notification-description">
                          Get notified when products are expiring soon
                        </div>
                      </div>
                      <label className="settings-modern-toggle">
                        <input
                          type="checkbox"
                          checked={formSettings?.expiry_alerts || false}
                          onChange={(e) => updateFormSetting("expiry_alerts", e.target.checked)}
                          className="settings-modern-toggle-input"
                        />
                        <span className="settings-modern-toggle-slider"></span>
                      </label>
                    </div>

                    <div className="settings-modern-form-field">
                      <label className="settings-modern-form-label">Alert Threshold (days)</label>
                      <input
                        type="number"
                        value={formSettings?.alert_threshold || 30}
                        onChange={(e) => updateFormSetting("alert_threshold", parseInt(e.target.value))}
                        className="settings-modern-form-input"
                        min="1"
                        max="365"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings Tab */}
          {activeTab === "appearance" && (
            <div className="settings-modern-tab-content">
              <div className="settings-modern-tab-header">
                <h2 className="settings-modern-tab-title">Appearance Settings</h2>
                <p className="settings-modern-tab-subtitle">
                  Customize the look and feel of your application
                </p>
              </div>

              <div className="settings-modern-appearance">
                <div className="settings-modern-appearance-section">
                  <div className="settings-modern-section-header">
                    <FiMoon className="settings-modern-section-icon" />
                    <h3 className="settings-modern-section-title">Theme</h3>
                  </div>

                  <div className="settings-modern-theme-options">
                    <label className={`settings-modern-theme-option ${formSettings?.theme === "light" ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={formSettings?.theme === "light"}
                        onChange={(e) => updateFormSetting("theme", e.target.value)}
                        className="settings-modern-theme-input"
                      />
                      <div className="settings-modern-theme-content">
                        <FiSun className="settings-modern-theme-icon" />
                        <div className="settings-modern-theme-info">
                          <div className="settings-modern-theme-title">Light</div>
                          <div className="settings-modern-theme-description">Clean and bright interface</div>
                        </div>
                      </div>
                    </label>

                    <label className={`settings-modern-theme-option ${formSettings?.theme === "dark" ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={formSettings?.theme === "dark"}
                        onChange={(e) => updateFormSetting("theme", e.target.value)}
                        className="settings-modern-theme-input"
                      />
                      <div className="settings-modern-theme-content">
                        <FiMoon className="settings-modern-theme-icon" />
                        <div className="settings-modern-theme-info">
                          <div className="settings-modern-theme-title">Dark</div>
                          <div className="settings-modern-theme-description">Easy on the eyes</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="settings-modern-appearance-section">
                  <div className="settings-modern-section-header">
                    <FiGlobe className="settings-modern-section-icon" />
                    <h3 className="settings-modern-section-title">Language</h3>
                  </div>

                  <div className="settings-modern-form-field">
                    <select
                      value={formSettings?.language || "en"}
                      onChange={(e) => updateFormSetting("language", e.target.value)}
                      className="settings-modern-form-select"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === "system" && (
            <div className="settings-modern-tab-content">
              <div className="settings-modern-tab-header">
                <h2 className="settings-modern-tab-title">System Settings</h2>
                <p className="settings-modern-tab-subtitle">
                  Advanced system configuration and security settings
                </p>
              </div>

              <div className="settings-modern-system">
                <div className="settings-modern-system-section">
                  <div className="settings-modern-section-header">
                    <FiClock className="settings-modern-section-icon" />
                    <h3 className="settings-modern-section-title">Session Management</h3>
                  </div>

                  <div className="settings-modern-form-field">
                    <label className="settings-modern-form-label">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={formSettings?.session_timeout || 30}
                      onChange={(e) => updateFormSetting("session_timeout", parseInt(e.target.value))}
                      className="settings-modern-form-input"
                      min="5"
                      max="480"
                    />
                  </div>
                </div>

                <div className="settings-modern-system-section">
                  <div className="settings-modern-section-header">
                    <FiShieldIcon className="settings-modern-section-icon" />
                    <h3 className="settings-modern-section-title">Audit Logging</h3>
                  </div>

                  <div className="settings-modern-notification-item">
                    <div className="settings-modern-notification-info">
                      <div className="settings-modern-notification-title">Enable Audit Log</div>
                      <div className="settings-modern-notification-description">
                        Track all system activities for security
                      </div>
                    </div>
                    <label className="settings-modern-toggle">
                      <input
                        type="checkbox"
                        checked={formSettings?.enable_audit_log || false}
                        onChange={(e) => updateFormSetting("enable_audit_log", e.target.checked)}
                        className="settings-modern-toggle-input"
                      />
                      <span className="settings-modern-toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 