import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
  FiDollarSign,
  FiTrash2,
  FiCreditCard,
} from "react-icons/fi";
import { useAuthStore } from "../../../stores/authStore";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";
import { ContentCard } from "../../../components/UI";

// Types
interface Supplier {
  id?: string;
  tenant_id: string;
  branch_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  license_number?: string;
  supplier_type?: 'wholesale' | 'manufacturer' | 'distributor' | 'retail';
  payment_terms?: string;
  credit_limit?: number;
  current_balance?: number;
  status?: 'active' | 'inactive' | 'suspended';
  rating?: number;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

const EditSupplier: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Form state
  const [formData, setFormData] = useState<Supplier>({
    tenant_id: user?.tenant_id || '',
    branch_id: user?.branch_id || '',
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    tax_id: '',
    license_number: '',
    supplier_type: 'wholesale',
    payment_terms: 'Net 30 (Pay within 30 days)',
    credit_limit: 0,
    current_balance: 0,
    status: 'active',
    rating: 0,
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [supplierLoading, setSupplierLoading] = useState(false);

  // Fetch supplier data for editing
  useEffect(() => {
    const fetchSupplier = async () => {
      if (!id || id === 'new' || !user?.tenant_id || !user?.branch_id) return;
      
      setSupplierLoading(true);
      try {
        const { supabaseAdmin } = await import("../../../lib/supabase/supabaseClient");
        
        const { data, error } = await supabaseAdmin
          .from("suppliers")
          .select("*")
          .eq("id", id)
          .eq("tenant_id", user?.tenant_id)
          .eq("branch_id", user?.branch_id)
          .single();

        if (error) throw error;
        
        if (data) {
          setFormData(prev => ({
            ...prev,
            ...data,
          }));
        }
      } catch (error) {
        console.error("Error fetching supplier:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch supplier");
      } finally {
        setSupplierLoading(false);
      }
    };

    fetchSupplier();
  }, [id, user?.tenant_id, user?.branch_id]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Company name is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Removed payment_terms numeric validation

    if (formData.credit_limit && formData.credit_limit < 0) {
      errors.credit_limit = 'Credit limit cannot be negative';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof Supplier, value: string | number) => {
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

      const supplierPayload = {
        tenant_id: user?.tenant_id,
        branch_id: user?.branch_id,
        name: formData.name,
        contact_person: formData.contact_person || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        country: formData.country || 'Uganda',
        tax_id: formData.tax_id || null,
        license_number: formData.license_number || null,
        supplier_type: formData.supplier_type || 'wholesale',
        payment_terms: formData.payment_terms || 'Net 30 (Pay within 30 days)',
        credit_limit: formData.credit_limit || 0,
        current_balance: formData.current_balance || 0,
        status: formData.status || 'active',
        rating: formData.rating || null,
        notes: formData.notes || null,
        created_by: user?.id,
      };

      if (id === 'new') {
        // Create new supplier - using service role to bypass RLS
        const { data: newSupplier, error: supplierError } = await supabaseAdmin
          .from("suppliers")
          .insert([supplierPayload])
          .select()
          .single();

        if (supplierError) throw supplierError;
        navigate(`/branch/suppliers/view/${newSupplier.id}`);
      } else {
        // Update existing supplier - using service role to bypass RLS
        const { error: supplierError } = await supabaseAdmin
          .from("suppliers")
          .update(supplierPayload)
          .eq("id", id)
          .eq("tenant_id", user?.tenant_id)
          .eq("branch_id", user?.branch_id);

        if (supplierError) throw supplierError;
        navigate(`/branch/suppliers/view/${id}`);
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      setError(error instanceof Error ? error.message : "Failed to save supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || id === 'new') return;

    if (!confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const { supabaseAdmin } = await import("../../../lib/supabase/supabaseClient");

      const { error } = await supabaseAdmin
        .from("suppliers")
        .delete()
        .eq("id", id)
        .eq("tenant_id", user?.tenant_id)
        .eq("branch_id", user?.branch_id);

      if (error) throw error;
      navigate("/branch/suppliers");
    } catch (error) {
      console.error("Error deleting supplier:", error);
      setError(error instanceof Error ? error.message : "Failed to delete supplier");
    } finally {
      setIsLoading(false);
    }
  };

  if (supplierLoading) {
    return (
      <BranchDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading supplier data...</p>
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
          <button
            type="button"
            onClick={() => navigate("/branch/suppliers")}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
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
              {isLoading ? 'Saving...' : 'Save Supplier'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <ContentCard title="Company Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    validationErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter company name"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.contact_person || ''}
                    onChange={(e) => handleInputChange('contact_person', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter contact person name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Type
                  </label>
                  <select
                    value={formData.supplier_type || 'wholesale'}
                    onChange={(e) => handleInputChange('supplier_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="wholesale">Wholesale</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="distributor">Distributor</option>
                    <option value="retail">Retail</option>
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
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax ID
                </label>
                <input
                  type="text"
                  value={formData.tax_id || ''}
                  onChange={(e) => handleInputChange('tax_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter tax ID or registration number"
                />
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
                  Phone Number
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Financial Information */}
          <ContentCard title="Financial Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <select
                  value={formData.payment_terms || 'Net 30 (Pay within 30 days)'}
                  onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Immediate Payment">Immediate Payment</option>
                  <option value="Net 7">Net 7 (Pay within 7 days)</option>
                  <option value="Net 15">Net 15 (Pay within 15 days)</option>
                  <option value="Net 30 (Pay within 30 days)">Net 30 (Pay within 30 days)</option>
                  <option value="Net 45">Net 45 (Pay within 45 days)</option>
                  <option value="Net 60">Net 60 (Pay within 60 days)</option>
                  <option value="Net 90">Net 90 (Pay within 90 days)</option>
                  <option value="End of Month">End of Month (EOM)</option>
                  <option value="End of Month + 30">End of Month + 30 days</option>
                  <option value="Custom">Custom Terms</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select when payment is due after receiving goods
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Limit
                </label>
                <div className="relative">
                  <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.credit_limit || 0}
                    onChange={(e) => handleInputChange('credit_limit', parseFloat(e.target.value) || 0)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      validationErrors.credit_limit ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    min="0"
                  />
                </div>
                {validationErrors.credit_limit && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.credit_limit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Balance
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_balance || 0}
                    onChange={(e) => handleInputChange('current_balance', parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Positive balance = credit, Negative balance = debt
                </p>
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
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter any additional notes about the supplier..."
              />
            </div>
          </ContentCard>
        </div>
      </form>
    </BranchDashboardLayout>
  );
};

export default EditSupplier;
