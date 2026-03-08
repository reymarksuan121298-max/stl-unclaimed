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
    ('parang_nelson', 'collector123', 'parang-spvr-nelson', 'collector', '5A Royal Gaming OPC', 'PARANG', 'active'),
    ('parang_rodelito', 'collector123', 'parang-spvr-rodelito', 'collector', '5A Royal Gaming OPC', 'PARANG', 'active'),
    ('parang_reymark', 'collector123', 'parang-spvr-reymark', 'collector', '5A Royal Gaming OPC', 'PARANG', 'active'),
    ('parang_jonathan', 'collector123', 'parang-spvr-jonathan', 'collector', '5A Royal Gaming OPC', 'PARANG', 'active'),
    
    -- Datu Saudi Area Collectors
    ('datusaudi_lakim', 'collector123', 'datusaudi-spvr-lakim', 'collector', '5A Royal Gaming OPC', 'DATUSAUDI', 'active'),
    
    -- Upi Area Collectors
    ('upi_joevert', 'collector123', 'upi-spvr-joevert', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    ('upi_cedric', 'collector123', 'upi-spvr-cedric', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    ('upi_livelo', 'collector123', 'upi-spvr-livelo', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    ('upi_wilboren', 'collector123', 'upi-spvr-wilboren', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    ('upi_armando', 'collector123', 'upi-spvr-armando', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    ('upi_guiamad', 'collector123', 'upi-spvr-guiamad', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    ('upi_pasawiran', 'collector123', 'upi-spvr-pasawiran', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    
    -- Ampatuan Area Collectors
    ('ampatuan_teddy', 'collector123', 'ampatuan-spvr-teddy', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    ('ampatuan_utto', 'collector123', 'ampatuan-spvr-utto', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    ('ampatuan_bai', 'collector123', 'ampatuan-spvr-bai', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    ('ampatuan_jerao2', 'collector123', 'ampatuan-spvr-jerao-2', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    ('ampatuan_kapinpilan', 'collector123', 'ampatuan-spvr-kapinpilan', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    ('ampatuan_kauran', 'collector123', 'ampatuan-spvr-kauran', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    
    -- Saidona Area Collectors
    ('saidona_dali', 'collector123', 'saidona-spvr-dali', 'collector', '5A Royal Gaming OPC', 'SAIDONA', 'active'),
    
    -- Dalican Area Collectors
    ('dalican_guiaman', 'collector123', 'dalican-spvr-guiaman', 'collector', '5A Royal Gaming OPC', 'DALICAN', 'active'),
    
    -- South Upi Area Collectors
    ('southupi_mark', 'collector123', 'southupi-spvr-mark', 'collector', '5A Royal Gaming OPC', 'SOUTHUPI', 'active'),
    ('southupi_rommel', 'collector123', 'southupi-spvr-rommel', 'collector', '5A Royal Gaming OPC', 'SOUTHUPI', 'active'),
    ('southupi_asrap', 'collector123', 'southupi-spvr-asrap', 'collector', '5A Royal Gaming OPC', 'SOUTHUPI', 'active'),
    
    -- North Kabuntalan Area Collectors
    ('nkabuntalan_rowel', 'collector123', 'nkabuntalan-spvr-rowel', 'collector', '5A Royal Gaming OPC', 'NKABUNTALAN', 'active'),
    
    -- DAS Area Collectors
    ('das_utto', 'collector123', 'das-spvr-utto', 'collector', '5A Royal Gaming OPC', 'DAS', 'active'),
    ('das_jerao', 'collector123', 'das-spvr-jerao', 'collector', '5A Royal Gaming OPC', 'DAS', 'active'),
    ('das_bai', 'collector123', 'das-spvr-bai', 'collector', '5A Royal Gaming OPC', 'DAS', 'active'),
    ('das_jerao2', 'collector123', 'das-spvr-jerao-2', 'collector', '5A Royal Gaming OPC', 'DAS', 'active'),
    ('das_brito', 'collector123', 'das-spvr-brito', 'collector', '5A Royal Gaming OPC', 'DAS', 'active'),
    
    -- DBS Area Collectors
    ('dbs_ago', 'collector123', 'dbs-spvr-ago', 'collector', '5A Royal Gaming OPC', 'DBS', 'active'),
    ('dbs_kinimi_ago', 'collector123', 'dbs-spvr-kinimi-ago', 'collector', '5A Royal Gaming OPC', 'DBS', 'active'),
    
    -- Datu Piang Area Collectors
    ('datupiang_pots', 'collector123', 'datupiang-spvr-pots', 'collector', '5A Royal Gaming OPC', 'DATUPIANG', 'active'),
    ('datupiang_pots3', 'collector123', 'datupiang-spvr-pots3', 'collector', '5A Royal Gaming OPC', 'DATUPIANG', 'active'),
    ('datupiang_padjero', 'collector123', 'datupiang-spvr-padjero', 'collector', '5A Royal Gaming OPC', 'DATUPIANG', 'active'),
    
    -- Pagalungan Area Collectors
    ('pagalungan_pots', 'collector123', 'pagalungan-spvr-pots', 'collector', '5A Royal Gaming OPC', 'PAGALUNGAN', 'active'),
    
    -- Montawal Area Collectors
    ('montawal_pots', 'collector123', 'montawal-spvr-pots', 'collector', '5A Royal Gaming OPC', 'MONTAWAL', 'active'),
    
    -- Rajah Buayan Area Collectors
    ('rajahbuayan_bai', 'collector123', 'rajahbuayan-spvr-bai', 'collector', '5A Royal Gaming OPC', 'RAJAHBUAYAN', 'active'),
    ('rajahbuayan_mohammad2', 'collector123', 'rajahbuayan-spvr-mohammad-2', 'collector', '5A Royal Gaming OPC', 'RAJAHBUAYAN', 'active'),
    
    -- Buluan Area Collectors
    ('buluan_bai', 'collector123', 'buluan-spvr-bai', 'collector', '5A Royal Gaming OPC', 'BULUAN', 'active'),
    ('buluan_jay', 'collector123', 'buluan-spvr-jay', 'collector', '5A Royal Gaming OPC', 'BULUAN', 'active'),
    
    -- Mamasapano Area Collectors
    ('mamasapano_bai', 'collector123', 'mamasapano-spvr-bai', 'collector', '5A Royal Gaming OPC', 'MAMASAPANO', 'active'),
    ('mamasapano_pasandalan', 'collector123', 'MAMASAPANO-SPVR-PASANDALAN', 'collector', '5A Royal Gaming OPC', 'MAMASAPANO', 'active'),
    
    -- DOS/Awang Area Collectors
    ('dos_awang_ramsie', 'collector123', 'dos/awang-spvr-ramsie', 'collector', '5A Royal Gaming OPC', 'DOS/AWANG', 'active'),
    ('dos_awang_lorenzo', 'collector123', 'dos/awang-spvr-lorenzo', 'collector', '5A Royal Gaming OPC', 'DOS/AWANG', 'active'),
    ('dos_awang_harif', 'collector123', 'dos/awang-spvr-harif', 'collector', '5A Royal Gaming OPC', 'DOS/AWANG', 'active'),
    ('dos_awang_jonny', 'collector123', 'dos/awang-spvr-jonny', 'collector', '5A Royal Gaming OPC', 'DOS/AWANG', 'active'),
    ('dos_awang_marlon', 'collector123', 'dos/awang-spvr-marlon', 'collector', '5A Royal Gaming OPC', 'DOS/AWANG', 'active'),
    ('dos_albaser', 'collector123', 'dos-spvr-albaser', 'collector', '5A Royal Gaming OPC', 'DOS', 'active'),
    
    -- Paglas Area Collectors
    ('paglas_castanos', 'collector123', 'paglas-spvr-castaños', 'collector', '5A Royal Gaming OPC', 'PAGLAS', 'active'),
    ('paglas_madidis', 'collector123', 'paglas-spvr-madidis', 'collector', '5A Royal Gaming OPC', 'PAGLAS', 'active'),
    ('paglas_suit', 'collector123', 'paglas-spvr-suit', 'collector', '5A Royal Gaming OPC', 'PAGLAS', 'active'),
    ('paglas_salbo', 'collector123', 'paglas-spvr-salbo', 'collector', '5A Royal Gaming OPC', 'PAGLAS', 'active'),
    
    -- Datu Hoffer Area Collectors
    ('datuhoffer_limpongo', 'collector123', 'DATUHOFFER-SPVR-LIMPONGO', 'collector', '5A Royal Gaming OPC', 'DATUHOFFER', 'active'),
    
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
