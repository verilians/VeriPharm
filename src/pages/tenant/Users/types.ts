export interface User {
  id: string;
  tenant_id?: string;
  auth_user_id?: string;
  branch_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  
  // Additional fields for UI compatibility
  name: string; // Computed from first_name + last_name
  branch: string; // Branch name for UI (derived from branch_id)
  image?: string; // Profile image URL
  salary?: string; // Salary information
  password?: string; // For user creation (not stored)
  
  // System fields
  created_at?: string;
  updated_at?: string;
}

// Database branch interface for dropdown population
export interface BranchOption {
  id: string;
  name: string;
  branch_code?: string;
}

export const ROLES = ["owner", "manager", "cashier", "pharmacist", "staff"] as const;
export const STATUSES = ["active", "inactive", "suspended"] as const;

export type UserRole = typeof ROLES[number];
export type UserStatus = typeof STATUSES[number];

export const createEmptyUser = (branches: BranchOption[] = []): User => ({
  id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: ROLES[1], // Default to manager
  status: STATUSES[0], // Default to active
  name: "",
  branch: branches[0]?.name || "",
  branch_id: branches[0]?.id || "",
  password: "", // Add password field for creation
  image: "",
  salary: "",
});
