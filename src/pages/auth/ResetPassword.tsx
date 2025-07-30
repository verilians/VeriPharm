import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase/supabaseClient";
import { PasswordInput } from "../../components/UI";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract access_token from URL hash
    const hash = location.hash;
    const accessTokenMatch = hash.match(/access_token=([^&]+)/);
    
    if (accessTokenMatch) {
      const accessToken = accessTokenMatch[1];
      console.log("Reset token found:", accessToken);
      setHasToken(true);
      setError(""); // Clear any existing errors
    } else {
      console.log("No reset token found in URL");
      setHasToken(false);
      setError("No reset token found. Please request a new password reset.");
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // Extract access_token from URL hash
      const hash = location.hash;
      const accessTokenMatch = hash.match(/access_token=([^&]+)/);
      
      if (!accessTokenMatch) {
        throw new Error("No reset token found");
      }

      const accessToken = accessTokenMatch[1];
      console.log("Using reset token:", accessToken);

      // Set the session with the access token
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: ""
      });

      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Invalid reset token. Please request a new password reset.");
      }

      // Update password using Supabase
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error("Update user error:", error);
        throw error;
      }

      if (data.user) {
        setMessage("✅ Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async () => {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      // Extract email from URL or prompt user
      const email = prompt("Enter your email address:");
      
      if (!email) {
        setError("Email is required");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      setMessage("✅ Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Request reset error:", error);
      setError(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {hasToken ? "Enter your new password" : "Request a password reset"}
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {hasToken ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                label="New Password"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                label="Confirm Password"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  {message}
                </div>
              )}

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </button>

                <button
                  type="button"
                  onClick={handleRequestReset}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Request New Reset Email
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  No reset token found. Please request a new password reset email.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  {message}
                </div>
              )}

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleRequestReset}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Request Password Reset"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 