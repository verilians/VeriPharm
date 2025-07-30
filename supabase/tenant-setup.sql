-- ==========================================
-- VeriPharm Tenant Setup Script
-- ==========================================
-- Run this script in your Supabase SQL Editor to enable tenant creation
-- This script will set up the necessary permissions and policies

-- Enable Row Level Security on all tables (if not already enabled)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to insert tenants (for initial setup only)
-- WARNING: This is only for initial setup. You should disable this after creating your first tenant!
CREATE POLICY "allow_tenant_creation_for_setup" ON tenants
  FOR INSERT 
  WITH CHECK (true);

-- Create a policy to allow users to create their own profile after signup
CREATE POLICY "allow_user_creation" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = auth_user_id);

-- Create a policy to allow users to read their own profile
CREATE POLICY "users_can_read_own_profile" ON users
  FOR SELECT 
  USING (auth.uid() = auth_user_id);

-- Create a policy to allow users to read their tenant information
CREATE POLICY "users_can_read_own_tenant" ON tenants
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.tenant_id = tenants.id 
      AND users.auth_user_id = auth.uid()
    )
  );

-- ==========================================
-- IMPORTANT SECURITY NOTE:
-- ==========================================
-- After you create your first tenant and admin user, you should run this command
-- to remove the open tenant creation policy:
-- 
-- DROP POLICY "allow_tenant_creation_for_setup" ON tenants;
-- 
-- Then create a more restrictive policy like:
-- CREATE POLICY "only_owners_can_create_tenants" ON tenants
--   FOR INSERT 
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.auth_user_id = auth.uid() 
--       AND users.role = 'owner'
--     )
--   );
-- ==========================================

-- Create a function to check if this is the first tenant (optional helper)
CREATE OR REPLACE FUNCTION is_first_tenant_setup()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM tenants LIMIT 1);
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON tenants TO anon, authenticated;
GRANT SELECT, INSERT ON users TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

COMMENT ON POLICY "allow_tenant_creation_for_setup" ON tenants IS 'TEMPORARY: Remove this policy after initial setup!';
