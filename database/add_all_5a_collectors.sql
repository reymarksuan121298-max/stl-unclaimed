-- ============================================================================
-- ADD ALL 5A ROYAL GAMING OPC COLLECTORS
-- ============================================================================
-- This script adds all collector users for 5A Royal Gaming OPC franchise
-- Run this in your Supabase SQL Editor
-- Default password for all collectors: collector123
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
    ('upi_pasawiran', 'collector123', 'UPI-SPVR-PASAWIRAN', 'collector', '5A Royal Gaming OPC', 'UPI', 'active'),
    
    -- Ampatuan Area Collectors
    ('ampatuan_teddy', 'collector123', 'AMPATUAN-SPVR-TEDDY', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    ('ampatuan_utto', 'collector123', 'AMPATUAN-SPVR-UTTO', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    ('ampatuan_bai', 'collector123', 'AMPATUAN-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    ('ampatuan_jerao2', 'collector123', 'AMPATUAN-SPVR-JERAO-2', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    ('ampatuan_kapinpilan', 'collector123', 'AMPATUAN-SPVR-KAPINPILAN', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    ('ampatuan_kauran', 'collector123', 'AMPATUAN-SPVR-KAURAN', 'collector', '5A Royal Gaming OPC', 'AMPATUAN', 'active'),
    
    -- Saidona Area Collectors
    ('saidona_dali', 'collector123', 'SAIDONA-SPVR-DALI', 'collector', '5A Royal Gaming OPC', 'SAIDONA', 'active'),
    
    -- Dalican Area Collectors
    ('dalican_guiaman', 'collector123', 'DALICAN-SPVR-GUIAMAN', 'collector', '5A Royal Gaming OPC', 'DALICAN', 'active'),
    
    -- South Upi Area Collectors
    ('southupi_mark', 'collector123', 'SOUTHUPI-SPVR-MARK', 'collector', '5A Royal Gaming OPC', 'SOUTHUPI', 'active'),
    ('southupi_rommel', 'collector123', 'SOUTHUPI-SPVR-ROMMEL', 'collector', '5A Royal Gaming OPC', 'SOUTHUPI', 'active'),
    ('southupi_asrap', 'collector123', 'SOUTHUPI-SPVR-ASRAP', 'collector', '5A Royal Gaming OPC', 'SOUTHUPI', 'active'),
    
    -- North Kabuntalan Area Collectors
    ('nkabuntalan_rowel', 'collector123', 'NKABUNTALAN-SPVR-ROWEL', 'collector', '5A Royal Gaming OPC', 'NKABUNTALAN', 'active'),
    
    -- DAS Area Collectors
    ('das_utto', 'collector123', 'DAS-SPVR-UTTO', 'collector', '5A Royal Gaming OPC', 'DAS', 'active'),
    ('das_jerao', 'collector123', 'DAS-SPVR-JERAO', 'collector', '5A Royal Gaming OPC', 'DAS', 'active'),
    ('das_bai', 'collector123', 'DAS-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'DAS', 'active'),
    ('das_jerao2', 'collector123', 'DAS-SPVR-JERAO-2', 'collector', '5A Royal Gaming OPC', 'DAS', 'active'),
    ('das_brito', 'collector123', 'DAS-SPVR-BRITO', 'collector', '5A Royal Gaming OPC', 'DAS', 'active'),
    
    -- Datu Piang Area Collectors
    ('datupiang_pots', 'collector123', 'DATUPIANG-SPVR-POTS', 'collector', '5A Royal Gaming OPC', 'DATUPIANG', 'active'),
    ('datupiang_padjero', 'collector123', 'DATUPIANG-SPVR-PADJERO', 'collector', '5A Royal Gaming OPC', 'DATUPIANG', 'active'),
    ('datupiang_pots3', 'collector123', 'DATUPIANG-SPVR-POTS3', 'collector', '5A Royal Gaming OPC', 'DATUPIANG', 'active'),
    
    -- Pagalungan Area Collectors
    ('pagalungan_pots', 'collector123', 'PAGALUNGAN-SPVR-POTS', 'collector', '5A Royal Gaming OPC', 'PAGALUNGAN', 'active'),
    
    -- Montawal Area Collectors
    ('montawal_pots', 'collector123', 'MONTAWAL-SPVR-POTS', 'collector', '5A Royal Gaming OPC', 'MONTAWAL', 'active'),
    
    -- Rajah Buayan Area Collectors
    ('rajahbuayan_bai', 'collector123', 'RAJAHBUAYAN-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'RAJAHBUAYAN', 'active'),
    ('rajahbuayan_mohammad2', 'collector123', 'RAJAHBUAYAN-SPVR-MOHAMMAD-2', 'collector', '5A Royal Gaming OPC', 'RAJAHBUAYAN', 'active'),
    
    -- Buluan Area Collectors
    ('buluan_bai', 'collector123', 'BULUAN-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'BULUAN', 'active'),
    ('buluan_jay', 'collector123', 'BULUAN-SPVR-JAY', 'collector', '5A Royal Gaming OPC', 'BULUAN', 'active'),
    
    -- Mamasapano Area Collectors
    ('mamasapano_bai', 'collector123', 'MAMASAPANO-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'MAMASAPANO', 'active'),
    ('mamasapano_pasandalan', 'collector123', 'MAMASAPANO-SPVR-PASANDALAN', 'collector', '5A Royal Gaming OPC', 'MAMASAPANO', 'active'),
    
    -- DOS/AWANG Area Collectors
    ('dosawang_ramsie', 'collector123', 'DOS/AWANG-SPVR-RAMSIE', 'collector', '5A Royal Gaming OPC', 'DOS/AWANG', 'active'),
    ('dosawang_lorenzo', 'collector123', 'DOS/AWANG-SPVR-LORENZO', 'collector', '5A Royal Gaming OPC', 'DOS/AWANG', 'active'),
    ('dosawang_harif', 'collector123', 'DOS/AWANG-SPVR-HARIF', 'collector', '5A Royal Gaming OPC', 'DOS/AWANG', 'active'),
    ('dosawang_jonny', 'collector123', 'DOS/AWANG-SPVR-JONNY', 'collector', '5A Royal Gaming OPC', 'DOS/AWANG', 'active'),
    ('dosawang_marlon', 'collector123', 'DOS/AWANG-SPVR-MARLON', 'collector', '5A Royal Gaming OPC', 'DOS/AWANG', 'active'),
    
    -- DOS Area Collectors
    ('dos_albaser', 'collector123', 'DOS-SPVR-ALBASER', 'collector', '5A Royal Gaming OPC', 'DOS', 'active'),
    
    -- DBS Area Collectors
    ('dbs_ago', 'collector123', 'DBS-SPVR-AGO', 'collector', '5A Royal Gaming OPC', 'DBS', 'active'),
    ('dbs_kinimi_ago', 'collector123', 'DBS-SPVR-KINIMI-AGO', 'collector', '5A Royal Gaming OPC', 'DBS', 'active'),
    
    -- Paglas Area Collectors
    ('paglas_castanos', 'collector123', 'PAGLAS-SPVR-CASTAÑOS', 'collector', '5A Royal Gaming OPC', 'PAGLAS', 'active'),
    ('paglas_madidis', 'collector123', 'PAGLAS-SPVR-MADIDIS', 'collector', '5A Royal Gaming OPC', 'PAGLAS', 'active'),
    ('paglas_suit', 'collector123', 'PAGLAS-SPVR-SUIT', 'collector', '5A Royal Gaming OPC', 'PAGLAS', 'active'),
    ('paglas_salbo', 'collector123', 'PAGLAS-SPVR-SALBO', 'collector', '5A Royal Gaming OPC', 'PAGLAS', 'active'),
    
    -- Datu Hoffer Area Collectors
    ('datuhoffer_limpongo', 'collector123', 'DATUHOFFER-SPVR-LIMPONGO', 'collector', '5A Royal Gaming OPC', 'DATUHOFFER', 'active')

ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count total 5A Royal Gaming OPC collectors
SELECT COUNT(*) as total_5a_collectors 
FROM users 
WHERE role = 'collector' 
  AND franchising_name = '5A Royal Gaming OPC';

-- Show all 5A Royal Gaming OPC collectors grouped by municipality
SELECT 
    municipality,
    COUNT(*) as collector_count,
    STRING_AGG(fullname, ', ' ORDER BY fullname) as collectors
FROM users
WHERE role = 'collector'
  AND franchising_name = '5A Royal Gaming OPC'
GROUP BY municipality
ORDER BY municipality;

-- Show all 5A Royal Gaming OPC collectors (detailed list)
SELECT 
    id, 
    username, 
    fullname, 
    municipality,
    franchising_name, 
    role, 
    status, 
    created_at
FROM users
WHERE role = 'collector'
  AND franchising_name = '5A Royal Gaming OPC'
ORDER BY municipality, fullname;
