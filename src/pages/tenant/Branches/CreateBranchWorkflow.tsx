import React, { useState } from "react";
import TenantDashboardLayout from "../Dashboard/TenantDashboardLayout";
import { useBranches } from "./BranchContext";
import { useNavigate } from "react-router-dom";
import { branchAPI } from "../../../lib/api/branches/api";
import type { CreateBranchData } from "../../../lib/api/branches/api";
import ConfirmationModal from "../../../components/UI/ConfirmationModal";
import { useAuthStore } from "../../../stores/authStore";

// Types based on our analysis
interface OperatingHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

interface BranchFormData {
  // Basic Information
  name: string;
  branch_code: string;
  
  // Contact Information  
  email: string;
  phone: string;
  
  // Address (replace single location)
  address: string;
  city: string;
  state: string;
  country: string;
  
  // Business Details
  branch_type: 'retail' | 'wholesale' | 'hospital' | 'clinic';
  license_number: string;
  
  // Operational
  timezone: string;
  operating_hours: OperatingHours;
  
  // Contact Person (not manager initially)
  contact_person: string;
  contact_phone: string;
  
  // System fields (auto-populated)
  tenant_id: string;
  status: 'active';
}

const defaultOperatingHours: OperatingHours = {
  monday: { open: "08:00", close: "18:00", closed: false },
  tuesday: { open: "08:00", close: "18:00", closed: false },
  wednesday: { open: "08:00", close: "18:00", closed: false },
  thursday: { open: "08:00", close: "18:00", closed: false },
  friday: { open: "08:00", close: "18:00", closed: false },
  saturday: { open: "08:00", close: "16:00", closed: false },
  sunday: { open: "10:00", close: "14:00", closed: false },
};

