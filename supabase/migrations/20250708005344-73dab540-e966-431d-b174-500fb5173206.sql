-- Enable Row Level Security on members table
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access for this demo
-- Note: In production, you should restrict these policies based on authentication
CREATE POLICY "Allow public read access to members" ON public.members
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to members" ON public.members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to members" ON public.members
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to members" ON public.members
  FOR DELETE USING (true);