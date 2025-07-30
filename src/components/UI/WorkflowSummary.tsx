import React from "react";

interface WorkflowSummaryProps {
  branchData: {
    id: string;
    name: string;
    branch_code: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    status: string;
    created_at: string;
  };
  managerData?: {
    id: string;
    name: string;
    email: string;
    temporary_password: string;
    created_at: string;
  };
  onViewBranch: () => void;
  onCreateAnotherBranch: () => void;
}

const WorkflowSummary: React.FC<WorkflowSummaryProps> = ({
  branchData,
  managerData,
  onViewBranch,
  onCreateAnotherBranch
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-green-700 mb-2">
          {managerData ? "Branch & Manager Created Successfully!" : "Branch Created Successfully!"}
        </h1>
        <p className="text-gray-600">
          Your two-step branch creation workflow has been completed.
        </p>
      </div>

      {/* Branch Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-3">✅ Branch Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-blue-600 font-medium">Name:</span>
            <span className="ml-2 text-gray-700">{branchData.name}</span>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Code:</span>
            <span className="ml-2 text-gray-700">{branchData.branch_code}</span>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Email:</span>
            <span className="ml-2 text-gray-700">{branchData.email}</span>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Phone:</span>
            <span className="ml-2 text-gray-700">{branchData.phone}</span>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Location:</span>
            <span className="ml-2 text-gray-700">{branchData.city}, {branchData.state}</span>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Status:</span>
            <span className="ml-2 text-green-600 font-medium">{branchData.status}</span>
          </div>
        </div>
        <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
          <strong>Database ID:</strong> {branchData.id} | <strong>Created:</strong> {new Date(branchData.created_at).toLocaleString()}
        </div>
      </div>

      {/* Manager Summary */}
      {managerData ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-3">✅ Manager Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <span className="text-green-600 font-medium">Name:</span>
              <span className="ml-2 text-gray-700">{managerData.name}</span>
            </div>
            <div>
              <span className="text-green-600 font-medium">Email:</span>
              <span className="ml-2 text-gray-700">{managerData.email}</span>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
            <h4 className="font-medium text-yellow-800 mb-2">🔐 Login Credentials</h4>
            <div className="text-sm space-y-1">
              <div>
                <span className="text-yellow-700 font-medium">Email:</span>
                <span className="ml-2 text-gray-700 font-mono bg-white px-2 py-1 rounded">{managerData.email}</span>
              </div>
              <div>
                <span className="text-yellow-700 font-medium">Temporary Password:</span>
                <span className="ml-2 text-gray-700 font-mono bg-white px-2 py-1 rounded">{managerData.temporary_password}</span>
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-2">
              ⚠️ Please save these credentials securely. The manager should change the password on first login.
            </p>
          </div>
          
          <div className="p-2 bg-green-100 rounded text-xs text-green-700">
            <strong>Account ID:</strong> {managerData.id} | <strong>Created:</strong> {new Date(managerData.created_at).toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Manager Not Created</h3>
          <p className="text-yellow-700 text-sm">
            You can create a manager for this branch later from the Users section.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={onViewBranch}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
        >
          View Branch Dashboard
        </button>
        
        <button
          onClick={onCreateAnotherBranch}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow transition"
        >
          Create Another Branch
        </button>
      </div>
    </div>
  );
};

export default WorkflowSummary;
