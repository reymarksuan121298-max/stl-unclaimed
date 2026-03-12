
-- SQL to add profile_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_url TEXT;

-- Verify columns
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'users';
