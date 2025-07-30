-- Clean, simple RLS policies without recursion issues
-- Run this after updating the user role to owner

-- Clean slate: Drop all existing policies
DROP POLICY IF EXISTS "users_can_read_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_read_same_tenant_users" ON users;
DROP POLICY IF EXISTS "users_can_read_tenant_users" ON users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_create_own_profile" ON users;
DROP POLICY IF EXISTS "managers_can_create_users" ON users;
DROP POLICY IF EXISTS "authenticated_users_can_create_profile" ON users;
DROP POLICY IF EXISTS "managers_can_update_tenant_users" ON users;
DROP POLICY IF EXISTS "managers_can_delete_tenant_users" ON users;

DROP POLICY IF EXISTS "users_can_read_own_tenant" ON tenants;
DROP POLICY IF EXISTS "authenticated_users_can_create_tenants" ON tenants;
DROP POLICY IF EXISTS "users_can_update_own_tenant" ON tenants;
DROP POLICY IF EXISTS "only_owners_can_create_tenants" ON tenants;
DROP POLICY IF EXISTS "managers_can_update_own_tenant" ON tenants;

-- Simple policies for users table (no recursion)
CREATE POLICY "allow_own_profile_access" ON users
  FOR ALL 
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Simple policies for tenants table (no recursion)  
CREATE POLICY "allow_authenticated_tenant_access" ON tenants
  FOR ALL 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Note: These are very permissive policies for simplicity
-- In production, you may want more restrictive policies
-- But this ensures no recursion and basic security
