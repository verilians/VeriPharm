-- Update the existing user to have owner role
UPDATE users 
SET role = 'owner' 
WHERE auth_user_id = 'ab1ac36d-18c5-4b76-afbe-31725cbc4d64';

-- Verify the update
SELECT 
  auth_user_id,
  first_name,
  last_name,
  email,
  role,
  tenant_id,
  subscription_status
FROM users 
WHERE auth_user_id = 'ab1ac36d-18c5-4b76-afbe-31725cbc4d64';
