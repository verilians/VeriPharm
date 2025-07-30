import { supabase, supabaseAdmin } from '../../supabase/supabaseClient';

export interface CreateBranchData {
  tenant_id: string;
  name: string;
  branch_code: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  branch_type: 'retail' | 'wholesale' | 'hospital' | 'clinic';
  license_number: string;
  contact_person: string;
  contact_phone: string;
  status?: 'active' | 'inactive';
}

export interface BranchResponse {
  id: string;
  name: string;
  branch_code: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  branch_type: string;
  license_number: string;
  timezone: string;
  operating_hours: any;
  contact_person: string;
  contact_phone: string;
  tenant_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const branchAPI = {
  /**
   * Create a new branch using service role to bypass RLS policies
   */
  async createBranch(branchData: CreateBranchData): Promise<ApiResponse<BranchResponse>> {
    try {
      console.log('Creating branch with service role:', branchData);
      
      // Use service role client to bypass RLS policies for branch creation
      const { data, error } = await supabaseAdmin
        .from('branches')
        .insert([branchData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating branch:', error);
        return {
          success: false,
          error: error.message || 'Failed to create branch'
        };
      }

      console.log('Branch created successfully:', data);
      return {
        success: true,
        data: data as BranchResponse,
        message: 'Branch created successfully'
      };
    } catch (error) {
      console.error('Error creating branch:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Get all branches for a tenant
   */
  async getBranches(tenantId: string): Promise<ApiResponse<BranchResponse[]>> {
    try {
      console.log('BranchAPI - getBranches called with tenantId:', tenantId);
      
      // Use service role client to bypass RLS policies
      const { data, error } = await supabaseAdmin
        .from('branches')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      console.log('BranchAPI - Supabase response:', { data, error });

      if (error) {
        console.error('BranchAPI - Supabase error fetching branches:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch branches'
        };
      }

      console.log('BranchAPI - Successfully fetched branches:', data);
      return {
        success: true,
        data: data as BranchResponse[]
      };
    } catch (error) {
      console.error('Error fetching branches:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Update branch manager using service role to bypass RLS policies
   */
  async updateBranchManager(branchId: string, managerId: string): Promise<ApiResponse<void>> {
    try {
      // Use service role client to bypass RLS policies for branch updates
      const { error } = await supabaseAdmin
        .from('branches')
        .update({ manager_id: managerId, updated_at: new Date().toISOString() })
        .eq('id', branchId);

      if (error) {
        console.error('Supabase error updating branch manager:', error);
        return {
          success: false,
          error: error.message || 'Failed to update branch manager'
        };
      }

      return {
        success: true,
        message: 'Branch manager updated successfully'
      };
    } catch (error) {
      console.error('Error updating branch manager:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};
