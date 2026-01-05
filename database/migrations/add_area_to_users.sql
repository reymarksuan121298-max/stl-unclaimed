-- Add municipality column to users table for collectors
ALTER TABLE users ADD COLUMN IF NOT EXISTS municipality TEXT;

-- Add comment
COMMENT ON COLUMN users.municipality IS 'Designated municipality for collector users';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_municipality ON users(municipality);
