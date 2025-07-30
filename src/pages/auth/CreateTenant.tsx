import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const CreateTenant: React.FC = () => {
  const [tenantName, setTenantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Create a service role client for admin operations
  const serviceRoleClient = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  );

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Create the tenant first using service role
      const { data: tenantData, error: tenantError } = await serviceRoleClient
        .from("tenants")
        .insert({ 
          name: tenantName,
          email: email // The tenant email is the same as the admin's email
        })
        .select()
        .single();

      if (tenantError) {
        throw tenantError;
      }

      const tenant_id = tenantData.id;

      // Step 2: Create the user account using service role for admin creation
      const { data: authData, error: authError } = await serviceRoleClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for admin user
      });

      if (authError) {
        // Rollback: delete the tenant if user creation fails
        await serviceRoleClient.from("tenants").delete().eq("id", tenant_id);
        throw authError;
      }

      if (!authData.user) {
        // Rollback: delete the tenant if user creation fails
        await serviceRoleClient.from("tenants").delete().eq("id", tenant_id);
        throw new Error("Failed to create user account.");
      }

      const auth_user_id = authData.user.id;

      // Step 3: Create the user record linking them to the tenant using service role
      const { error: userError } = await serviceRoleClient
        .from("users")
        .insert({
          auth_user_id: auth_user_id,
          tenant_id: tenant_id,
          first_name: "Admin",
          last_name: "User",
          email: email,
          role: "owner", // Tenant admin should be owner
          subscription_status: "active", // Set active subscription for the admin
        });

      if (userError) {
        // Rollback: delete the auth user and tenant
        await serviceRoleClient.auth.admin.deleteUser(auth_user_id);
        await serviceRoleClient.from("tenants").delete().eq("id", tenant_id);
        throw userError;
      }

      setSuccess(
        "Tenant and admin user created successfully! You can now log in with your credentials."
      );
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Initial Tenant Setup
        </h2>
        <p className="text-center text-sm text-gray-600">
          Create the first tenant and administrator account for your application.
        </p>
        <form className="space-y-6" onSubmit={handleCreateTenant}>
          <div>
            <label
              htmlFor="tenantName"
              className="text-sm font-medium text-gray-700"
            >
              Tenant Name
            </label>
            <input
              id="tenantName"
              name="tenantName"
              type="text"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="e.g., VeriPharm Inc."
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Admin Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Admin Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {isLoading ? "Creating..." : "Create Tenant"}
            </button>
          </div>
        </form>
        {error && <p className="text-sm text-center text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-center text-green-600">{success}</p>
        )}
      </div>
    </div>
  );
};

export default CreateTenant;
