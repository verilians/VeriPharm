import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import loginBgImage from "../../assets/login bg image.jpg";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading, user, isInitialized } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (isInitialized && user) {
      switch (user.role) {
        case "owner":
          navigate("/tenant/dashboard");
          break;
        case "manager":
          navigate("/tenant/dashboard");
          break;
        case "cashier":
          navigate("/branch/dashboard");
          break;
        case "staff":
          navigate("/branch/dashboard");
          break;
        default:
          navigate("/branch/dashboard");
      }
    }
  }, [user, isInitialized, navigate]);

  // Show loading while auth is being initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await login(email, password);
      
      // Get user role from auth store after successful login
      const user = useAuthStore.getState().user;
      
      // Navigate based on user role
      if (user) {
        switch (user.role) {
          case "owner":
            navigate("/tenant/dashboard");
            break;
          case "manager":
            navigate("/tenant/dashboard"); // Manager can access tenant routes
            break;
          case "cashier":
            navigate("/branch/dashboard");
            break;
          case "staff":
            navigate("/branch/dashboard");
            break;
          default:
            navigate("/branch/dashboard"); // Default fallback
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    try {
      const { supabase } = await import("../../lib/supabase/supabaseClient");
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      setError(""); // Clear any existing errors
      alert("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError("Failed to send reset email. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${loginBgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome to VeriPharm
            </h2>
            <p className="text-white/80">Sign in to your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('password') as HTMLInputElement;
                    if (input) {
                      input.type = input.type === 'password' ? 'text' : 'password';
                    }
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white/80 focus:outline-none"
                  tabIndex={-1}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-white/30 rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500/60 to-blue-400/40 hover:from-blue-600/70 hover:to-blue-500/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Forgot your password?
              </button>
              <div className="text-white/60 text-xs">•</div>
              <button
                type="button"
                onClick={() => navigate("/create-tenant")}
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                First time? Create your tenant
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;