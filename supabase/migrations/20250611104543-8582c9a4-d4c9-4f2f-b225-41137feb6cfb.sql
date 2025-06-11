
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Super admin can delete any artwork" ON public.artwork;
DROP POLICY IF EXISTS "Super admin can view all artwork" ON public.artwork;
DROP POLICY IF EXISTS "Users can view their own artwork" ON public.artwork;
DROP POLICY IF EXISTS "Users can create their own artwork" ON public.artwork;
DROP POLICY IF EXISTS "Users can update their own artwork" ON public.artwork;
DROP POLICY IF EXISTS "Users can delete their own artwork" ON public.artwork;
DROP POLICY IF EXISTS "Anyone can view published artwork" ON public.artwork;

-- Enable RLS on artwork table if not already enabled
ALTER TABLE public.artwork ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows super admin to delete any artwork
CREATE POLICY "Super admin can delete any artwork" 
ON public.artwork 
FOR DELETE 
TO authenticated 
USING (is_super_admin());

-- Create a policy that allows super admin to select any artwork
CREATE POLICY "Super admin can view all artwork" 
ON public.artwork 
FOR SELECT 
TO authenticated 
USING (is_super_admin());

-- Create a policy for regular users to select their own artwork
CREATE POLICY "Users can view their own artwork" 
ON public.artwork 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Create a policy for regular users to insert their own artwork
CREATE POLICY "Users can create their own artwork" 
ON public.artwork 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Create a policy for regular users to update their own artwork
CREATE POLICY "Users can update their own artwork" 
ON public.artwork 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a policy for regular users to delete their own artwork
CREATE POLICY "Users can delete their own artwork" 
ON public.artwork 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow public (non-authenticated) users to view published artwork
CREATE POLICY "Anyone can view published artwork" 
ON public.artwork 
FOR SELECT 
TO public 
USING (published = true);
