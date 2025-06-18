-- Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));

-- Create index for faster role-based queries if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_users_role'
    ) THEN
        CREATE INDEX idx_users_role ON users(role);
    END IF;
END $$;

-- Update existing users to have appropriate roles
-- Note: You may want to manually set specific users as admin
UPDATE users SET role = 'admin' WHERE id = 1; -- Assuming first user is admin 