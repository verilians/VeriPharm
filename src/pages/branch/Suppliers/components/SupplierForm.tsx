import React, { useState, useEffect } from 'react';
import type { Supplier, CreateSupplierData, UpdateSupplierData } from '../types';

interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (data: CreateSupplierData | UpdateSupplierData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({
  supplier,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateSupplierData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    tax_number: '',
    payment_terms: '',
    credit_limit: 0,
    status: 'active',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        contact_person: supplier.contact_person || '',
        tax_number: supplier.tax_number || '',
        payment_terms: supplier.payment_terms || '',
        credit_limit: supplier.credit_limit || 0,
        status: supplier.status,
        notes: supplier.notes || '',
      });
    }
  }, [supplier]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if ((formData.credit_limit ?? 0) < 0) {
      newErrors.credit_limit = 'Credit limit cannot be negative';
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
      if (supplier) {
        await onSubmit({ ...formData, id: supplier.id } as UpdateSupplierData);
      } else {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: keyof CreateSupplierData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supplier Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Supplier Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter supplier name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Contact Person */}
        <div>
          <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 mb-2">
            Contact Person
          </label>
          <input
            type="text"
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => handleInputChange('contact_person', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter contact person name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
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
            value={formData.tax_number}
            onChange={(e) => handleInputChange('tax_number', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tax number"
          />
        </div>

        {/* Credit Limit */}
        <div>
          <label htmlFor="credit_limit" className="block text-sm font-medium text-gray-700 mb-2">
            Credit Limit (UGX)
          </label>
          <input
            type="number"
            id="credit_limit"
            value={formData.credit_limit}
            onChange={(e) => handleInputChange('credit_limit', parseInt(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.credit_limit ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
            min="0"
          />
          {errors.credit_limit && (
            <p className="mt-1 text-sm text-red-600">{errors.credit_limit}</p>
          )}
        </div>

        {/* Payment Terms */}
        <div>
          <label htmlFor="payment_terms" className="block text-sm font-medium text-gray-700 mb-2">
            Payment Terms
          </label>
          <select
            id="payment_terms"
            value={formData.payment_terms}
            onChange={(e) => handleInputChange('payment_terms', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Payment Terms</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 60">Net 60</option>
            <option value="Net 90">Net 90</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="Advance Payment">Advance Payment</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter supplier address"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter additional notes"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : supplier ? 'Update Supplier' : 'Create Supplier'}
        </button>
      </div>
    </form>
  );
}; 