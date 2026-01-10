-- ============================================================================
-- TRIGGER: Remove from Collections when status changes to Unclaimed
-- ============================================================================
-- This trigger automatically removes entries from OverAllCollections and Reports
-- when an Unclaimed item's status is changed from 'Collected' or 'Uncollected' 
-- back to 'Unclaimed'
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_unclaimed_status_reverted ON "Unclaimed";
DROP FUNCTION IF EXISTS remove_from_collections_on_status_change();

-- Create function to remove from collections when status changes to Unclaimed
CREATE OR REPLACE FUNCTION remove_from_collections_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if status is being changed TO 'Unclaimed' FROM 'Collected' or 'Uncollected'
    IF NEW.status = 'Unclaimed' AND OLD.status IN ('Collected', 'Uncollected') THEN
        
        -- Delete from OverAllCollections table
        DELETE FROM "OverAllCollections"
        WHERE unclaimed_id = NEW.id;
        
        -- Delete from Reports table
        DELETE FROM "Reports"
        WHERE unclaimed_id = NEW.id;
        
        -- Log the removal
        RAISE NOTICE 'Removed collections and reports for unclaimed_id: %', NEW.id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires AFTER update on Unclaimed table
CREATE TRIGGER on_unclaimed_status_reverted
    AFTER UPDATE OF status ON "Unclaimed"
    FOR EACH ROW
    WHEN (NEW.status = 'Unclaimed' AND OLD.status IN ('Collected', 'Uncollected'))
    EXECUTE FUNCTION remove_from_collections_on_status_change();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Test the trigger (optional - comment out if not needed)
-- 1. First, check if there are any collected items
SELECT id, teller_name, status, win_amount 
FROM "Unclaimed" 
WHERE status IN ('Collected', 'Uncollected')
LIMIT 5;

-- 2. Check corresponding collections
SELECT oc.id, oc.unclaimed_id, oc.teller_name, oc.net
FROM "OverAllCollections" oc
WHERE oc.unclaimed_id IN (
    SELECT id FROM "Unclaimed" WHERE status IN ('Collected', 'Uncollected') LIMIT 5
);

COMMENT ON FUNCTION remove_from_collections_on_status_change() IS 
'Automatically removes entries from OverAllCollections and Reports when an Unclaimed item status is changed back to Unclaimed';

COMMENT ON TRIGGER on_unclaimed_status_reverted ON "Unclaimed" IS 
'Trigger that removes collection records when status changes from Collected/Uncollected to Unclaimed';
