import React, { useState, useEffect } from 'react';
import type { SecuritySettings } from '../types';

interface SecuritySettingsFormProps {
  settings: SecuritySettings | null;
  onSave: (settings: Partial<SecuritySettings>) => Promise<void>;
  loading?: boolean;
}

export const SecuritySettingsForm: React.FC<SecuritySettingsFormProps> = ({
  settings,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState<Partial<SecuritySettings>>({
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_special: false,
    session_timeout_minutes: 30,
    max_login_attempts: 5,
    lockout_duration_minutes: 15,
    two_factor_enabled: false,
    ip_whitelist: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ipWhitelistInput, setIpWhitelistInput] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        password_min_length: settings.password_min_length || 8,
        password_require_uppercase: settings.password_require_uppercase || true,
        password_require_lowercase: settings.password_require_lowercase || true,
        password_require_numbers: settings.password_require_numbers || true,
        password_require_special: settings.password_require_special || false,
        session_timeout_minutes: settings.session_timeout_minutes || 30,
        max_login_attempts: settings.max_login_attempts || 5,
        lockout_duration_minutes: settings.lockout_duration_minutes || 15,
        two_factor_enabled: settings.two_factor_enabled || false,
        ip_whitelist: settings.ip_whitelist || [],
      });
    }
  }, [settings]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if ((formData.password_min_length ?? 0) < 6) {
      newErrors.password_min_length = 'Password minimum length must be at least 6 characters';
    }

    if ((formData.session_timeout_minutes ?? 0) < 5) {
      newErrors.session_timeout_minutes = 'Session timeout must be at least 5 minutes';
    }

    if ((formData.max_login_attempts ?? 0) < 1) {
      newErrors.max_login_attempts = 'Max login attempts must be at least 1';
    }

    if ((formData.lockout_duration_minutes ?? 0) < 1) {
      newErrors.lockout_duration_minutes = 'Lockout duration must be at least 1 minute';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleInputChange = (field: keyof SecuritySettings, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addIpToWhitelist = () => {
    if (ipWhitelistInput.trim() && !formData.ip_whitelist?.includes(ipWhitelistInput.trim())) {
      const newWhitelist = [...(formData.ip_whitelist || []), ipWhitelistInput.trim()];
      setFormData(prev => ({ ...prev, ip_whitelist: newWhitelist }));
      setIpWhitelistInput('');
    }
  };

  const removeIpFromWhitelist = (ip: string) => {
    const newWhitelist = formData.ip_whitelist?.filter(ipAddr => ipAddr !== ip) || [];
    setFormData(prev => ({ ...prev, ip_whitelist: newWhitelist }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Password Policy</h3>
        
        <div className="space-y-4">
          {/* Password Minimum Length */}
          <div>
            <label htmlFor="password_min_length" className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Password Length
            </label>
            <input
              type="number"
              id="password_min_length"
              value={formData.password_min_length || 8}
              onChange={(e) => handleInputChange('password_min_length', parseInt(e.target.value) || 8)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password_min_length ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="8"
              min="6"
              max="50"
            />
            {errors.password_min_length && (
              <p className="mt-1 text-sm text-red-600">{errors.password_min_length}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="password_require_uppercase"
                checked={formData.password_require_uppercase || false}
                onChange={(e) => handleInputChange('password_require_uppercase', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="password_require_uppercase" className="ml-2 text-sm text-gray-700">
                Require uppercase letters
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="password_require_lowercase"
                checked={formData.password_require_lowercase || false}
                onChange={(e) => handleInputChange('password_require_lowercase', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="password_require_lowercase" className="ml-2 text-sm text-gray-700">
                Require lowercase letters
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="password_require_numbers"
                checked={formData.password_require_numbers || false}
                onChange={(e) => handleInputChange('password_require_numbers', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="password_require_numbers" className="ml-2 text-sm text-gray-700">
                Require numbers
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="password_require_special"
                checked={formData.password_require_special || false}
                onChange={(e) => handleInputChange('password_require_special', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="password_require_special" className="ml-2 text-sm text-gray-700">
                Require special characters
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Session Management</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Session Timeout */}
          <div>
            <label htmlFor="session_timeout_minutes" className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              id="session_timeout_minutes"
              value={formData.session_timeout_minutes || 30}
              onChange={(e) => handleInputChange('session_timeout_minutes', parseInt(e.target.value) || 30)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.session_timeout_minutes ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="30"
              min="5"
              max="1440"
            />
            {errors.session_timeout_minutes && (
              <p className="mt-1 text-sm text-red-600">{errors.session_timeout_minutes}</p>
            )}
          </div>

          {/* Max Login Attempts */}
          <div>
            <label htmlFor="max_login_attempts" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Login Attempts
            </label>
            <input
              type="number"
              id="max_login_attempts"
              value={formData.max_login_attempts || 5}
              onChange={(e) => handleInputChange('max_login_attempts', parseInt(e.target.value) || 5)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.max_login_attempts ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="5"
              min="1"
              max="10"
            />
            {errors.max_login_attempts && (
              <p className="mt-1 text-sm text-red-600">{errors.max_login_attempts}</p>
            )}
          </div>

          {/* Lockout Duration */}
          <div>
            <label htmlFor="lockout_duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
              Lockout Duration (minutes)
            </label>
            <input
              type="number"
              id="lockout_duration_minutes"
              value={formData.lockout_duration_minutes || 15}
              onChange={(e) => handleInputChange('lockout_duration_minutes', parseInt(e.target.value) || 15)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lockout_duration_minutes ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="15"
              min="1"
              max="1440"
            />
            {errors.lockout_duration_minutes && (
              <p className="mt-1 text-sm text-red-600">{errors.lockout_duration_minutes}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Two-Factor Authentication</h3>
        
        <div className="space-y-4">
          {/* Two-Factor Enabled */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="two_factor_enabled"
              checked={formData.two_factor_enabled || false}
              onChange={(e) => handleInputChange('two_factor_enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="two_factor_enabled" className="ml-2 text-sm text-gray-700">
              Enable two-factor authentication
            </label>
          </div>

          {formData.two_factor_enabled && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                Two-factor authentication will require users to enter a verification code sent to their email or phone number.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">IP Whitelist</h3>
        
        <div className="space-y-4">
          {/* Add IP Address */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={ipWhitelistInput}
              onChange={(e) => setIpWhitelistInput(e.target.value)}
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addIpToWhitelist}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>

          {/* IP Whitelist */}
          {formData.ip_whitelist && formData.ip_whitelist.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Allowed IP Addresses:</p>
              <div className="space-y-2">
                {formData.ip_whitelist.map((ip, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">{ip}</span>
                    <button
                      type="button"
                      onClick={() => removeIpFromWhitelist(ip)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}; 