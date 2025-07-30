/**
 * User Management Types
 * This file contains TypeScript interfaces for user management functionality
 */

import type { UserRole } from "../utils/authHelpers";

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  branchId?: string;
  tenantId: string;
}

export interface UserInvitation extends CreateUserData {
  id: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
}

export interface BranchUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  branchId: string;
  tenantId: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchManagerRequest {
  branchId: string;
  userData: CreateUserData;
}

export interface CreateSalespersonRequest {
  branchId: string;
  userData: CreateUserData;
}
