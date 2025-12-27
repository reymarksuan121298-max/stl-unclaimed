-- Migration: Add reference_number column to Unclaimed table
-- Date: 2025-12-27
-- Description: Adds reference_number field to store transaction references for non-cash payments

-- Add reference_number column to Unclaimed table
ALTER TABLE public."Unclaimed" 
ADD COLUMN IF NOT EXISTS reference_number TEXT;

-- Add comment
COMMENT ON COLUMN public."Unclaimed".reference_number IS 'Transaction reference number for GCash, Bank Transfer, etc.';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Unclaimed' 
AND column_name = 'reference_number';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ reference_number column added to Unclaimed table!';
    RAISE NOTICE '✅ You can now save reference numbers for non-cash transactions';
END $$;
