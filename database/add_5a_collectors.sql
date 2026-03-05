-- ============================================================================
-- Add 28 Collectors for 5A Royal Gaming OPC
-- ============================================================================
-- This script creates collector user accounts for the 5A Royal Gaming OPC franchise
-- Default password for all collectors: collector123
-- All collectors are set to active status
-- ============================================================================

-- Insert or update collectors
-- Using ON CONFLICT to handle existing usernames
INSERT INTO users (username, password, fullname, role, franchising_name, status, created_at, updated_at) VALUES
('AMPATUAN-SPVR-BAI', 'collector123', 'AMPATUAN-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('AMPATUAN-SPVR-UTTO', 'collector123', 'AMPATUAN-SPVR-UTTO', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('AMPATUAN-SPVR-KAURAN', 'collector123', 'AMPATUAN-SPVR-KAURAN', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('AMPATUAN-SPVR-TEDDY', 'collector123', 'AMPATUAN-SPVR-TEDDY', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('AMPATUAN-SPVR-KAPINPILAN', 'collector123', 'AMPATUAN-SPVR-KAPINPILAN', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('AMPATUAN-SPVR-JERAO-2', 'collector123', 'AMPATUAN-SPVR-JERAO-2', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('DAS-SPVR-JERAO', 'collector123', 'DAS-SPVR-JERAO', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('DAS-SPVR-JERAO-2', 'collector123', 'DAS-SPVR-JERAO-2', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('DAS-SPVR-UTTO', 'collector123', 'DAS-SPVR-UTTO', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('RAJAHBUAYAN-SPVR-BAI', 'collector123', 'RAJAHBUAYAN-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('BULUAN-SPVR-BAI', 'collector123', 'BULUAN-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('DATUPIANG-SPVR-POTS3', 'collector123', 'DATUPIANG-SPVR-POTS3', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('DATUPIANG-SPVR-POTS', 'collector123', 'DATUPIANG-SPVR-POTS', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('DATUSAUDI-SPVR-LAKIM', 'collector123', 'DATUSAUDI-SPVR-LAKIM', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('DOS-SPVR-ALBASER', 'collector123', 'DOS-SPVR-ALBASER', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('DATUSAUDI-SPVR-LAKIM-2', 'collector123', 'DATUSAUDI-SPVR-LAKIM-2', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('MAMASAPANO-SPVR-PASANDALAN', 'collector123', 'MAMASAPANO-SPVR-PASANDALAN', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('SAIDONA-SPVR-DALI', 'collector123', 'SAIDONA-SPVR-DALI', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('PAGLAS-SPVR-CASTAÑOS', 'collector123', 'PAGLAS-SPVR-CASTAÑOS', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('PAGLAS-SPVR-MADIDIS', 'collector123', 'PAGLAS-SPVR-MADIDIS', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('PAGLAS-SPVR-SUIT', 'collector123', 'PAGLAS-SPVR-SUIT', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('PAGLAS-SPVR-SALBO', 'collector123', 'PAGLAS-SPVR-SALBO', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('DATUPIANG-SPVR-PADJERO', 'collector123', 'DATUPIANG-SPVR-PADJERO', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('MAMASAPANO-SPVR-BAI', 'collector123', 'MAMASAPANO-SPVR-BAI', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('DATUHOFFER-SPVR-LIMPONGO', 'collector123', 'DATUHOFFER-SPVR-LIMPONGO', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('MONTAWAL-SPVR-POTS', 'collector123', 'MONTAWAL-SPVR-POTS', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('PAGALUNGAN-SPVR-POTS', 'collector123', 'PAGALUNGAN-SPVR-POTS', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW()),
('DALICAN-SPVR-GUIAMAN', 'collector123', 'DALICAN-SPVR-GUIAMAN', 'collector', '5A Royal Gaming OPC', 'active', NOW(), NOW())
ON CONFLICT (username) 
DO UPDATE SET
    fullname = EXCLUDED.fullname,
    role = EXCLUDED.role,
    franchising_name = EXCLUDED.franchising_name,
    status = EXCLUDED.status,
    updated_at = NOW();

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
DECLARE
    collector_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO collector_count 
    FROM users 
    WHERE role = 'collector' 
    AND franchising_name = '5A Royal Gaming OPC';
    
    RAISE NOTICE '✅ Successfully added/updated 28 collectors for 5A Royal Gaming OPC';
    RAISE NOTICE '📊 Total collectors in 5A Royal Gaming OPC: %', collector_count;
    RAISE NOTICE '🔑 Default password for all collectors: collector123';
    RAISE NOTICE '✨ All collectors are set to active status';
END $$;
