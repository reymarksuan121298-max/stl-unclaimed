-- ============================================================================
-- COMPLETE SETUP FOR 5A ROYAL GAMING OPC MUNICIPALITIES
-- ============================================================================
-- This script will:
-- 1. Add the municipality column to users table
-- 2. Create all the new municipalities in the Areas table
-- 3. Update existing 5A Royal collectors with their designated municipalities
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- STEP 1: Add municipality column to users table
-- ============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS municipality TEXT;

-- Add comment
COMMENT ON COLUMN users.municipality IS 'Designated municipality for collector users';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_municipality ON users(municipality);


-- STEP 2: Create all the new municipalities
-- ============================================================================
INSERT INTO "Areas" (name, description, status) VALUES
-- 5A Royal Gaming OPC municipalities
('PARANG', 'Parang Municipality', 'active'),
('DATUSAUDI', 'Datu Saudi Municipality', 'active'),
('UPI', 'Upi Municipality', 'active'),
('AMPATUAN', 'Ampatuan Municipality', 'active'),
('SAIDONA', 'Saidona Municipality', 'active'),
('DALICAN', 'Dalican Municipality', 'active'),
('SOUTHUPI', 'South Upi Municipality', 'active'),
('NKABUNTALAN', 'North Kabuntalan Municipality', 'active'),
('DAS', 'DAS Municipality', 'active'),
('DATUPIANG', 'Datu Piang Municipality', 'active'),
('PAGALUNGAN', 'Pagalungan Municipality', 'active'),
('MONTAWAL', 'Montawal Municipality', 'active'),
('RAJAHBUAYAN', 'Rajah Buayan Municipality', 'active'),
('BULUAN', 'Buluan Municipality', 'active'),
('MAMASAPANO', 'Mamasapano Municipality', 'active')
ON CONFLICT (name) DO NOTHING;


-- STEP 3: Update existing 5A Royal collectors with their designated municipalities
-- ============================================================================

-- Update PARANG collectors
UPDATE users SET municipality = 'PARANG' WHERE fullname IN (
    'PARANG-SPVR-NELSON',
    'PARANG-SPVR-RODELITO',
    'PARANG-SPVR-REYMARK',
    'PARANG-SPVR-JONATHAN'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update DATUSAUDI collectors
UPDATE users SET municipality = 'DATUSAUDI' WHERE fullname IN (
    'DATUSAUDI-SPVR-LAKIM'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update UPI collectors
UPDATE users SET municipality = 'UPI' WHERE fullname IN (
    'UPI-SPVR-JOEVERT',
    'UPI-SPVR-CEDRIC',
    'UPI-SPVR-LIVELO',
    'UPI-SPVR-WILBOREN',
    'UPI-SPVR-ARMANDO',
    'UPI-SPVR-GUIAMAD'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update AMPATUAN collectors
UPDATE users SET municipality = 'AMPATUAN' WHERE fullname IN (
    'AMPATUAN-SPVR-TEDDY',
    'AMPATUAN-SPVR-UTTO',
    'AMPATUAN-SPVR-BAI'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update SAIDONA collectors
UPDATE users SET municipality = 'SAIDONA' WHERE fullname IN (
    'SAIDONA-SPVR-DALI'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update DALICAN collectors
UPDATE users SET municipality = 'DALICAN' WHERE fullname IN (
    'DALICAN-SPVR-GUIAMAN'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update SOUTHUPI collectors
UPDATE users SET municipality = 'SOUTHUPI' WHERE fullname IN (
    'SOUTHUPI-SPVR-MARK',
    'SOUTHUPI-SPVR-ROMMEL'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update NKABUNTALAN collectors
UPDATE users SET municipality = 'NKABUNTALAN' WHERE fullname IN (
    'NKABUNTALAN-SPVR-ROWEL'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update DAS collectors
UPDATE users SET municipality = 'DAS' WHERE fullname IN (
    'DAS-SPVR-UTTO',
    'DAS-SPVR-JERAO',
    'DAS-SPVR-BAI'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update DATUPIANG collectors
UPDATE users SET municipality = 'DATUPIANG' WHERE fullname IN (
    'DATUPIANG-SPVR-POTS'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update PAGALUNGAN collectors
UPDATE users SET municipality = 'PAGALUNGAN' WHERE fullname IN (
    'PAGALUNGAN-SPVR-POTS'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update MONTAWAL collectors
UPDATE users SET municipality = 'MONTAWAL' WHERE fullname IN (
    'MONTAWAL-SPVR-POTS'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update RAJAHBUAYAN collectors
UPDATE users SET municipality = 'RAJAHBUAYAN' WHERE fullname IN (
    'RAJAHBUAYAN-SPVR-BAI'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update BULUAN collectors
UPDATE users SET municipality = 'BULUAN' WHERE fullname IN (
    'BULUAN-SPVR-BAI'
) AND franchising_name = '5A Royal Gaming OPC';

-- Update MAMASAPANO collectors
UPDATE users SET municipality = 'MAMASAPANO' WHERE fullname IN (
    'MAMASAPANO-SPVR-BAI'
) AND franchising_name = '5A Royal Gaming OPC';


-- VERIFICATION QUERIES
-- ============================================================================

-- Check if municipality column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'municipality';

-- Count total municipalities
SELECT COUNT(*) as total_municipalities FROM "Areas";

-- Show all 5A Royal Gaming OPC collectors with their municipalities
SELECT id, username, fullname, municipality, franchising_name, role, status
FROM users
WHERE franchising_name = '5A Royal Gaming OPC'
ORDER BY municipality, fullname;

-- Count collectors by municipality
SELECT municipality, COUNT(*) as collector_count
FROM users
WHERE franchising_name = '5A Royal Gaming OPC' AND role = 'collector'
GROUP BY municipality
ORDER BY municipality;
