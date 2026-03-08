-- ============================================================================
-- COMPLETE SETUP FOR 5A ROYAL GAMING OPC AREAS
-- ============================================================================
-- This script will:
-- 1. Add the area column to users table
-- 2. Create all the new areas in the Areas table
-- 3. Update existing 5A Royal collectors with their designated areas
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- STEP 1: Add area column to users table
-- ============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS area TEXT;

-- Add comment
COMMENT ON COLUMN users.area IS 'Designated area for collector users';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_area ON users(area);


-- STEP 2: Create all the new areas
-- ============================================================================
INSERT INTO "Areas" (name, description, status) VALUES
-- 5A Royal Gaming OPC areas
('PARANG', 'Parang Area', 'active'),
('DATUSAUDI', 'Datu Saudi Area', 'active'),
('UPI', 'Upi Area', 'active'),
('AMPATUAN', 'Ampatuan Area', 'active'),
('SAIDONA', 'Saidona Area', 'active'),
('DALICAN', 'Dalican Area', 'active'),
('SOUTHUPI', 'South Upi Area', 'active'),
('NKABUNTALAN', 'North Kabuntalan Area', 'active'),
('DAS', 'DAS Area', 'active'),
('DATUPIANG', 'Datu Piang Area', 'active'),
('PAGALUNGAN', 'Pagalungan Area', 'active'),
('MONTAWAL', 'Montawal Area', 'active'),
('RAJAHBUAYAN', 'Rajah Buayan Area', 'active'),
('BULUAN', 'Buluan Area', 'active'),
('MAMASAPANO', 'Mamasapano Area', 'active')
ON CONFLICT (name) DO NOTHING;


-- STEP 3: Update existing 5A Royal collectors with their designated areas
-- ============================================================================

-- Update PARANG collectors
UPDATE users SET area = 'PARANG' WHERE fullname IN (
    'PARANG-SPVR-NELSON',
    'PARANG-SPVR-RODELITO',
    'PARANG-SPVR-REYMARK',
    'PARANG-SPVR-JONATHAN'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update DATUSAUDI collectors
UPDATE users SET area = 'DATUSAUDI' WHERE fullname IN (
    'DATUSAUDI-SPVR-LAKIM'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update UPI collectors
UPDATE users SET area = 'UPI' WHERE fullname IN (
    'UPI-SPVR-JOEVERT',
    'UPI-SPVR-CEDRIC',
    'UPI-SPVR-LIVELO',
    'UPI-SPVR-WILBOREN',
    'UPI-SPVR-ARMANDO',
    'UPI-SPVR-GUIAMAD'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update AMPATUAN collectors
UPDATE users SET area = 'AMPATUAN' WHERE fullname IN (
    'AMPATUAN-SPVR-TEDDY',
    'AMPATUAN-SPVR-UTTO',
    'AMPATUAN-SPVR-BAI'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update SAIDONA collectors
UPDATE users SET area = 'SAIDONA' WHERE fullname IN (
    'SAIDONA-SPVR-DALI'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update DALICAN collectors
UPDATE users SET area = 'DALICAN' WHERE fullname IN (
    'DALICAN-SPVR-GUIAMAN'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update SOUTHUPI collectors
UPDATE users SET area = 'SOUTHUPI' WHERE fullname IN (
    'SOUTHUPI-SPVR-MARK',
    'SOUTHUPI-SPVR-ROMMEL'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update NKABUNTALAN collectors
UPDATE users SET area = 'NKABUNTALAN' WHERE fullname IN (
    'NKABUNTALAN-SPVR-ROWEL'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update DAS collectors
UPDATE users SET area = 'DAS' WHERE fullname IN (
    'DAS-SPVR-UTTO',
    'DAS-SPVR-JERAO',
    'DAS-SPVR-BAI'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update DATUPIANG collectors
UPDATE users SET area = 'DATUPIANG' WHERE fullname IN (
    'DATUPIANG-SPVR-POTS'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update PAGALUNGAN collectors
UPDATE users SET area = 'PAGALUNGAN' WHERE fullname IN (
    'PAGALUNGAN-SPVR-POTS'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update MONTAWAL collectors
UPDATE users SET area = 'MONTAWAL' WHERE fullname IN (
    'MONTAWAL-SPVR-POTS'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update RAJAHBUAYAN collectors
UPDATE users SET area = 'RAJAHBUAYAN' WHERE fullname IN (
    'RAJAHBUAYAN-SPVR-BAI'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update BULUAN collectors
UPDATE users SET area = 'BULUAN' WHERE fullname IN (
    'BULUAN-SPVR-BAI'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update MAMASAPANO collectors
UPDATE users SET area = 'MAMASAPANO' WHERE fullname IN (
    'MAMASAPANO-SPVR-BAI'
) AND franchising_name = '5A Royal Gaming OPC';


-- VERIFICATION QUERIES
-- ============================================================================

-- Check if area column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'area';

-- Count total areas
SELECT COUNT(*) as total_areas FROM "Areas";

-- Show all 5A Royal Gaming OPC collectors with their areas
SELECT id, username, fullname, area, franchising_name, role, status
FROM users
WHERE franchising_name = '5A Royal Gaming OPC'
ORDER BY area, fullname;

-- Count collectors by area
SELECT area, COUNT(*) as collector_count
FROM users
WHERE franchising_name = '5A Royal Gaming OPC' AND role = 'collector'
GROUP BY area
ORDER BY area;
