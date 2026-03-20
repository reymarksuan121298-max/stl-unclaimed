-- Run this in your Supabase SQL Editor
-- This adds the necessary column to support assigning a cashier to a checker.

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS assigned_cashier TEXT DEFAULT '';
