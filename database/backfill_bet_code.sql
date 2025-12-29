-- Backfill bet_code from Unclaimed to OverAllCollections
-- This updates existing collection records with their bet codes

UPDATE "OverAllCollections" oc
SET bet_code = u.bet_code
FROM "Unclaimed" u
WHERE oc.unclaimed_id = u.id
  AND u.bet_code IS NOT NULL
  AND (oc.bet_code IS NULL OR oc.bet_code = '');

-- Verify the update
SELECT 
    oc.id,
    oc.teller_name,
    oc.bet_number,
    oc.bet_code,
    u.bet_code as unclaimed_bet_code
FROM "OverAllCollections" oc
LEFT JOIN "Unclaimed" u ON oc.unclaimed_id = u.id
ORDER BY oc.id DESC
LIMIT 10;
