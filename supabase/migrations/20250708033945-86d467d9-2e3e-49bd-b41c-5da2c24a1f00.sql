-- Add RLS policies for INSERT, UPDATE, and DELETE operations on KPC2 table

-- Allow anyone to insert new records
CREATE POLICY "Allow public insert to KPC2" 
ON public."KPC2" 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update existing records
CREATE POLICY "Allow public update to KPC2" 
ON public."KPC2" 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow anyone to delete records
CREATE POLICY "Allow public delete from KPC2" 
ON public."KPC2" 
FOR DELETE 
USING (true);