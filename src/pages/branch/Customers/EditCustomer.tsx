import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiTrash2,
} from "react-icons/fi";
import { useSupabaseQuery } from "../../../lib/hooks/useSupabaseQuery";
import { useAuthStore } from "../../../stores/authStore";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard } from "../../../components/UI";

// Types - Updated to match schema exactly
interface Customer {
  id?: string;
  tenant_id: string;
  branch_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
  registration_date?: string;
  status?: string;
  total_purchases?: number;
  total_spent?: number;
  last_purchase_date?: string;
  loyalty_points?: number;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

const EditCustomer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Form state - Updated to match AddCustomer structure
  const [formData, setFormData] = useState<Customer>({
    tenant_id: user?.tenant_id || '',
    branch_id: user?.branch_id || '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    date_of_birth: '',
    gender: '',
    status: 'active',
    loyalty_points: 0,
    total_spent: 0,
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Memoize filters to prevent infinite re-renders
  const filters = useMemo(() => ({
    id: id,
    tenant_id: user?.tenant_id,
    branch_id: user?.branch_id
  }), [id, user?.tenant_id, user?.branch_id]);

  // Fetch customer data for editing - Updated to use admin client
  const {
    data: customerData,
    loading: customerLoading,
  } = useSupabaseQuery<Customer[]>(
    'customers',
    'id, tenant_id, branch_id, first_name, last_name, email, phone, address, city, state, country, date_of_birth, gender, registration_date, status, total_purchases, total_spent, last_purchase_date, loyalty_points, notes, created_by, created_at, updated_at',
    {
      enabled: !!id && id !== 'new' && !!user?.tenant_id && !!user?.branch_id,
      filters,
      useAdminClient: true
    }
  );

  const customer = customerData?.[0];

  // Load customer data into form
  useEffect(() => {
    if (customer) {
      setFormData({
        ...customer,
        date_of_birth: customer.date_of_birth ? customer.date_of_birth.split('T')[0] : '',
      });
    }
  }, [customer]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (!formData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof Customer, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { supabaseAdmin } = await import("../../../lib/supabase/supabaseClient");

      const customerPayload = {
        ...formData,
        date_of_birth: formData.date_of_birth || null,
        tenant_id: user?.tenant_id,
        branch_id: user?.branch_id,
        created_by: user?.id, // Add required field from schema
      };

      if (id === 'new') {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabaseAdmin
          .from("customers")
          .insert([customerPayload])
          .select()
          .single();

        if (customerError) throw customerError;
        navigate(`/branch/customers/view/${newCustomer.id}`);
      } else {
        // Update existing customer
        const { error: customerError } = await supabaseAdmin
          .from("customers")
          .update(customerPayload)
          .eq("id", id)
          .eq("tenant_id", user?.tenant_id)
          .eq("branch_id", user?.branch_id);

        if (customerError) throw customerError;
        navigate(`/branch/customers/view/${id}`);
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      setError(error instanceof Error ? error.message : "Failed to save customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || id === 'new') return;

    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const { supabaseAdmin } = await import("../../../lib/supabase/supabaseClient");

      const { error } = await supabaseAdmin
        .from("customers")
        .delete()
        .eq("id", id)
        .eq("tenant_id", user?.tenant_id)
        .eq("branch_id", user?.branch_id);

      if (error) throw error;
      navigate("/branch/customers");
    } catch (error) {
      console.error("Error deleting customer:", error);
      setError(error instanceof Error ? error.message : "Failed to delete customer");
    } finally {
      setIsLoading(false);
    }
  };

  if (customerLoading) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading customer data...</p>
          </div>
        </div>
      </BranchDashboardLayout>
    );
  }

  return (
    <BranchDashboardLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => navigate("/branch/customers")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {id === 'new' ? 'Add New Customer' : 'Edit Customer'}
              </h1>
              <p className="text-gray-600 mt-1">
                {id === 'new' ? 'Create a new customer profile' : 'Update customer information'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {id !== 'new' && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                Delete
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <ContentCard title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    validationErrors.first_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {validationErrors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    validationErrors.last_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {validationErrors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
          </ContentCard>

          {/* Contact Information */}
          <ContentCard title="Contact Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      validationErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>
          </ContentCard>

          {/* Customer Metrics */}
          <ContentCard title="Customer Metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loyalty Points
                </label>
                <input
                  type="number"
                  value={formData.loyalty_points || 0}
                  onChange={(e) => handleInputChange('loyalty_points', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Spent
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_spent || 0}
                  onChange={(e) => handleInputChange('total_spent', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                />
              </div>
            </div>
          </ContentCard>

          {/* Additional Notes */}
          <ContentCard title="Additional Notes">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter any additional notes about the customer..."
              />
            </div>
          </ContentCard>
        </div>
      </form>
    </BranchDashboardLayout>
  );
};

export default EditCustomer;
