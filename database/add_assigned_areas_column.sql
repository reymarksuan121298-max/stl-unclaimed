-- Run this in your Supabase SQL Editor
-- This adds the necessary column to support multiple area assignments for collectors.

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS assigned_areas JSONB DEFAULT '[]'::jsonb;

-- Optional: If you want to migrate existing single-area data into the new assigned_areas field
-- UPDATE users 
-- SET assigned_areas = jsonb_build_array(municipality)
-- WHERE municipality IS NOT NULL AND (assigned_areas IS NULL OR assigned_areas = '[]'::jsonb);
