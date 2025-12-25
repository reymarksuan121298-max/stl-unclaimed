-- Migration: Add bet_amount column to Unclaimed and OverAllCollections tables
-- Date: 2025-12-25
-- Description: Adds bet_amount field to store the original bet amount

-- Add bet_amount column to Unclaimed table
ALTER TABLE "Unclaimed" 
ADD COLUMN IF NOT EXISTS bet_amount NUMERIC(15, 2) NOT NULL DEFAULT 0;

-- Add bet_amount column to OverAllCollections table
ALTER TABLE "OverAllCollections" 
ADD COLUMN IF NOT EXISTS bet_amount NUMERIC(15, 2) NOT NULL DEFAULT 0;

-- Add area column to OverAllCollections table if it doesn't exist
ALTER TABLE "OverAllCollections" 
ADD COLUMN IF NOT EXISTS area TEXT;

-- Update the trigger function to include bet_amount and area
CREATE OR REPLACE FUNCTION handle_unclaimed_collection()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM 'Collected' AND NEW.status = 'Collected') THEN
        -- Insert into OverAllCollections
        INSERT INTO "OverAllCollections" (
            unclaimed_id, teller_name, bet_number, draw_date, 
            return_date, bet_amount, amount, charge_amount, net, 
            collector, franchise_name, area, receipt_image, mode, payment_type
        ) VALUES (
            NEW.id, NEW.teller_name, NEW.bet_number, NEW.draw_date,
            COALESCE(NEW.return_date, NOW()), COALESCE(NEW.bet_amount, 0), NEW.win_amount, 
            COALESCE(NEW.charge_amount, 0), NEW.net,
            COALESCE(NEW.collector, 'System'),
            NEW.franchise_name,
            NEW.area,
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

-- Note: The trigger already exists, so we just updated the function
-- If you need to recreate the trigger, uncomment the following:
-- DROP TRIGGER IF EXISTS on_unclaimed_collected ON "Unclaimed";
-- CREATE TRIGGER on_unclaimed_collected
--     AFTER UPDATE ON "Unclaimed"
--     FOR EACH ROW
--     WHEN (OLD.status IS DISTINCT FROM NEW.status)
--     EXECUTE FUNCTION handle_unclaimed_collection();
