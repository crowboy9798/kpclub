-- Drop existing permissive policies for insert, update, delete
DROP POLICY IF EXISTS "Anyone can insert events" ON public.events;
DROP POLICY IF EXISTS "Anyone can update events" ON public.events;
DROP POLICY IF EXISTS "Anyone can delete events" ON public.events;

-- Create admin-only policies for insert, update, delete
-- Note: These policies assume proper authentication is implemented
-- For now, we'll restrict to authenticated users as a basic security measure

CREATE POLICY "Only authenticated users can insert events" 
ON public.events 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update events" 
ON public.events 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Only authenticated users can delete events" 
ON public.events 
FOR DELETE 
TO authenticated
USING (true);