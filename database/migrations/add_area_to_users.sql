-- Add area column to users table for collectors
ALTER TABLE users ADD COLUMN IF NOT EXISTS area TEXT;

-- Add comment
COMMENT ON COLUMN users.area IS 'Designated area for collector users';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_area ON users(area);
