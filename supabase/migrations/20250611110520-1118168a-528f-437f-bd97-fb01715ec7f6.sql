
-- Update the check constraint to allow 'threejs' type
ALTER TABLE public.artwork 
DROP CONSTRAINT artwork_type_check;

ALTER TABLE public.artwork 
ADD CONSTRAINT artwork_type_check 
CHECK (type IN ('image', 'text', 'threejs'));
