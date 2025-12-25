-- Migration: Add collector and area columns to Pending view
-- Date: 2025-12-28
-- Description: Updates the Pending view to include collector and area columns
--              This allows filtering pending items by collector, which is needed
--              for the collector role to see only their assigned pending items.

-- Drop the existing view first to avoid column order conflicts
DROP VIEW IF EXISTS "Pending";

-- Recreate the Pending view with additional columns
CREATE VIEW "Pending" AS
SELECT 
    id,
    teller_name,
    bet_number,
    draw_date,
    return_date,
    win_amount,
    franchise_name,
    collector,
    area,
    EXTRACT(DAY FROM (NOW() - draw_date::timestamp))::integer AS days_overdue
FROM "Unclaimed"
WHERE status = 'Unclaimed'
AND (NOW() - draw_date::timestamp) > INTERVAL '3 days';
