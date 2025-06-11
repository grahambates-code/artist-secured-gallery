
-- Remove the image_url column since we'll store everything in the content JSON field
ALTER TABLE public.artwork DROP COLUMN image_url;

-- Clear existing artworks to start fresh with the new schema
DELETE FROM public.artwork;

-- Update the content structure examples:
-- For image artwork: {"image_url": "https://..."}
-- For text artwork: {"text": "content here"}
