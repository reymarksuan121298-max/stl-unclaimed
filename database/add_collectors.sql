-- ============================================================================
-- ADD COLLECTOR USERS
-- ============================================================================
-- This script adds collector users based on the provided list
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Insert collector users (avoiding duplicates)
-- All collectors assigned to Glowing Fortune OPC franchise
INSERT INTO users (username, password, fullname, role, franchising_name, status)
VALUES
    -- Iligan Collectors
    ('ili_mae', 'collector123', 'ILI-MAE JENNIFER BALANSAG', 'collector', 'Glowing Fortune OPC', 'active'),
    ('ili_erlu', 'collector123', 'ILI-ERLU ARBOLADURA', 'collector', 'Glowing Fortune OPC', 'active'),
    ('ili_hector', 'collector123', 'ILI-HECTOR CANDOLE', 'collector', 'Glowing Fortune OPC', 'active'),
    ('ili_sato', 'collector123', 'ILI-SATO RAMIREZ', 'collector', 'Glowing Fortune OPC', 'active'),
    ('ili_jesus', 'collector123', 'ILI-JESUS TITO DONATO', 'collector', 'Glowing Fortune OPC', 'active'),
    ('ili_joel', 'collector123', 'ILI-JOEL ONDONA', 'collector', 'Glowing Fortune OPC', 'active'),
    ('ili_regie', 'collector123', 'ILI-REGIE MORALES', 'collector', 'Glowing Fortune OPC', 'active'),
    ('ili_junrie', 'collector123', 'ILI-JUNRIE MORALES', 'collector', 'Glowing Fortune OPC', 'active'),
    ('ili_edgardo', 'collector123', 'ILI-EDGARDO P. CAINGLES JR.', 'collector', 'Glowing Fortune OPC', 'active'),
    ('ili_jet', 'collector123', 'ILI-JET MICHAEL DONATO', 'collector', 'Glowing Fortune OPC', 'active'),
    ('ili_jason', 'collector123', 'ILI-JASON AMEN', 'collector', 'Glowing Fortune OPC', 'active'),
    ('ili_isagani', 'collector123', 'ILI-ISAGANI S. PACULBA', 'collector', 'Glowing Fortune OPC', 'active'),
    ('ili_christian', 'collector123', 'ILI-CHRISTIAN AGATON', 'collector', 'Glowing Fortune OPC', 'active'),
    ('ili_patrick', 'collector123', 'ILI-PATRICK CHIONG', 'collector', 'Glowing Fortune OPC', 'active'),
    
    -- Baloi Collectors
    ('bal_jay', 'collector123', 'BAL-JAY CHENFOO SALAC', 'collector', 'Glowing Fortune OPC', 'active'),
    ('bal_marc', 'collector123', 'BAL-MARC LIBOT', 'collector', 'Glowing Fortune OPC', 'active'),
    ('bal_mapantas', 'collector123', 'BAL-MAPANTAS L MALA', 'collector', 'Glowing Fortune OPC', 'active'),
    
    -- Matampay Collectors
    ('mat_alisa', 'collector123', 'MAT-ALISA MAGONDACAN', 'collector', 'Glowing Fortune OPC', 'active'),
    ('mat_najmodin', 'collector123', 'MAT-NAJMODIN', 'collector', 'Glowing Fortune OPC', 'active'),
    
    -- Pantar Collectors
    ('pan_acmad', 'collector123', 'PAN-ACMAD PALO', 'collector', 'Glowing Fortune OPC', 'active'),
    
    -- Kauswagan Collectors
    ('kau_johh', 'collector123', 'KAU-JOHH STEPHEN GORRES', 'collector', 'Glowing Fortune OPC', 'active'),
    
    -- Bacuag Collectors
    ('bac_camilo', 'collector123', 'BAC-CAMILO JAY I MINOZA', 'collector', 'Glowing Fortune OPC', 'active'),
    ('bac_nave', 'collector123', 'BAC-NAVE XYRIL M. HOTILLA', 'collector', 'Glowing Fortune OPC', 'active'),
    
    -- Linamon Collectors
    ('lin_spvr', 'collector123', 'LIN-SPVR', 'collector', 'Glowing Fortune OPC', 'active'),
    
    -- Other Collectors (without prefix)
    ('camilo', 'collector123', 'CAMILO JAY I MINOZA', 'collector', 'Glowing Fortune OPC', 'active'),
    ('sato', 'collector123', 'SATO', 'collector', 'Glowing Fortune OPC', 'active'),
    ('jason', 'collector123', 'JASON', 'collector', 'Glowing Fortune OPC', 'active'),
    ('jaler', 'collector123', 'JALER', 'collector', 'Glowing Fortune OPC', 'active'),
    ('nave', 'collector123', 'NAVE XYRIL M. HOTILLA', 'collector', 'Glowing Fortune OPC', 'active'),
    
    -- Supervisors (as collectors)
    ('spvr_mark', 'collector123', 'SPVR. MARK', 'collector', 'Glowing Fortune OPC', 'active'),
    ('spvr_jack', 'collector123', 'SPVR. JACK', 'collector', 'Glowing Fortune OPC', 'active'),
    ('spvr_charles', 'collector123', 'SPVR. CHARLES', 'collector', 'Glowing Fortune OPC', 'active'),
    ('spvr_erlu', 'collector123', 'SPVR. ERLU', 'collector', 'Glowing Fortune OPC', 'active'),
    ('spvr_allan', 'collector123', 'SPVR-ALLAN', 'collector', 'Glowing Fortune OPC', 'active'),
    ('spvr_kevin', 'collector123', 'SPVR- KEVIN', 'collector', 'Glowing Fortune OPC', 'active'),
    ('spvr_aaron', 'collector123', 'SPVR-AARON', 'collector', 'Glowing Fortune OPC', 'active'),
    ('spvr_regie', 'collector123', 'SPVR. REGIE', 'collector', 'Glowing Fortune OPC', 'active'),
    ('spvr_hector', 'collector123', 'SPVR. HECTOR', 'collector', 'Glowing Fortune OPC', 'active'),
    ('spvr_patrick', 'collector123', 'SPVR-PATRCIK', 'collector', 'Glowing Fortune OPC', 'active'),
    ('admin_spvr', 'collector123', 'ADMIN-SPVR', 'collector', 'Glowing Fortune OPC', 'active')

ON CONFLICT (username) DO NOTHING;

-- Verify the insertion
SELECT COUNT(*) as total_collectors 
FROM users 
WHERE role = 'collector';

-- Show all collectors with their franchise assignment
SELECT id, username, fullname, franchising_name, role, status, created_at
FROM users
WHERE role = 'collector'
ORDER BY fullname;