const CreateBranchWorkflow: React.FC = () => {
  const { addBranch } = useBranches();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [createdBranch, setCreatedBranch] = useState<any>(null);
  
  // Confirmation modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    details: [] as string[]
  });
  
  // Form data state
  const [formData, setFormData] = useState<BranchFormData>({
    name: "",
    branch_code: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Uganda",
    branch_type: "retail",
    license_number: "",
    timezone: "Africa/Kampala",
    operating_hours: defaultOperatingHours,
    contact_person: "",
    contact_phone: "",
    tenant_id: user?.tenant_id || "", // Will be validated before API call
    status: "active",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof BranchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = (): boolean => {
    const requiredFields = ['name', 'branch_code', 'email', 'phone', 'address', 'city', 'state', 'license_number', 'contact_person', 'contact_phone'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof BranchFormData]) {
        setError(`${field.replace('_', ' ')} is required`);
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate branch code format (could be pharmacy license format)
    if (formData.branch_code.length < 3) {
      setError("Branch code must be at least 3 characters");
      return false;
    }

    setError(null);
    return true;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }

    // Ensure we have a valid tenant_id
    if (!user?.tenant_id) {
      setError("No tenant ID found. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Update formData with actual tenant_id just before API call
      const branchDataWithTenant = {
        ...formData,
        tenant_id: user.tenant_id
      };
      
      // Create branch in database using real API
      const result = await branchAPI.createBranch(branchDataWithTenant as CreateBranchData);
      
      if (result.success && result.data) {
        // Add branch to local context for immediate UI update
        const branchData = {
          name: result.data.name,
          location: `${result.data.address}, ${result.data.city}, ${result.data.state}`,
          manager: "Pending Assignment", // No manager yet
          performance: "New" as const,
          staff: [], // No staff initially
          sales: [],
          audits: [],
          // Additional fields from API response
          id: result.data.id,
          branch_code: result.data.branch_code,
          email: result.data.email,
          phone: result.data.phone,
          branch_type: result.data.branch_type as 'retail' | 'wholesale' | 'hospital' | 'clinic',
          license_number: result.data.license_number,
          contact_person: result.data.contact_person,
          contact_phone: result.data.contact_phone,
        };

        addBranch(branchData);
        setCreatedBranch(result.data);
        
        // Show success modal with branch details
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Branch Created Successfully!',
          message: `Branch "${result.data.name}" has been created and saved to the database.`,
          details: [
            `Branch ID: ${result.data.id}`,
            `Branch Code: ${result.data.branch_code}`,
            `Email: ${result.data.email}`,
            `Phone: ${result.data.phone}`,
            `Location: ${result.data.city}, ${result.data.state}`,
            `Type: ${result.data.branch_type}`,
            `License: ${result.data.license_number}`,
            `Status: ${result.data.status}`
          ]
        });
        
        setCurrentStep(2);
      } else {
        // Show error modal
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Failed to Create Branch',
          message: result.error || 'An unknown error occurred while creating the branch.',
          details: []
        });
        setError(result.error || "Failed to create branch. Please try again.");
      }
      
    } catch (err) {
      console.error('Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Unexpected Error',
        message: errorMessage,
        details: []
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManager = () => {
    // Navigate to user creation with branch context
    if (createdBranch) {
      navigate(`/tenant/users?createManager=true&branchId=${createdBranch.id}&branchName=${encodeURIComponent(createdBranch.name)}`);
    }
  };

  const handleSkipManager = () => {
    // Show confirmation modal before skipping
    setModalState({
      isOpen: true,
      type: 'warning',
      title: 'Skip Manager Creation?',
      message: 'You can create a manager for this branch later from the Users section. Are you sure you want to skip this step?',
      details: []
    });
  };

  const confirmSkipManager = () => {
    // Complete workflow without creating manager
    setModalState({ ...modalState, isOpen: false });
    navigate("/tenant/branches");
  };

  if (currentStep === 2) {
    return (
      <TenantDashboardLayout>
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8 mt-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-700 mb-2">Branch Created Successfully!</h1>
            <p className="text-gray-600">
              Branch "{createdBranch?.name}" has been created with ID: {createdBranch?.id}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Step 2: Create Branch Manager</h3>
            <p className="text-blue-700 text-sm mb-3">
              Now you can create a user account for the branch manager who will oversee this branch.
            </p>
            <div className="text-sm text-blue-600">
              <strong>Branch Details:</strong><br />
              Name: {createdBranch?.name}<br />
              Code: {createdBranch?.branch_code}<br />
              Location: {createdBranch?.city}, {createdBranch?.state}<br />
              Email: {createdBranch?.email}<br />
              Phone: {createdBranch?.phone}
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCreateManager}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
            >
              Create Manager Account
            </button>
            
            <button
              onClick={handleSkipManager}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow transition"
            >
              Skip for Now
            </button>
            
            <button
              onClick={() => navigate("/tenant/branches")}
              className="w-full text-blue-600 hover:underline text-sm"
            >
              View All Branches
            </button>
          </div>
        </div>
        
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={modalState.isOpen}
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
          details={modalState.details}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onConfirm={modalState.type === 'warning' ? confirmSkipManager : undefined}
          confirmText={modalState.type === 'warning' ? "Yes, Skip" : "OK"}
          cancelText="Cancel"
          showCancel={modalState.type === 'warning'}
        />
      </TenantDashboardLayout>
    );
  }

  return (
    <TenantDashboardLayout>
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 mt-8">
        <button
          onClick={() => navigate("/tenant/branches")}
          className="mb-6 text-blue-600 hover:underline"
        >
          &larr; Back to all branches
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-700 mb-2">Create New Branch</h1>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</div>
              <span className="ml-2 font-medium text-blue-600">Branch Details</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-semibold">2</div>
              <span className="ml-2 text-gray-500">Create Manager</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleStep1Submit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter branch name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Code *
                </label>
                <input
                  type="text"
                  value={formData.branch_code}
                  onChange={(e) => handleInputChange('branch_code', e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                  placeholder="BR001"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                  placeholder="branch@veripharm.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                  placeholder="+256 700 000 000"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-4">Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                    placeholder="Kampala"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Region *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                    placeholder="Central"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Uganda">Uganda</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-4">Business Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Type
                </label>
                <select
                  value={formData.branch_type}
                  onChange={(e) => handleInputChange('branch_type', e.target.value as any)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                >
                  <option value="retail">Retail Pharmacy</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="hospital">Hospital Pharmacy</option>
                  <option value="clinic">Clinic Pharmacy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number *
                </label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => handleInputChange('license_number', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                  placeholder="PH/2024/001"
                />
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-4">Contact Person (Temporary)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                  placeholder="+256 700 000 000"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This person will be the temporary contact until a manager is assigned.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
          >
            {loading ? "Creating Branch..." : "Create Branch & Continue"}
          </button>
        </form>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        details={modalState.details}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={modalState.type === 'warning' ? confirmSkipManager : undefined}
        confirmText={modalState.type === 'warning' ? "Yes, Skip" : "OK"}
        cancelText="Cancel"
        showCancel={modalState.type === 'warning'}
      />
    </TenantDashboardLayout>
  );
};

export default CreateBranchWorkflow;
