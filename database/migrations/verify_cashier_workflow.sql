-- ============================================================================
-- VERIFICATION SCRIPT: Cashier Workflow & Reports Sync
-- ============================================================================
-- This script verifies that the cashier workflow is working correctly
-- and that Reports table is properly synced when items are marked as Collected
-- ============================================================================

-- Test 1: Check that Uncollected items are NOT in Collections or Reports
SELECT 
    'Test 1: Uncollected items should NOT be in Collections' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS' 
        ELSE '❌ FAIL - Found Uncollected items in Collections' 
    END as result
FROM "OverAllCollections" 
WHERE unclaimed_id IN (
    SELECT id FROM "Unclaimed" WHERE status = 'Uncollected'
);

SELECT 
    'Test 1b: Uncollected items should NOT be in Reports' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS' 
        ELSE '❌ FAIL - Found Uncollected items in Reports' 
    END as result
FROM "Reports" 
WHERE unclaimed_id IN (
    SELECT id FROM "Unclaimed" WHERE status = 'Uncollected'
);

-- Test 2: Check that Collected items ARE in both Collections and Reports
SELECT 
    'Test 2: Collected items should be in Collections' as test_name,
    u.collected_count,
    c.in_collections_count,
    CASE 
        WHEN u.collected_count = c.in_collections_count THEN '✅ PASS' 
        ELSE '⚠️ WARNING - Mismatch between Collected items and Collections entries' 
    END as result
FROM 
    (SELECT COUNT(*) as collected_count FROM "Unclaimed" WHERE status = 'Collected') u,
    (SELECT COUNT(*) as in_collections_count FROM "OverAllCollections" 
     WHERE unclaimed_id IN (SELECT id FROM "Unclaimed" WHERE status = 'Collected')) c;

SELECT 
    'Test 2b: Collected items should be in Reports' as test_name,
    u.collected_count,
    r.in_reports_count,
    CASE 
        WHEN u.collected_count = r.in_reports_count THEN '✅ PASS' 
        ELSE '⚠️ WARNING - Mismatch between Collected items and Reports entries' 
    END as result
FROM 
    (SELECT COUNT(*) as collected_count FROM "Unclaimed" WHERE status = 'Collected') u,
    (SELECT COUNT(*) as in_reports_count FROM "Reports" 
     WHERE unclaimed_id IN (SELECT id FROM "Unclaimed" WHERE status = 'Collected')) r;

-- Test 3: Verify Reports data matches Unclaimed data for Collected items
SELECT 
    'Test 3: Reports data should match Unclaimed data' as test_name,
    COUNT(*) as mismatched_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS' 
        ELSE '⚠️ WARNING - Found mismatched data between Unclaimed and Reports' 
    END as result
FROM "Unclaimed" u
LEFT JOIN "Reports" r ON u.id = r.unclaimed_id
WHERE u.status = 'Collected'
  AND (
      u.teller_name != r.teller_name OR
      u.bet_number != r.bet_number OR
      u.win_amount != r.amount
  );

-- Test 4: Show summary of all statuses
SELECT 
    'Test 4: Status Distribution Summary' as test_name,
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN id IN (SELECT unclaimed_id FROM "OverAllCollections") THEN 1 END) as in_collections,
    COUNT(CASE WHEN id IN (SELECT unclaimed_id FROM "Reports") THEN 1 END) as in_reports
FROM "Unclaimed"
GROUP BY status
ORDER BY status;

-- Test 5: Verify distribution percentages in Reports
SELECT 
    'Test 5: Reports distribution percentages' as test_name,
    id,
    teller_name,
    amount,
    staff_amount,
    collector_amount,
    agent_amount,
    admin_amount,
    CASE 
        WHEN staff_amount = amount * 0.10 
         AND collector_amount = amount * 0.10
         AND agent_amount = amount * 0.30
         AND admin_amount = amount * 0.50
        THEN '✅ CORRECT'
        ELSE '❌ INCORRECT PERCENTAGES'
    END as percentage_check
FROM "Reports"
LIMIT 10;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
DECLARE
    uncollected_in_collections INTEGER;
    uncollected_in_reports INTEGER;
    collected_count INTEGER;
    collections_count INTEGER;
    reports_count INTEGER;
BEGIN
    -- Count Uncollected items in Collections/Reports (should be 0)
    SELECT COUNT(*) INTO uncollected_in_collections
    FROM "OverAllCollections" 
    WHERE unclaimed_id IN (SELECT id FROM "Unclaimed" WHERE status = 'Uncollected');
    
    SELECT COUNT(*) INTO uncollected_in_reports
    FROM "Reports" 
    WHERE unclaimed_id IN (SELECT id FROM "Unclaimed" WHERE status = 'Uncollected');
    
    -- Count Collected items
    SELECT COUNT(*) INTO collected_count FROM "Unclaimed" WHERE status = 'Collected';
    SELECT COUNT(*) INTO collections_count FROM "OverAllCollections" 
    WHERE unclaimed_id IN (SELECT id FROM "Unclaimed" WHERE status = 'Collected');
    SELECT COUNT(*) INTO reports_count FROM "Reports" 
    WHERE unclaimed_id IN (SELECT id FROM "Unclaimed" WHERE status = 'Collected');
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CASHIER WORKFLOW VERIFICATION SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Uncollected Items (Cashier Marked):';
    RAISE NOTICE '  - In Collections: % (should be 0)', uncollected_in_collections;
    RAISE NOTICE '  - In Reports: % (should be 0)', uncollected_in_reports;
    RAISE NOTICE '';
    RAISE NOTICE 'Collected Items (Admin Approved):';
    RAISE NOTICE '  - Total Collected: %', collected_count;
    RAISE NOTICE '  - In Collections: %', collections_count;
    RAISE NOTICE '  - In Reports: %', reports_count;
    RAISE NOTICE '';
    
    IF uncollected_in_collections = 0 AND uncollected_in_reports = 0 THEN
        RAISE NOTICE '✅ PASS: No Uncollected items in Collections or Reports';
    ELSE
        RAISE NOTICE '❌ FAIL: Found Uncollected items in Collections or Reports';
    END IF;
    
    IF collected_count = collections_count AND collected_count = reports_count THEN
        RAISE NOTICE '✅ PASS: All Collected items are in Collections and Reports';
    ELSE
        RAISE NOTICE '⚠️  WARNING: Mismatch in Collected items sync';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
