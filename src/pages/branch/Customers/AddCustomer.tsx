import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSave,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiInfo,
  FiAlertCircle,
} from "react-icons/fi";
import { supabaseAdmin } from "../../../lib/supabase/supabaseClient";
import { useAuthStore } from "../../../stores/authStore";

// Types
interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  gender: string;
  emergencyContact: string;
  emergencyPhone: string;
  allergies: string;
  medicalConditions: string;
  status: 'active' | 'inactive';
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface FormErrors {
  [key: string]: string;
}

const AddCustomer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // State
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    dateOfBirth: "",
    gender: "",
    emergencyContact: "",
    emergencyPhone: "",
    allergies: "",
    medicalConditions: "",
    status: "active",
  });

  const steps: Step[] = [
    {
      id: 1,
      title: "Basic Information",
      description: "Personal details and contact info",
      icon: FiUser,
      color: "#7c3aed",
    },
    {
      id: 2,
      title: "Address Information",
      description: "Location and address details",
      icon: FiMapPin,
      color: "#3b82f6",
    },
    {
      id: 3,
      title: "Additional Information",
      description: "Medical and emergency details",
      icon: FiInfo,
      color: "#10b981",
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) {
          newErrors.firstName = "First name is required";
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = "Last name is required";
        }
        if (!formData.phone.trim()) {
          newErrors.phone = "Phone number is required";
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email address";
        }
        break;
      case 2:
        if (!formData.address.trim()) {
          newErrors.address = "Address is required";
        }
        if (!formData.city.trim()) {
          newErrors.city = "City is required";
        }
        break;
      case 3:
        // Optional step - no required fields
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep) || !user) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess(null);

    try {
      console.log("👤 [AddCustomer] Creating new customer...");

      // Prepare customer data for Supabase
      const customerData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email || null,
        phone: formData.phone,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        status: formData.status,
        tenant_id: (user as any).tenant_id,
        branch_id: (user as any).branch_id,
        created_by: (user as any).id, // Add required field from schema
      };

      const { data: newCustomer, error: customerError } = await supabaseAdmin
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (customerError) throw customerError;

      console.log("✅ [AddCustomer] Customer created successfully:", newCustomer);
      setSuccess("Customer created successfully!");

      // Navigate back to customers list after a short delay
      setTimeout(() => {
        navigate("/branch/customers");
      }, 1500);

    } catch (error) {
      console.error("❌ [AddCustomer] Error creating customer:", error);
      setErrors({ submit: "Failed to create customer. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter ZIP or postal code"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter emergency contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter emergency phone number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Enter any allergies (optional)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions
                </label>
                <textarea
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Enter any medical conditions (optional)"
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
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <FiCheck size={16} />
                    ) : (
                      <Icon size={16} />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div key={step.id} className="text-center">
                <div className={`text-sm font-medium ${
                  currentStep === step.id ? 'text-indigo-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <FiCheck className="h-5 w-5 text-green-600" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <FiAlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{errors.submit}</span>
            </div>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className="flex space-x-3">
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <span>Next</span>
                  <FiArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiSave size={16} />
                  )}
                  <span>{loading ? "Creating..." : "Create Customer"}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer; 