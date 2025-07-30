import React, { useState, useEffect } from "react";
import {
  FiSave,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiFileText,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import BranchDashboardLayout from "../../../components/Layout/BranchDashboardLayout";

// Types - Updated to match schema exactly
interface SupplierFormData {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
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
}

interface SupplierFormProps {
  supplier?: SupplierFormData;
  isEditing?: boolean;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const SupplierForm: React.FC<SupplierFormProps> = ({
  supplier,
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  // State
  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Uganda",
    tax_id: "",
    license_number: "",
    supplier_type: "wholesale",
    payment_terms: "Net 30 (Pay within 30 days)",
    credit_limit: 0,
    current_balance: 0,
    status: "active",
    rating: 0,
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);

  // Load supplier data if editing
  useEffect(() => {
    if (supplier && isEditing) {
      setFormData(supplier);
    }
  }, [supplier, isEditing]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Supplier name is required";
    }

    if (formData.contact_person && !formData.contact_person.trim()) {
      newErrors.contact_person = "Contact person is required";
    }

    if (formData.phone && !formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.address && !formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (formData.city && !formData.city.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔄 [SupplierForm] Form submission started");

    if (!validateForm()) {
      console.log("❌ [SupplierForm] Form validation failed");
      return;
    }

    console.log("✅ [SupplierForm] Form validation passed");
    console.log("📝 [SupplierForm] Submitting form data:", formData);

    try {
      await onSubmit(formData);
      console.log("✅ [SupplierForm] Form submitted successfully");
      setSuccess(`${isEditing ? "Updated" : "Created"} successfully!`);
      
      // Clear success message after delay
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("❌ [SupplierForm] Error submitting form:", error);
      
      // Set error message for user feedback
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to save supplier. Please try again.";
      
      setErrors(prev => ({ ...prev, submit: errorMessage }));
    }
  };

  return (
    <BranchDashboardLayout>
      <div className="w-full h-full flex-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? "Edit Supplier" : "Add New Supplier"}
            </h3>
            <p className="text-sm text-gray-600">
              {isEditing 
                ? "Update supplier information"
                : "Enter supplier details to add them to your system"
              }
            </p>
          </div>

      {/* Success Message */}
      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <FiCheck className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <FiAlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{errors.submit}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <FiUser className="mr-2 h-4 w-4" />
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter supplier name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.contact_person ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter contact person name"
              />
              {errors.contact_person && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_person}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <FiMapPin className="mr-2 h-4 w-4" />
            Address Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter street address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.city ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter state or province"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter country"
              />
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <FiFileText className="mr-2 h-4 w-4" />
            Business Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <select
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select payment terms</option>
                <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                <option value="Immediate Payment">Immediate Payment</option>
                <option value="Net 7">Net 7 (Pay within 7 days)</option>
                <option value="Net 15">Net 15 (Pay within 15 days)</option>
                <option value="Net 30">Net 30 (Pay within 30 days)</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Type
              </label>
              <select
                name="supplier_type"
                value={formData.supplier_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="wholesale">Wholesale</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="distributor">Distributor</option>
                <option value="retail">Retail</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID
              </label>
              <input
                type="text"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter tax ID or VAT number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Number
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter license number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Limit (UGX)
              </label>
              <input
                type="number"
                name="credit_limit"
                value={formData.credit_limit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter credit limit"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Balance (UGX)
              </label>
              <input
                type="number"
                name="current_balance"
                value={formData.current_balance}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter current balance"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (1-5)
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={0}>No Rating</option>
                <option value={1}>1 - Poor</option>
                <option value={2}>2 - Fair</option>
                <option value={3}>3 - Good</option>
                <option value={4}>4 - Very Good</option>
                <option value={5}>5 - Excellent</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter any additional notes about the supplier..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiX className="mr-2 h-4 w-4 inline" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
            ) : (
              <FiSave className="mr-2 h-4 w-4 inline" />
            )}
            {loading ? "Saving..." : (isEditing ? "Update Supplier" : "Create Supplier")}
          </button>
        </div>
      </form>
        </div>
      </div>
    </BranchDashboardLayout>
  );
};

export default SupplierForm; 