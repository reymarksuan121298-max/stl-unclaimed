-- Migration: Add Receipt Upload Feature to Existing Database
-- Run this ONLY if you have an existing database
-- For new databases, just run supabase_schema.sql

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: Add new columns to Unclaimed table
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE "Unclaimed" ADD COLUMN IF NOT EXISTS charge_amount NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE "Unclaimed" ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'Cash';
ALTER TABLE "Unclaimed" ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'Full Payment';
ALTER TABLE "Unclaimed" ADD COLUMN IF NOT EXISTS receipt_image TEXT;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: Add new columns to OverAllCollections table
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE "OverAllCollections" ADD COLUMN IF NOT EXISTS mode TEXT;
ALTER TABLE "OverAllCollections" ADD COLUMN IF NOT EXISTS payment_type TEXT;
ALTER TABLE "OverAllCollections" ADD COLUMN IF NOT EXISTS receipt_image TEXT;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: Update the trigger function
-- ═══════════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS on_unclaimed_collected ON "Unclaimed";

CREATE OR REPLACE FUNCTION handle_unclaimed_collection()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM 'Collected' AND NEW.status = 'Collected') THEN
        -- Insert into OverAllCollections
        INSERT INTO "OverAllCollections" (
            unclaimed_id, teller_name, bet_number, draw_date, 
            return_date, amount, charge_amount, net, 
            collector, franchise_name, receipt_image, mode, payment_type
        ) VALUES (
            NEW.id, NEW.teller_name, NEW.bet_number, NEW.draw_date,
            COALESCE(NEW.return_date, NOW()), NEW.win_amount, 
            COALESCE(NEW.charge_amount, 0), NEW.net,
            COALESCE(NEW.collector, 'System'),
            NEW.franchise_name,
            NEW.receipt_image,
            COALESCE(NEW.mode, 'Cash'),
            COALESCE(NEW.payment_type, 'Full Payment')
        );

        -- Insert into Reports
        INSERT INTO "Reports" (
            unclaimed_id, teller_name, amount, collector, area,
            staff_amount, collector_amount, agent_amount, admin_amount
        ) VALUES (
            NEW.id, NEW.teller_name, NEW.win_amount, COALESCE(NEW.collector, 'System'), NEW.area,
            NEW.win_amount * 0.10, -- 10% Staff
            NEW.win_amount * 0.10, -- 10% Collector
            NEW.win_amount * 0.30, -- 30% Agent
            NEW.win_amount * 0.50  -- 50% Admin
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_unclaimed_collected
    AFTER UPDATE ON "Unclaimed"
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION handle_unclaimed_collection();

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4: Backfill existing collections (OPTIONAL)
-- ═══════════════════════════════════════════════════════════════════════════

-- This will copy mode, payment_type, and receipt_image from Unclaimed to 
-- existing OverAllCollections records

UPDATE "OverAllCollections" oc
SET 
    mode = COALESCE(oc.mode, u.mode, 'Cash'),
    payment_type = COALESCE(oc.payment_type, u.payment_type, 'Full Payment'),
    receipt_image = COALESCE(oc.receipt_image, u.receipt_image)
FROM "Unclaimed" u
WHERE oc.unclaimed_id = u.id;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

-- Check Unclaimed table columns
SELECT 'Unclaimed Table' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'Unclaimed' 
AND column_name IN ('charge_amount', 'mode', 'payment_type', 'receipt_image')
ORDER BY column_name;

-- Check OverAllCollections table columns
SELECT 'OverAllCollections Table' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'OverAllCollections' 
AND column_name IN ('mode', 'payment_type', 'receipt_image')
ORDER BY column_name;

-- Check trigger
SELECT 'Trigger' as object_type, trigger_name, event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_unclaimed_collected';
