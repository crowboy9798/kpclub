-- Drop ALL existing policies on events table to start fresh
DROP POLICY IF EXISTS "Allow anyone to delete events" ON public.events;
DROP POLICY IF EXISTS "Allow anyone to insert events" ON public.events;
DROP POLICY IF EXISTS "Allow anyone to update events" ON public.events;
DROP POLICY IF EXISTS "Allow anyone to view events" ON public.events;
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Only authenticated users can delete events" ON public.events;
DROP POLICY IF EXISTS "Only authenticated users can insert events" ON public.events;
DROP POLICY IF EXISTS "Only authenticated users can update events" ON public.events;

-- Create proper RLS policies for events

-- Anyone can view events (for public events page)
CREATE POLICY "Anyone can view events"
ON public.events
FOR SELECT
USING (true);

-- Only admin and committee can insert events
CREATE POLICY "Admin and committee can insert events"
ON public.events
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'committee'::app_role));

-- Only admin and committee can update events
CREATE POLICY "Admin and committee can update events"
ON public.events
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'committee'::app_role));

-- Only admin and committee can delete events
CREATE POLICY "Admin and committee can delete events"
ON public.events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'committee'::app_role));