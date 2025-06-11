
-- Add type column to artwork table
ALTER TABLE public.artwork 
ADD COLUMN type TEXT NOT NULL DEFAULT 'image';

-- Add a check constraint to ensure only valid types are allowed
ALTER TABLE public.artwork 
ADD CONSTRAINT artwork_type_check 
CHECK (type IN ('image', 'text'));

-- Add content column to store type-specific data as JSONB
ALTER TABLE public.artwork 
ADD COLUMN content JSONB;

-- Update existing records to have proper type and content
UPDATE public.artwork 
SET type = 'image', 
    content = jsonb_build_object('image_url', image_url)
WHERE type = 'image';
