-- ============================================================================
-- MIGRATION: Fix Cashier Workflow
-- Date: 2026-01-03
-- Description: 
--   - Cashiers mark items as "Uncollected" (pending verification)
--   - Only "Collected" status (admin/specialist approved) syncs to Collections
--   - Prevents premature insertion into OverAllCollections and Reports tables
-- ============================================================================

-- 1. Update handle_unclaimed_collection function
-- Only trigger for 'Collected' status, not 'Uncollected'
CREATE OR REPLACE FUNCTION public.handle_unclaimed_collection()
RETURNS TRIGGER AS $$
BEGIN
    -- Trigger ONLY when status changes to 'Collected' (admin/specialist approval)
    -- Cashier's 'Uncollected' status does NOT trigger this, keeping items in Unclaimed until verified
    IF (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'Collected') THEN
        -- Check if record already exists in OverAllCollections
        IF NOT EXISTS (SELECT 1 FROM public."OverAllCollections" WHERE unclaimed_id = NEW.id) THEN
            -- Insert into OverAllCollections
            INSERT INTO public."OverAllCollections" (
                unclaimed_id, teller_name, bet_number, bet_code, draw_date, 
                return_date, bet_amount, amount, charge_amount, net, 
                collector, franchise_name, area, receipt_image, mode, payment_type,
                reference_number, receiver_contact, created_by,
                cash_deposited, deposit_date, deposit_amount, deposit_receipt,
                cashier_name, bank_name, deposit_reference
            ) VALUES (
                NEW.id, NEW.teller_name, NEW.bet_number, NEW.bet_code, NEW.draw_date,
                COALESCE(NEW.return_date, NOW()), COALESCE(NEW.bet_amount, 0), NEW.win_amount, 
                COALESCE(NEW.charge_amount, 0), NEW.net,
                COALESCE(NEW.collector, 'System'),
                NEW.franchise_name,
                NEW.area,
                COALESCE(NEW.receipt_image, NEW.deposit_receipt),
                COALESCE(NEW.mode, 'Cash'),
                COALESCE(NEW.payment_type, 'Full Payment'),
                NEW.reference_number,
                NEW.receiver_contact,
                NEW.created_by,
                NEW.cash_deposited, NEW.deposit_date, NEW.deposit_amount, NEW.deposit_receipt,
                NEW.cashier_name, NEW.bank_name, NEW.deposit_reference
            );
        END IF;

        -- Check if record already exists in Reports
        IF NOT EXISTS (SELECT 1 FROM public."Reports" WHERE unclaimed_id = NEW.id) THEN
            -- Insert into Reports
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

COMMENT ON FUNCTION handle_unclaimed_collection() IS 'Handles ONLY Collected status (admin/specialist approved). Uncollected (cashier marked) does NOT sync to Collections.';

-- 2. Update sync_unclaimed_to_collections function
-- Only sync when status is 'Collected'
CREATE OR REPLACE FUNCTION public.sync_unclaimed_to_collections()
RETURNS TRIGGER AS $$
BEGIN
    -- Only sync if status is Collected (admin/specialist approved)
    -- Uncollected items (cashier marked) are NOT synced to Collections
    IF NEW.status = 'Collected' THEN
        -- Update OverAllCollections
        UPDATE public."OverAllCollections"
        SET 
            teller_name = NEW.teller_name,
            bet_number = NEW.bet_number,
            bet_code = NEW.bet_code,
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
            reference_number = NEW.reference_number,
            receiver_contact = NEW.receiver_contact,
            created_by = NEW.created_by,
            cash_deposited = NEW.cash_deposited,
            deposit_date = NEW.deposit_date,
            deposit_amount = NEW.deposit_amount,
            deposit_receipt = NEW.deposit_receipt,
            cashier_name = NEW.cashier_name,
            bank_name = NEW.bank_name,
            deposit_reference = NEW.deposit_reference
        WHERE unclaimed_id = NEW.id;
        
        -- Update Reports (also update when charge_amount changes)
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

COMMENT ON FUNCTION sync_unclaimed_to_collections() IS 'Syncs updates from Unclaimed to OverAllCollections and Reports ONLY for Collected status';

-- 3. Clean up any Uncollected items that were incorrectly synced to Collections
-- This removes entries that should not have been created
DELETE FROM public."OverAllCollections"
WHERE unclaimed_id IN (
    SELECT id FROM public."Unclaimed" WHERE status = 'Uncollected'
);

DELETE FROM public."Reports"
WHERE unclaimed_id IN (
    SELECT id FROM public."Unclaimed" WHERE status = 'Uncollected'
);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Cashier Workflow Migration Completed Successfully';
    RAISE NOTICE '   - Uncollected items (cashier marked) will NOT sync to Collections';
    RAISE NOTICE '   - Only Collected items (admin/specialist approved) sync to Collections';
    RAISE NOTICE '   - Cleaned up incorrectly synced Uncollected items';
END $$;
