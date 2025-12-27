-- Quick Fix: Update Reports table with total_charges from Unclaimed
-- Run this in Supabase SQL Editor

-- Step 1: Add the column if it doesn't exist
ALTER TABLE public."Reports" 
ADD COLUMN IF NOT EXISTS total_charges NUMERIC(15, 2) NOT NULL DEFAULT 0;

-- Step 2: Update all existing reports with charge amounts from Unclaimed table
UPDATE public."Reports" r
SET total_charges = COALESCE(u.charge_amount, 0)
FROM public."Unclaimed" u
WHERE r.unclaimed_id = u.id;

-- Step 3: Verify the update
SELECT 
    r.id,
    r.teller_name,
    r.amount,
    r.total_charges,
    u.charge_amount as unclaimed_charge
FROM public."Reports" r
LEFT JOIN public."Unclaimed" u ON r.unclaimed_id = u.id
ORDER BY r.id DESC
LIMIT 10;
