-- Auto-Sync Fix: Make Reports total_charges update automatically
-- Run this ONCE in Supabase SQL Editor

-- Step 1: Update the sync trigger to handle Uncollected status too
CREATE OR REPLACE FUNCTION public.sync_unclaimed_to_collections()
RETURNS TRIGGER AS $$
BEGIN
    -- Only sync if status is Collected or Uncollected (items in collections)
    IF NEW.status IN ('Collected', 'Uncollected') THEN
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

-- Step 2: Add total_charges column if it doesn't exist
ALTER TABLE public."Reports" 
ADD COLUMN IF NOT EXISTS total_charges NUMERIC(15, 2) NOT NULL DEFAULT 0;

-- Step 3: Populate existing data
UPDATE public."Reports" r
SET total_charges = COALESCE(u.charge_amount, 0)
FROM public."Unclaimed" u
WHERE r.unclaimed_id = u.id;

-- Step 4: Verify
SELECT 
    'Migration Complete!' as status,
    COUNT(*) as total_reports,
    SUM(total_charges) as total_charges_sum
FROM public."Reports";

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Auto-sync enabled!';
    RAISE NOTICE '✅ From now on, charges in Unclaimed will automatically update Reports';
    RAISE NOTICE '✅ No need to run migrations manually anymore!';
END $$;
