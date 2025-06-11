
-- Make image_url nullable since text artwork won't have images
ALTER TABLE public.artwork 
ALTER COLUMN image_url DROP NOT NULL;

-- Set image_url to null for any existing text artwork
UPDATE public.artwork 
SET image_url = NULL 
WHERE type = 'text';
