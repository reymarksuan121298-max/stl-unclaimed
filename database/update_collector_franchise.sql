-- ============================================================================
-- UPDATE COLLECTOR FRANCHISE ASSIGNMENT
-- ============================================================================
-- This script updates existing collector users to assign them to Glowing Fortune OPC
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Update all collectors to have Glowing Fortune OPC as their franchise
UPDATE users
SET franchising_name = 'Glowing Fortune OPC'
WHERE role = 'collector'
  AND (franchising_name IS NULL OR franchising_name = '');

-- Verify the update
SELECT COUNT(*) as updated_collectors
FROM users
WHERE role = 'collector'
  AND franchising_name = 'Glowing Fortune OPC';

-- Show all collectors with their franchise
SELECT id, username, fullname, franchising_name, role, status
FROM users
WHERE role = 'collector'
ORDER BY fullname;
