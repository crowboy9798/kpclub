-- Create members table to match CSV data structure
CREATE TABLE IF NOT EXISTS public.members (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  member_2025 VARCHAR(5) DEFAULT 'NO' CHECK (member_2025 IN ('YES', 'NO', 'LTL')),
  member_2024 VARCHAR(5) DEFAULT 'NO' CHECK (member_2024 IN ('YES', 'NO', 'LTL')),
  member_no VARCHAR(20) UNIQUE,
  dob DATE,
  mobile VARCHAR(20),
  joined DATE DEFAULT CURRENT_DATE,
  email VARCHAR(255),
  address TEXT,
  suburb VARCHAR(100),
  pcode VARCHAR(10),
  nok VARCHAR(50), -- Next of Kin relationship
  nok_name VARCHAR(100), -- Next of Kin name
  nok_contact VARCHAR(20), -- Next of Kin contact
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_name ON public.members(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_member_no ON public.members(member_no);
CREATE INDEX IF NOT EXISTS idx_members_2025 ON public.members(member_2025);
CREATE INDEX IF NOT EXISTS idx_members_2024 ON public.members(member_2024);

-- Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Enable read access for all users" ON public.members
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.members
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.members
  FOR DELETE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_members_updated_at 
  BEFORE UPDATE ON public.members 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();