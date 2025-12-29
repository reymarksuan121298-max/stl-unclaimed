-- Backfill receiver_contact for existing cash deposits
-- This is optional - only run if you want to add account numbers to old deposits

-- Option 1: Set a default account number for all existing deposits without one
-- UPDATE "Unclaimed"
-- SET receiver_contact = 'Legacy Deposit - No Account Number'
-- WHERE cash_deposited = true 
--   AND (receiver_contact IS NULL OR receiver_contact = '');

-- Option 2: Manually update specific deposits with their account numbers
-- Example:
-- UPDATE "Unclaimed"
-- SET receiver_contact = '1234567890'
-- WHERE id = 123 AND cash_deposited = true;

-- Verify the update
SELECT 
    id,
    teller_name,
    bank_name,
    receiver_contact,
    deposit_reference,
    deposit_date,
    cash_deposited
FROM "Unclaimed"
WHERE cash_deposited = true
ORDER BY deposit_date DESC
LIMIT 20;

-- Note: New deposits will automatically have receiver_contact saved
-- This script is only needed if you want to update old deposits
