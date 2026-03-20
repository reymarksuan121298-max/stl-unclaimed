-- Run this in your Supabase SQL Editor
-- This adds the necessary column to support assigning MULTIPLE cashiers to a checker.

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS assigned_cashiers JSONB DEFAULT '[]'::jsonb;

ALTER TABLE users 
DROP COLUMN IF EXISTS assigned_cashier;
