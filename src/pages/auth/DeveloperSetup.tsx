import React, { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { PasswordInput } from "../../components/UI";

interface UserForm {
  email: string;
  password: string;
  role: string;
  name: string;
}

const DeveloperSetup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userExists, setUserExists] = useState(false);
  // const { createDeveloperUser } = useAuthStore(); // Method not implemented yet
  
  const [userForm, setUserForm] = useState<UserForm>({
    email: "dev@veripharm.com",
    password: "@dev123",
    role: "owner",
    name: "Developer User"
  });

  const roles = [
    { value: "owner", label: "Owner (Tenant Admin)", description: "Access to all tenant routes" },
    { value: "manager", label: "Manager", description: "Access to branch-level routes" },
    { value: "cashier", label: "Cashier", description: "Access to POS and basic branch routes" },
    { value: "staff", label: "Staff", description: "Limited branch access" }
  ];

  const handleCheckUser = async () => {
    setIsLoading(true);
    setMessage("");
    
    try {
      // Simple check - just show that we can create a user
      setMessage("❌ Use 'Create Developer User' to create a test user for development.");
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setIsLoading(true);
    setMessage("");
    
    try {
      // await createDeveloperUser(); // Method not implemented yet
      setMessage("⚠️ Developer user creation not implemented yet");
      setUserExists(false);
    } catch (error) {
      setMessage(`❌ Error creating user: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCustomUser = async () => {
    setIsLoading(true);
    setMessage("");
    
    try {
      const { supabase } = await import("../../lib/supabase/supabaseClient");
      
      const { data, error } = await supabase.auth.signUp({
        email: userForm.email,
        password: userForm.password,
        options: {
          data: {
            role: userForm.role,
            subscription_status: "active",
            name: userForm.name,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setMessage(`✅ User created successfully! Email: ${userForm.email}, Role: ${userForm.role}`);
      } else {
        setMessage("⚠️ User creation might require email confirmation");
      }
    } catch (error) {
      setMessage(`❌ Error creating user: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (field: keyof UserForm, value: string) => {
    setUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            User Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create users with different roles and permissions
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Quick Developer User Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Developer User
              </h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">dev@veripharm.com</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Password:</span>
                    <span className="ml-2 text-gray-900">@dev123</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Role:</span>
                    <span className="ml-2 text-gray-900">developer</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Access:</span>
                    <span className="ml-2 text-gray-900">All routes</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleCheckUser}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? "Checking..." : "Check Developer User"}
                </button>

                <button
                  onClick={handleCreateUser}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create Developer User"}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Custom User Creation */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Custom User
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={userForm.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={userForm.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter email address"
                  />
                </div>

                <PasswordInput
                  id="password"
                  name="password"
                  value={userForm.password}
                  onChange={(e) => handleFormChange("password", e.target.value)}
                  placeholder="Enter password"
                  required
                  label="Password"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="role"
                    value={userForm.role}
                    onChange={(e) => handleFormChange("role", e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCreateCustomUser}
                  disabled={isLoading || !userForm.email || !userForm.password}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create Custom User"}
                </button>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-md ${
                message.includes("✅") 
                  ? "bg-green-50 text-green-800" 
                  : "bg-red-50 text-red-800"
              }`}>
                {message}
              </div>
            )}

            {userExists && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Go to the login page</li>
                  <li>2. Use the credentials above to sign in</li>
                  <li>3. You'll have access based on your role</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSetup; 