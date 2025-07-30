import { supabase, supabaseAdmin } from '../../supabase/supabaseClient';

export interface CreateUserData {
  tenant_id: string;
  branch_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'manager' | 'cashier' | 'pharmacist' | 'staff';
  status: 'active' | 'inactive' | 'suspended';
  password?: string; // For user creation
}

export interface UserResponse {
  id: string;
  tenant_id: string;
  auth_user_id?: string;
  branch_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateManagerResponse extends UserResponse {
  temporary_password: string;
  auth_user_created: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Generate a secure temporary password
 */
function generateSecurePassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export const userAPI = {
  /**
   * Create a manager user with service role (no email confirmation required)
   */
  async createManagerWithServiceRole(userData: CreateUserData): Promise<ApiResponse<CreateManagerResponse>> {
    try {
      const tempPassword = generateSecurePassword();
      
      console.log('Creating manager with service role:', {
        ...userData,
        password: '[HIDDEN]'
      });

      // Step 1: Create auth user with service role
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm with service role
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          tenant_id: userData.tenant_id
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return {
          success: false,
          error: `Failed to create user account: ${authError.message}`
        };
      }

      if (!authUser.user) {
        return {
          success: false,
          error: 'Failed to create user account: No user returned'
        };
      }

      // Step 2: Create user record in users table using service role
      const userRecord = {
        ...userData,
        auth_user_id: authUser.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: dbUser, error: dbError } = await supabaseAdmin
        .from('users')
        .insert([userRecord])
        .select()
        .single();

      if (dbError) {
        console.error('Error creating user record:', dbError);
        
        // Cleanup: Delete auth user if database insert fails
        try {
          await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError);
        }

        return {
          success: false,
          error: `Failed to create user record: ${dbError.message}`
        };
      }

      console.log('Manager created successfully:', dbUser);

      return {
        success: true,
        data: {
          ...dbUser,
          temporary_password: tempPassword,
          auth_user_created: true
        } as CreateManagerResponse,
        message: 'Manager account created successfully'
      };

    } catch (error) {
      console.error('Error in createManagerWithServiceRole:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Create a regular user using service role to bypass RLS policies
   */
  async createUser(userData: CreateUserData): Promise<ApiResponse<UserResponse>> {
    try {
      console.log('API - Creating user with userData:', userData);
      
      let auth_user_id: string | undefined;
      
      // If password is provided, create auth user
      if (userData.password) {
        console.log('API - Creating auth user for email:', userData.email);
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true
        });

        if (authError) {
          console.error('API - Auth user creation error:', authError);
          return {
            success: false,
            error: `Authentication setup failed: ${authError.message}`
          };
        }

        auth_user_id = authUser.user?.id;
        console.log('API - Auth user created with ID:', auth_user_id);
      }

      const userRecord = {
        ...userData,
        auth_user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Remove password from database record
      const { password, ...dbRecord } = userRecord;
      
      console.log('API - Database record to insert:', dbRecord);

      // Use service role client to bypass RLS policies
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([dbRecord])
        .select()
        .single();

      if (error) {
        console.error('API - Supabase error creating user:', error);
        
        // Clean up auth user if database insertion fails
        if (auth_user_id) {
          console.log('API - Cleaning up auth user due to database error');
          await supabaseAdmin.auth.admin.deleteUser(auth_user_id);
        }
        
        return {
          success: false,
          error: error.message || 'Failed to create user'
        };
      }

      console.log('API - User created successfully:', data);
      return {
        success: true,
        data: data as UserResponse,
        message: 'User created successfully'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Get all users for a tenant
   */
  async getUsers(tenantId: string): Promise<ApiResponse<UserResponse[]>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          branch:branches(name)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching users:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch users'
        };
      }

      return {
        success: true,
        data: data as UserResponse[]
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to send password reset email'
        };
      }

      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Error sending password reset:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};
