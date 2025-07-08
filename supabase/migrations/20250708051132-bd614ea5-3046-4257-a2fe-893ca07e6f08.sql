-- Add missing columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS detailed_content TEXT;