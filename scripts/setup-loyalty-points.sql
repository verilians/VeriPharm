-- =====================================================
-- LOYALTY POINTS SETUP SCRIPT
-- =====================================================
-- This script sets up basic loyalty points configuration
-- and provides examples for testing the system.

-- =====================================================
-- 1. BASIC CONFIGURATION SETUP
-- =====================================================

-- Set up basic loyalty configuration for all existing tenants
INSERT INTO public.loyalty_config (
  tenant_id, 
  branch_id, 
  points_per_currency_unit, 
  currency_unit, 
  minimum_purchase_for_points, 
  points_expiry_days,
  is_active
)
SELECT 
  t.id::uuid as tenant_id,
  b.id::uuid as branch_id,
  1 as points_per_currency_unit,        -- 1 point per currency unit
  1000 as currency_unit,                -- 1000 UGX = 1 point
  0 as minimum_purchase_for_points,     -- No minimum purchase required
  365 as points_expiry_days,           -- Points expire after 1 year
  true as is_active
FROM public.tenants t
CROSS JOIN public.branches b
WHERE b.tenant_id = t.id
  AND NOT EXISTS (
    SELECT 1 FROM public.loyalty_config lc 
    WHERE lc.tenant_id = t.id::uuid 
      AND lc.branch_id = b.id::uuid
  );

-- =====================================================
-- 2. TEST THE SYSTEM
-- =====================================================

-- Test loyalty points calculation function
SELECT 
  'Test Calculation' as test_type,
  calculate_loyalty_points(
    (SELECT id FROM tenants LIMIT 1),
    (SELECT id FROM branches LIMIT 1),
    5000  -- 5000 UGX sale
  ) as points_earned;

-- =====================================================
-- 3. VIEW CURRENT LOYALTY STATUS
-- =====================================================

-- View loyalty configuration
SELECT 
  'Loyalty Configuration' as info_type,
  lc.tenant_id,
  lc.branch_id,
  lc.points_per_currency_unit,
  lc.currency_unit,
  lc.minimum_purchase_for_points,
  lc.points_expiry_days,
  lc.is_active
FROM public.loyalty_config lc
ORDER BY lc.tenant_id, lc.branch_id;

-- View customers with loyalty points
SELECT 
  'Customer Loyalty Points' as info_type,
  c.id,
  c.first_name,
  c.last_name,
  c.loyalty_points,
  c.total_purchases,
  c.total_spent,
  t.name as tenant_name,
  b.name as branch_name
FROM public.customers c
JOIN public.tenants t ON c.tenant_id = t.id
JOIN public.branches b ON c.branch_id = b.id
WHERE c.loyalty_points > 0
ORDER BY c.loyalty_points DESC;

-- =====================================================
-- 4. MANUAL POINTS ADJUSTMENT EXAMPLE
-- =====================================================

-- Example: Manually add 100 points to a customer
-- (Replace 'customer-uuid' with actual customer ID)
/*
INSERT INTO public.loyalty_transactions (
  tenant_id,
  branch_id,
  customer_id,
  transaction_type,
  points_amount,
  points_balance_before,
  points_balance_after,
  description,
  created_by
) 
SELECT 
  c.tenant_id,
  c.branch_id,
  c.id,
  'adjusted',
  100,
  c.loyalty_points,
  c.loyalty_points + 100,
  'Manual points adjustment',
  (SELECT id FROM users WHERE role = 'owner' LIMIT 1)
FROM public.customers c
WHERE c.id = 'customer-uuid';

-- Update customer's loyalty points
UPDATE public.customers
SET loyalty_points = loyalty_points + 100
WHERE id = 'customer-uuid';
*/

-- =====================================================
-- 5. LOYALTY POINTS REDEMPTION EXAMPLE
-- =====================================================

-- Example: Redeem 50 points from a customer
-- (Replace 'customer-uuid' with actual customer ID)
/*
INSERT INTO public.loyalty_transactions (
  tenant_id,
  branch_id,
  customer_id,
  transaction_type,
  points_amount,
  points_balance_before,
  points_balance_after,
  description,
  created_by
) 
SELECT 
  c.tenant_id,
  c.branch_id,
  c.id,
  'redeemed',
  50,
  c.loyalty_points,
  GREATEST(c.loyalty_points - 50, 0),
  'Points redemption',
  (SELECT id FROM users WHERE role = 'owner' LIMIT 1)
FROM public.customers c
WHERE c.id = 'customer-uuid';

-- Update customer's loyalty points
UPDATE public.customers
SET loyalty_points = GREATEST(loyalty_points - 50, 0)
WHERE id = 'customer-uuid';
*/

-- =====================================================
-- 6. MONITORING QUERIES
-- =====================================================

-- View recent loyalty transactions
SELECT 
  'Recent Loyalty Transactions' as info_type,
  lt.transaction_type,
  lt.points_amount,
  lt.points_balance_before,
  lt.points_balance_after,
  lt.currency_amount,
  lt.description,
  lt.created_at,
  c.first_name || ' ' || c.last_name as customer_name
FROM public.loyalty_transactions lt
JOIN public.customers c ON lt.customer_id = c.id
ORDER BY lt.created_at DESC
LIMIT 10;

-- View loyalty points summary by tenant
SELECT 
  'Loyalty Summary by Tenant' as info_type,
  t.name as tenant_name,
  COUNT(c.id) as total_customers,
  SUM(c.loyalty_points) as total_points,
  AVG(c.loyalty_points) as avg_points_per_customer,
  MAX(c.loyalty_points) as max_points
FROM public.customers c
JOIN public.tenants t ON c.tenant_id = t.id
GROUP BY t.id, t.name
ORDER BY total_points DESC;

-- =====================================================
-- 7. CLEANUP EXPIRED POINTS
-- =====================================================

-- Run this periodically to expire old points
-- SELECT expire_loyalty_points();

-- =====================================================
-- SCRIPT COMPLETED
-- =====================================================

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================

/*
LOYALTY POINTS SYSTEM IS NOW ACTIVE!

1. AUTOMATIC POINTS EARNING:
   - Every completed sale will automatically award loyalty points
   - Points are calculated based on sale amount and configuration
   - Default: 1 point per 1000 UGX spent

2. CONFIGURATION:
   - Edit loyalty_config table to customize points system
   - Set different rates for different branches
   - Adjust minimum purchase requirements

3. MONITORING:
   - Check loyalty_transactions table for all point activities
   - View customer loyalty_points column for current balances
   - Run monitoring queries above for insights

4. MANUAL ADJUSTMENTS:
   - Use loyalty_transactions table for manual point adjustments
   - Transaction types: earned, redeemed, expired, adjusted
   - Always update both loyalty_transactions and customers tables

5. EXPIRY:
   - Run expire_loyalty_points() function periodically
   - Points will expire based on configuration
   - Expired points are tracked in transactions

EXAMPLE: Customer spends 5000 UGX
- Points earned: 5000 / 1000 * 1 = 5 points
- Customer loyalty_points increases by 5
- Transaction recorded in loyalty_transactions
*/ 