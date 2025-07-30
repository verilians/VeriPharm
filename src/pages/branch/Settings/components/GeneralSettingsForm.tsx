import React, { useState, useEffect } from 'react';
import type { GeneralSettings } from '../types';

interface GeneralSettingsFormProps {
  settings: GeneralSettings | null;
  onSave: (settings: Partial<GeneralSettings>) => Promise<void>;
  loading?: boolean;
}

export const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({
  settings,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState<Partial<GeneralSettings>>({
    business_name: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    business_website: '',
    tax_number: '',
    currency: 'UGX',
    timezone: 'Africa/Kampala',
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    language: 'en',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      setFormData({
        business_name: settings.business_name || '',
        business_address: settings.business_address || '',
        business_phone: settings.business_phone || '',
        business_email: settings.business_email || '',
        business_website: settings.business_website || '',
        tax_number: settings.tax_number || '',
        currency: settings.currency || 'UGX',
        timezone: settings.timezone || 'Africa/Kampala',
        date_format: settings.date_format || 'DD/MM/YYYY',
        time_format: settings.time_format || '24h',
        language: settings.language || 'en',
      });
    }
  }, [settings]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.business_name?.trim()) {
      newErrors.business_name = 'Business name is required';
    }

    if (formData.business_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.business_email)) {
      newErrors.business_email = 'Please enter a valid email address';
    }

    if (formData.business_website && !/^https?:\/\/.+/.test(formData.business_website)) {
      newErrors.business_website = 'Please enter a valid website URL';
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

  const handleInputChange = (field: keyof GeneralSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Name */}
          <div>
            <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              id="business_name"
              value={formData.business_name || ''}
              onChange={(e) => handleInputChange('business_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.business_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter business name"
            />
            {errors.business_name && (
              <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
            )}
          </div>

          {/* Business Phone */}
          <div>
            <label htmlFor="business_phone" className="block text-sm font-medium text-gray-700 mb-2">
              Business Phone
            </label>
            <input
              type="tel"
              id="business_phone"
              value={formData.business_phone || ''}
              onChange={(e) => handleInputChange('business_phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter business phone"
            />
          </div>

          {/* Business Email */}
          <div>
            <label htmlFor="business_email" className="block text-sm font-medium text-gray-700 mb-2">
              Business Email
            </label>
            <input
              type="email"
              id="business_email"
              value={formData.business_email || ''}
              onChange={(e) => handleInputChange('business_email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.business_email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter business email"
            />
            {errors.business_email && (
              <p className="mt-1 text-sm text-red-600">{errors.business_email}</p>
            )}
          </div>

          {/* Business Website */}
          <div>
            <label htmlFor="business_website" className="block text-sm font-medium text-gray-700 mb-2">
              Business Website
            </label>
            <input
              type="url"
              id="business_website"
              value={formData.business_website || ''}
              onChange={(e) => handleInputChange('business_website', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.business_website ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com"
            />
            {errors.business_website && (
              <p className="mt-1 text-sm text-red-600">{errors.business_website}</p>
            )}
          </div>

          {/* Tax Number */}
          <div>
            <label htmlFor="tax_number" className="block text-sm font-medium text-gray-700 mb-2">
              Tax Number
            </label>
            <input
              type="text"
              id="tax_number"
              value={formData.tax_number || ''}
              onChange={(e) => handleInputChange('tax_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tax number"
            />
          </div>

          {/* Business Address */}
          <div className="md:col-span-2">
            <label htmlFor="business_address" className="block text-sm font-medium text-gray-700 mb-2">
              Business Address
            </label>
            <textarea
              id="business_address"
              value={formData.business_address || ''}
              onChange={(e) => handleInputChange('business_address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter business address"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Regional Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              id="currency"
              value={formData.currency || 'UGX'}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UGX">UGX - Ugandan Shilling</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              id="timezone"
              value={formData.timezone || 'Africa/Kampala'}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Africa/Kampala">Africa/Kampala (UTC+3)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
              <option value="UTC">UTC (UTC+0)</option>
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label htmlFor="date_format" className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select
              id="date_format"
              value={formData.date_format || 'DD/MM/YYYY'}
              onChange={(e) => handleInputChange('date_format', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          {/* Time Format */}
          <div>
            <label htmlFor="time_format" className="block text-sm font-medium text-gray-700 mb-2">
              Time Format
            </label>
            <select
              id="time_format"
              value={formData.time_format || '24h'}
              onChange={(e) => handleInputChange('time_format', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">24-hour</option>
              <option value="12h">12-hour</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              id="language"
              value={formData.language || 'en'}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="sw">Swahili</option>
              <option value="fr">French</option>
            </select>
          </div>
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