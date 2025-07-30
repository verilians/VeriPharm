-- Add subscription_status column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'cancelled', 'trial'));
        
        -- Update existing users to have active subscription
        UPDATE users SET subscription_status = 'active' WHERE subscription_status IS NULL;
        
        COMMENT ON COLUMN users.subscription_status IS 'User subscription status: active, expired, cancelled, trial';
    END IF;
END $$;
