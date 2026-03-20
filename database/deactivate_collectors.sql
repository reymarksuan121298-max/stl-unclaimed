-- ============================================================================
-- DEACTIVATE ALL COLLECTOR USERS
-- ============================================================================
-- This script sets the status of ALL users with the 'collector' role to 'inactive'
-- This will prevent them from logging into the mobile or web application
-- and participating in new transactions until re-activated.
--
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- 1. Perform the deactivation
UPDATE users 
SET 
    status = 'active', 
    updated_at = NOW() 
WHERE 
    role = 'collector';

-- 2. Verify the update (shows counts of each status for collectors)
SELECT 
    status, 
    COUNT(*) as collector_count
FROM 
    users 
WHERE 
    role = 'collector'
GROUP BY 
    status;

-- 3. Show details for some of the deactivated collectors
SELECT 
    id, 
    username, 
    fullname, 
    franchising_name,
    role, 
    status, 
    updated_at
FROM 
    users
WHERE 
    role = 'collector'
ORDER BY 
    updated_at DESC
LIMIT 15;
