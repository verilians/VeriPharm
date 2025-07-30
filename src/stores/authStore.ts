import { create } from "zustand";
import { supabase, supabaseAdmin } from "../lib/supabase";


export interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  name?: string; // Optional name field
  role: "owner" | "manager" | "cashier" | "staff";
  tenant_id: string | null;
  branch_id: string | null;
  subscription_status: "active" | "expired" | "cancelled";
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: UserProfile | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  initializeAuth: () => Promise<void>;
  fetchUserProfile: (authUserId: string) => Promise<UserProfile | null>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Helper function to fetch user profile using service role client
async function fetchUserProfile(authUserId: string): Promise<UserProfile | null> {
  console.log("🔍 Fetching user profile for auth_user_id:", authUserId);
  
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("auth_user_id", authUserId)
      .single();

    if (error) {
      console.error("❌ Error fetching user profile:", error);
      return null;
    }

    if (!data) {
      console.log("❌ No user profile found for auth_user_id:", authUserId);
      return null;
    }

    console.log("✅ User profile found:", data);
    console.log("🔍 User role:", data.role, "Type:", typeof data.role);
    return data;
  } catch (error) {
    console.error("❌ Exception fetching user profile:", error);
    return null;
  }
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // State
  user: null,
  isInitialized: false,
  isLoading: false,
  error: null,

  // Actions
  fetchUserProfile,

  async initializeAuth() {
    console.log("🔄 Initializing auth...");
    set({ isLoading: true, error: null });

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("❌ Session error:", sessionError);
        set({ isInitialized: true, isLoading: false, error: sessionError.message });
        return;
      }

      if (!session?.user) {
        console.log("📝 No active session");
        set({ user: null, isInitialized: true, isLoading: false });
        return;
      }

      console.log("✅ Active session found for user:", session.user.id);

      // Fetch user profile
      const userProfile = await fetchUserProfile(session.user.id);
      
      if (!userProfile) {
        console.log("❌ No user profile found, clearing session");
        await supabase.auth.signOut();
        set({ user: null, isInitialized: true, isLoading: false });
        return;
      }

      console.log("✅ Auth initialized successfully");
      set({ user: userProfile, isInitialized: true, isLoading: false });

    } catch (error) {
      console.error("❌ Auth initialization error:", error);
      set({ 
        user: null, 
        isInitialized: true, 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  },

  async login(email: string, password: string) {
    console.log("🔑 Attempting login for:", email);
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Login error:", error);
        set({ isLoading: false, error: error.message });
        return;
      }

      if (!data.user) {
        console.error("❌ No user returned from login");
        set({ isLoading: false, error: "Login failed" });
        return;
      }

      console.log("✅ Login successful for user:", data.user.id);

      // Fetch user profile
      const userProfile = await fetchUserProfile(data.user.id);
      
      if (!userProfile) {
        console.error("❌ No user profile found after login");
        await supabase.auth.signOut();
        set({ isLoading: false, error: "User profile not found" });
        return;
      }

      console.log("✅ Login completed successfully");
      set({ user: userProfile, isLoading: false });

    } catch (error) {
      console.error("❌ Login exception:", error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Login failed" 
      });
    }
  },

  async logout() {
    console.log("🚪 Logging out...");
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ Logout error:", error);
        set({ isLoading: false, error: error.message });
        return;
      }

      console.log("✅ Logout successful");
      set({ user: null, isLoading: false });

    } catch (error) {
      console.error("❌ Logout exception:", error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Logout failed" 
      });
    }
  },

  clearError() {
    set({ error: null });
  },
}));

// Initialize auth on module load
useAuthStore.getState().initializeAuth();
