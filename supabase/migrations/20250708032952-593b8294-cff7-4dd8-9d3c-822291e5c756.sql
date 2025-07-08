-- Enable Row Level Security on KPC2 table and allow public read access
ALTER TABLE public."KPC2" ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to read from KPC2 table
CREATE POLICY "Allow public read access to KPC2" 
ON public."KPC2" 
FOR SELECT 
USING (true);