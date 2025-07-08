-- Create members table for club management
CREATE TABLE public.members (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  member_2025 TEXT CHECK (member_2025 IN ('YES', 'NO', 'LTL')) DEFAULT 'NO',
  member_2024 TEXT CHECK (member_2024 IN ('YES', 'NO', 'LTL')) DEFAULT 'NO',
  member_no TEXT UNIQUE NOT NULL,
  dob DATE,
  mobile TEXT,
  joined DATE NOT NULL DEFAULT CURRENT_DATE,
  email TEXT,
  address TEXT,
  suburb TEXT,
  pcode TEXT,
  nok TEXT,
  nok_name TEXT,
  nok_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance on searches
CREATE INDEX idx_members_member_no ON public.members(member_no);
CREATE INDEX idx_members_name ON public.members(last_name, first_name);
CREATE INDEX idx_members_email ON public.members(email);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON public.members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();