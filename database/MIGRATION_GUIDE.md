# Database Migration Guide

## Adding bet_amount Column

This migration adds the `bet_amount` column to track the original bet amount in both the `Unclaimed` and `OverAllCollections` tables.

### For New Installations

If you're setting up the database for the first time, simply run the main schema file:

```sql
-- Run this in Supabase SQL Editor
-- File: database/supabase_schema.sql
```

The schema already includes the `bet_amount` column.

### For Existing Installations

If you already have a deployed database, run the migration file to add the new column:

```sql
-- Run this in Supabase SQL Editor
-- File: database/migration_add_bet_amount.sql
```

This migration will:
1. Add `bet_amount NUMERIC(15, 2)` column to `Unclaimed` table
2. Add `bet_amount NUMERIC(15, 2)` column to `OverAllCollections` table
3. Add `area TEXT` column to `OverAllCollections` table (if not exists)
4. Update the trigger function to copy `bet_amount` and `area` when items are collected

### Steps to Apply Migration

1. Log in to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `database/migration_add_bet_amount.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the migration
6. Verify the columns were added by checking the table structure

### Verification

After running the migration, verify the changes:

```sql
-- Check Unclaimed table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Unclaimed'
ORDER BY ordinal_position;

-- Check OverAllCollections table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'OverAllCollections'
ORDER BY ordinal_position;
```

### Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove bet_amount column from Unclaimed
ALTER TABLE "Unclaimed" DROP COLUMN IF EXISTS bet_amount;

-- Remove bet_amount column from OverAllCollections
ALTER TABLE "OverAllCollections" DROP COLUMN IF EXISTS bet_amount;

-- Restore the old trigger function (without bet_amount and area)
CREATE OR REPLACE FUNCTION handle_unclaimed_collection()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM 'Collected' AND NEW.status = 'Collected') THEN
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

        INSERT INTO "Reports" (
            unclaimed_id, teller_name, amount, collector, area,
            staff_amount, collector_amount, agent_amount, admin_amount
        ) VALUES (
            NEW.id, NEW.teller_name, NEW.win_amount, COALESCE(NEW.collector, 'System'), NEW.area,
            NEW.win_amount * 0.10,
            NEW.win_amount * 0.10,
            NEW.win_amount * 0.30,
            NEW.win_amount * 0.50
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Frontend Changes

The frontend has been updated to:
- **Unclaimed Page**: Removed "Net" column, added "Bet Amount" column after "Return Timestamp"
- **Collections Page**: Added "Bet Amount" column after "Return Timestamp" (kept "Net" column)
- Both pages now include a "Bet Amount" input field in their forms

## Notes

- The `bet_amount` field is required and defaults to 0
- Existing records will have `bet_amount` set to 0 by default
- You may want to update existing records with appropriate bet amounts if needed
