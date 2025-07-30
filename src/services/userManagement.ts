/**
 * User Management API Service
 * This file contains functions for creating and managing users through Supabase Edge Functions
 */

import { supabase } from "../lib/supabase/supabaseClient";
import type { CreateBranchManagerRequest, CreateSalespersonRequest } from "../types/userManagement";

/**
 * Create a new tenant owner (called during tenant registration)
 * This should be called from a public sign-up form
 */
export async function createTenantOwner(tenantData: {
  tenantName: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone?: string;
  businessAddress?: string;
}) {
  try {
    const { data, error } = await supabase.functions.invoke('create-tenant-owner', {
      body: tenantData
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating tenant owner:', error);
    throw error;
  }
}

/**
 * Create a new branch manager
 * Only tenant owners can call this function
 */
export async function createBranchManager(request: CreateBranchManagerRequest) {
  try {
    const { data, error } = await supabase.functions.invoke('create-branch-manager', {
      body: request
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating branch manager:', error);
    throw error;
  }
}

/**
 * Create a new salesperson/cashier/staff
 * Branch managers and owners can call this function
 */
export async function createBranchEmployee(request: CreateSalespersonRequest) {
  try {
    const { data, error } = await supabase.functions.invoke('create-branch-employee', {
      body: request
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating branch employee:', error);
    throw error;
  }
}

/**
 * Get all users for a tenant (owners only)
 */
export async function getTenantUsers(tenantId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching tenant users:', error);
    throw error;
  }
}

/**
 * Get all users for a specific branch
 */
export async function getBranchUsers(branchId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('branch_id', branchId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching branch users:', error);
    throw error;
  }
}

/**
 * Update user status (activate/deactivate/suspend)
 */
export async function updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended') {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}
