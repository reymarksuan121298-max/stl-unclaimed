-- ============================================================================
-- ADD 5A ROYAL GAMING OPC COLLECTORS
-- ============================================================================
-- This script adds collector users for 5A Royal Gaming OPC franchise
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Insert collector users for 5A Royal Gaming OPC (avoiding duplicates)
INSERT INTO users (username, password, fullname, role, franchising_name, municipality, status)
VALUES
    -- Parang Area Collectors
    ('parang_nelson', 'collector123', 'PARANG-SPVR-NELSON', 'collector', '5A Royal Gaming OPC', 'PARANG', 'active'),
    ('parang_rodelito', 'collector123', 'PARANG-SPVR-RODELITO', 'collector', '5A Royal Gaming OPC', 'PARANG', 'active'),
    ('parang_reymark', 'collector123', 'PARANG-SPVR-REYMARK', 'collector', '5A Royal Gaming OPC', 'PARANG', 'active'),
    ('parang_jonathan', 'collector123', 'PARANG-SPVR-JONATHAN', 'collector', '5A Royal Gaming OPC', 'PARANG', 'active'),
    
    -- Datu Saudi Area Collectors
    ('datusaudi_lakim', 'collector123', 'DATUSAUDI-SPVR-LAKIM', 'collector', '5A Royal Gaming OPC', 'DATUSAUDI', 'active'),
    
    -- Upi Area Collectors
    ('upi_joevert', 'collector123', 'UPI-SPVR-JOEVERT', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    ('upi_cedric', 'collector123', 'UPI-SPVR-CEDRIC', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    ('upi_livelo', 'collector123', 'UPI-SPVR-LIVELO', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    ('upi_wilboren', 'collector123', 'UPI-SPVR-WILBOREN', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    ('upi_armando', 'collector123', 'UPI-SPVR-ARMANDO', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    ('upi_guiamad', 'collector123', 'UPI-SPVR-GUIAMAD', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    
    -- Ampatuan Area Collectors
    ('ampatuan_teddy', 'collector123', 'AMPATUAN-SPVR-TEDDY', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    ('ampatuan_utto', 'collector123', 'AMPATUAN-SPVR-UTTO', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    ('ampatuan_bai', 'collector123', 'AMPATUAN-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    
    -- Saidona Area Collectors
    ('saidona_dali', 'collector123', 'SAIDONA-SPVR-DALI', 'collector', '5A Royal Gaming OPC', 'SAIDONA', 'active'),
    
    -- Dalican Area Collectors
    ('dalican_guiaman', 'collector123', 'DALICAN-SPVR-GUIAMAN', 'collector', '5A Royal Gaming OPC', 'DALICAN', 'active'),
    
    -- South Upi Area Collectors
    ('southupi_mark', 'collector123', 'SOUTHUPI-SPVR-MARK', 'collector', '5A Royal Gaming OPC', 'SOUTHUPI', 'active'),
    ('southupi_rommel', 'collector123', 'SOUTHUPI-SPVR-ROMMEL', 'collector', '5A Royal Gaming OPC', 'SOUTHUPI', 'active'),
    
    -- North Kabuntalan Area Collectors
    ('nkabuntalan_rowel', 'collector123', 'NKABUNTALAN-SPVR-ROWEL', 'collector', '5A Royal Gaming OPC', 'NKABUNTALAN', 'active'),
    
    -- DAS Area Collectors
    ('das_utto', 'collector123', 'DAS-SPVR-UTTO', 'collector', '5A Royal Gaming OPC', 'DAS', 'active'),
    ('das_jerao', 'collector123', 'DAS-SPVR-JERAO', 'collector', '5A Royal Gaming OPC', 'DAS', 'active'),
    ('das_bai', 'collector123', 'DAS-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'DAS', 'active'),
    
    -- Datu Piang Area Collectors
    ('datupiang_pots', 'collector123', 'DATUPIANG-SPVR-POTS', 'collector', '5A Royal Gaming OPC', 'DATUPIANG', 'active'),
    
    -- Pagalungan Area Collectors
    ('pagalungan_pots', 'collector123', 'PAGALUNGAN-SPVR-POTS', 'collector', '5A Royal Gaming OPC', 'PAGALUNGAN', 'active'),
    
    -- Montawal Area Collectors
    ('montawal_pots', 'collector123', 'MONTAWAL-SPVR-POTS', 'collector', '5A Royal Gaming OPC', 'MONTAWAL', 'active'),
    
    -- Rajah Buayan Area Collectors
    ('rajahbuayan_bai', 'collector123', 'RAJAHBUAYAN-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'RAJAHBUAYAN', 'active'),
    
    -- Buluan Area Collectors
    ('buluan_bai', 'collector123', 'BULUAN-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'BULUAN', 'active'),
    
    -- Mamasapano Area Collectors
    ('mamasapano_bai', 'collector123', 'MAMASAPANO-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'MAMASAPANO', 'active'),
    
    -- Demo/Test Account
    ('demo_5a', 'collector123', 'DEMO', 'collector', '5A Royal Gaming OPC', NULL, 'active')


ON CONFLICT (username) DO NOTHING;

-- Verify the insertion
SELECT COUNT(*) as total_5a_collectors 
FROM users 
WHERE role = 'collector' 
  AND franchising_name = '5A Royal Gaming OPC';

-- Show all 5A Royal Gaming OPC collectors
SELECT id, username, fullname, franchising_name, role, status, created_at
FROM users
WHERE role = 'collector'
  AND franchising_name = '5A Royal Gaming OPC'
ORDER BY fullname;
