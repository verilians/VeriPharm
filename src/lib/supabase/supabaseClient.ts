import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Single client instance to avoid multiple GoTrueClient warning
let supabaseInstance: any = null;
let supabaseAdminInstance: any = null;

// Client for authentication operations
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'veripharm-auth',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
})();

// Client for data operations with service role access
export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        storageKey: 'veripharm-admin', // Different storage key
      },
    });
  }
  return supabaseAdminInstance;
})();
