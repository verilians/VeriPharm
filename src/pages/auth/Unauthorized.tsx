import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { getDefaultRouteForRole } from "../../utils/authHelpers";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleGoBack = () => {
    if (user) {
      // Check user role and redirect to appropriate dashboard
      const defaultRoute = getDefaultRouteForRole(user.role);
      console.log(`🔄 Redirecting ${user.role} to: ${defaultRoute}`);
      navigate(defaultRoute);
    } else {
      // If not logged in, go to login page
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-sm w-full text-center">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-sm text-gray-600 mb-4">
            You don't have permission to access this page. 
            {user ? ` Your role (${user.role}) doesn't allow access to this resource.` : ' Please log in to continue.'}
          </p>
          <button 
            onClick={handleGoBack}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            {user ? `Go to ${user.role === 'owner' ? 'Tenant Dashboard' : user.role === 'manager' ? 'Branch Dashboard' : 'Your Dashboard'}` : 'Go to Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
