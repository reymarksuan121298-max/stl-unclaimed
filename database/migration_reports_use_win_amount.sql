-- Migration: Update Reports to use win_amount and add total_charges
-- Date: 2025-12-27
-- Description: 
--   1. Changes the Reports table calculations to use win_amount (total) 
--      instead of net amount for percentage distribution
--   2. Adds total_charges column to track charges

-- ============================================================================
-- STEP 1: Add total_charges column to Reports table
-- ============================================================================

ALTER TABLE public."Reports" 
ADD COLUMN IF NOT EXISTS total_charges NUMERIC(15, 2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN public."Reports".total_charges IS 'Total charges deducted from win amount';

-- ============================================================================
-- STEP 2: Update the trigger functions
-- ============================================================================

-- Update handle_unclaimed_collection function
CREATE OR REPLACE FUNCTION public.handle_unclaimed_collection()
RETURNS TRIGGER AS $$
BEGIN
    -- Trigger when status changes to either 'Uncollected' (cashier) or 'Collected' (admin/specialist)
    IF (OLD.status IS DISTINCT FROM NEW.status AND (NEW.status = 'Collected' OR NEW.status = 'Uncollected')) THEN
        -- Check if record already exists in OverAllCollections
        IF NOT EXISTS (SELECT 1 FROM public."OverAllCollections" WHERE unclaimed_id = NEW.id) THEN
            -- Insert into OverAllCollections
            INSERT INTO public."OverAllCollections" (
                unclaimed_id, teller_name, bet_number, draw_date, 
                return_date, bet_amount, amount, charge_amount, net, 
                collector, franchise_name, area, receipt_image, mode, payment_type,
                cash_deposited, deposit_date, deposit_amount, deposit_receipt,
                cashier_name, bank_name, deposit_reference
            ) VALUES (
                NEW.id, NEW.teller_name, NEW.bet_number, NEW.draw_date,
                COALESCE(NEW.return_date, NOW()), COALESCE(NEW.bet_amount, 0), NEW.win_amount, 
                COALESCE(NEW.charge_amount, 0), NEW.net,
                COALESCE(NEW.collector, 'System'),
                NEW.franchise_name,
                NEW.area,
                COALESCE(NEW.receipt_image, NEW.deposit_receipt),
                COALESCE(NEW.mode, 'Cash'),
                COALESCE(NEW.payment_type, 'Full Payment'),
                NEW.cash_deposited, NEW.deposit_date, NEW.deposit_amount, NEW.deposit_receipt,
                NEW.cashier_name, NEW.bank_name, NEW.deposit_reference
            );
        END IF;

        -- Check if record already exists in Reports
        IF NOT EXISTS (SELECT 1 FROM public."Reports" WHERE unclaimed_id = NEW.id) THEN
            -- Insert into Reports (using win_amount for percentages)
            INSERT INTO public."Reports" (
                unclaimed_id, teller_name, bet_number, draw_date, return_date, 
                franchise_name, amount, collector, area,
                staff_amount, collector_amount, agent_amount, admin_amount, total_charges
            ) VALUES (
                NEW.id, NEW.teller_name, NEW.bet_number, NEW.draw_date, 
                COALESCE(NEW.return_date, NOW()), NEW.franchise_name, NEW.win_amount, 
                COALESCE(NEW.collector, 'System'), NEW.area,
                NEW.win_amount * 0.10, -- 10% Staff
                NEW.win_amount * 0.10, -- 10% Collector
                NEW.win_amount * 0.30, -- 30% Agent
                NEW.win_amount * 0.50, -- 50% Admin
                COALESCE(NEW.charge_amount, 0) -- Total charges
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update sync_unclaimed_to_collections function
CREATE OR REPLACE FUNCTION public.sync_unclaimed_to_collections()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Collected' THEN
        -- Update OverAllCollections
        UPDATE public."OverAllCollections"
        SET 
            teller_name = NEW.teller_name,
            bet_number = NEW.bet_number,
            draw_date = NEW.draw_date,
            return_date = COALESCE(NEW.return_date, NOW()),
            bet_amount = COALESCE(NEW.bet_amount, 0),
            amount = NEW.win_amount,
            charge_amount = COALESCE(NEW.charge_amount, 0),
            net = NEW.net,
            collector = COALESCE(NEW.collector, 'System'),
            franchise_name = NEW.franchise_name,
            area = NEW.area,
            receipt_image = NEW.receipt_image,
            mode = COALESCE(NEW.mode, 'Cash'),
            payment_type = COALESCE(NEW.payment_type, 'Full Payment'),
            cash_deposited = NEW.cash_deposited,
            deposit_date = NEW.deposit_date,
            deposit_amount = NEW.deposit_amount,
            deposit_receipt = NEW.deposit_receipt,
            cashier_name = NEW.cashier_name,
            bank_name = NEW.bank_name,
            deposit_reference = NEW.deposit_reference
        WHERE unclaimed_id = NEW.id;
        
        -- Update Reports (using win_amount for percentages)
        UPDATE public."Reports"
        SET 
            teller_name = NEW.teller_name,
            bet_number = NEW.bet_number,
            draw_date = NEW.draw_date,
            return_date = COALESCE(NEW.return_date, NOW()),
            franchise_name = NEW.franchise_name,
            amount = NEW.win_amount,
            collector = COALESCE(NEW.collector, 'System'),
            area = NEW.area,
            staff_amount = NEW.win_amount * 0.10,
            collector_amount = NEW.win_amount * 0.10,
            agent_amount = NEW.win_amount * 0.30,
            admin_amount = NEW.win_amount * 0.50,
            total_charges = COALESCE(NEW.charge_amount, 0)
        WHERE unclaimed_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- STEP 2: Update existing Reports records to use win_amount
-- ============================================================================

-- Recalculate all existing reports based on win_amount and charge_amount from Unclaimed table
UPDATE public."Reports" r
SET 
    amount = u.win_amount,
    staff_amount = u.win_amount * 0.10,
    collector_amount = u.win_amount * 0.10,
    agent_amount = u.win_amount * 0.30,
    admin_amount = u.win_amount * 0.50,
    total_charges = COALESCE(u.charge_amount, 0)
FROM public."Unclaimed" u
WHERE r.unclaimed_id = u.id;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check a sample of updated records
SELECT 
    r.id,
    r.teller_name,
    u.win_amount as original_win_amount,
    u.charge_amount,
    u.net as net_amount,
    r.amount as report_amount,
    r.staff_amount,
    r.collector_amount,
    r.agent_amount,
    r.admin_amount,
    (r.staff_amount + r.collector_amount + r.agent_amount + r.admin_amount) as total_distributed
FROM public."Reports" r
JOIN public."Unclaimed" u ON r.unclaimed_id = u.id
LIMIT 10;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Reports migration completed successfully!';
    RAISE NOTICE '✅ All percentage calculations now based on win_amount';
    RAISE NOTICE '✅ Example: ₱6,000 win → Staff ₱600, Collector ₱600, Agent ₱1,800, Admin ₱3,000';
END $$;
