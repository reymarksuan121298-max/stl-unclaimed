-- ============================================================================
-- ADD 28 COLLECTORS FOR 5A ROYAL GAMING OPC
-- ============================================================================
-- This script adds 28 specific collector users for 5A Royal Gaming OPC franchise
-- Run this in your Supabase SQL Editor
-- Default password for all collectors: collector123
-- ============================================================================

-- Insert collector users for 5A Royal Gaming OPC (avoiding duplicates)
INSERT INTO users (username, password, fullname, role, franchising_name, status, created_at, updated_at)
VALUES
    -- Ampatuan Area Collectors (6)
    ('AMPATUAN-SPVR-BAI', 'collector123', 'AMPATUAN-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('AMPATUAN-SPVR-UTTO', 'collector123', 'AMPATUAN-SPVR-UTTO', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('AMPATUAN-SPVR-KAURAN', 'collector123', 'AMPATUAN-SPVR-KAURAN', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('AMPATUAN-SPVR-TEDDY', 'collector123', 'AMPATUAN-SPVR-TEDDY', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('AMPATUAN-SPVR-KAPINPILAN', 'collector123', 'AMPATUAN-SPVR-KAPINPILAN', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('AMPATUAN-SPVR-JERAO-2', 'collector123', 'AMPATUAN-SPVR-JERAO-2', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    
    -- DAS Area Collectors (3)
    ('DAS-SPVR-JERAO', 'collector123', 'DAS-SPVR-JERAO', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('DAS-SPVR-JERAO-2', 'collector123', 'DAS-SPVR-JERAO-2', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('DAS-SPVR-UTTO', 'collector123', 'DAS-SPVR-UTTO', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    
    -- Rajah Buayan & Buluan (2)
    ('RAJAHBUAYAN-SPVR-BAI', 'collector123', 'RAJAHBUAYAN-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('BULUAN-SPVR-BAI', 'collector123', 'BULUAN-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    
    -- Datu Piang Area Collectors (3)
    ('DATUPIANG-SPVR-POTS3', 'collector123', 'DATUPIANG-SPVR-POTS3', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('DATUPIANG-SPVR-POTS', 'collector123', 'DATUPIANG-SPVR-POTS', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('DATUPIANG-SPVR-PADJERO', 'collector123', 'DATUPIANG-SPVR-PADJERO', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    
    -- Datu Saudi Area Collectors (3)
    ('DATUSAUDI-SPVR-LAKIM', 'collector123', 'DATUSAUDI-SPVR-LAKIM', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('DOS-SPVR-ALBASER', 'collector123', 'DOS-SPVR-ALBASER', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('DATUSAUDI-SPVR-LAKIM-2', 'collector123', 'DATUSAUDI-SPVR-LAKIM-2', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    
    -- Mamasapano Area Collectors (2)
    ('MAMASAPANO-SPVR-PASANDALAN', 'collector123', 'MAMASAPANO-SPVR-PASANDALAN', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('MAMASAPANO-SPVR-BAI', 'collector123', 'MAMASAPANO-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    
    -- Saidona Area Collectors (1)
    ('SAIDONA-SPVR-DALI', 'collector123', 'SAIDONA-SPVR-DALI', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    
    -- Paglas Area Collectors (4)
    ('PAGLAS-SPVR-CASTAÑOS', 'collector123', 'PAGLAS-SPVR-CASTAÑOS', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('PAGLAS-SPVR-MADIDIS', 'collector123', 'PAGLAS-SPVR-MADIDIS', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('PAGLAS-SPVR-SUIT', 'collector123', 'PAGLAS-SPVR-SUIT', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    ('PAGLAS-SPVR-SALBO', 'collector123', 'PAGLAS-SPVR-SALBO', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    
    -- Datu Hoffer Area Collectors (1)
    ('DATUHOFFER-SPVR-LIMPONGO', 'collector123', 'DATUHOFFER-SPVR-LIMPONGO', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    
    -- Montawal Area Collectors (1)
    ('MONTAWAL-SPVR-POTS', 'collector123', 'MONTAWAL-SPVR-POTS', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    
    -- Pagalungan Area Collectors (1)
    ('PAGALUNGAN-SPVR-POTS', 'collector123', 'PAGALUNGAN-SPVR-POTS', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
    
    -- Dalican Area Collectors (1)
    ('DALICAN-SPVR-GUIAMAN', 'collector123', 'DALICAN-SPVR-GUIAMAN', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW())

ON CONFLICT (username) 
DO UPDATE SET
    fullname = EXCLUDED.fullname,
    role = EXCLUDED.role,
    franchising_name = EXCLUDED.franchising_name,
    status = EXCLUDED.status,
    updated_at = NOW();

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
