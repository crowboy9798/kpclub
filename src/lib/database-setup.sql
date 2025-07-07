-- Create members table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS members (
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

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_members_name ON members(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_member_no ON members(member_no);
CREATE INDEX IF NOT EXISTS idx_members_2025 ON members(member_2025);
CREATE INDEX IF NOT EXISTS idx_members_2024 ON members(member_2024);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admin access)
CREATE POLICY "Enable read access for authenticated users" ON members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON members
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON members
  FOR DELETE USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_members_updated_at 
  BEFORE UPDATE ON members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data from your spreadsheet
INSERT INTO members (
  first_name, last_name, member_2025, member_2024, member_no, dob, mobile, joined, email, address, suburb, pcode, nok, nok_name, nok_contact
) VALUES 
  ('SUE', 'CARTER', 'NO', 'YES', '290043810002', '1965-04-24', '0400264917', '2024-02-12', NULL, '23 MAESBURY STREET', 'KENSINGTON', '5068', 'Husband', 'David Carter', '0434 600 182'),
  ('ANNE', 'HARRINGTON', 'NO', 'YES', '290043810003', '1942-04-25', '0419250442', '2024-02-12', NULL, 'PO BOX 240', 'BURNSIDE', '5066', 'Daughter', NULL, '0416 276 921'),
  ('JULIE', 'MAITLAND', 'NO', 'YES', '290043810004', '1954-12-21', '0421851959', '2024-02-12', NULL, 'SOMERSET PLACE', 'NORWOOD', '5067', 'Daughter', 'Jillian Maitland', '0421 972 533'),
  ('CHRISTINE', 'JARMAN', 'YES', 'YES', '290043810005', '1956-07-16', '0411138011', '2024-02-12', 'cjarman@bigpond.net.au', 'UNIT 8/2 HACKETT TCE', 'MARRYATVILLE', '5068', 'Aunty', 'Marion Bele', '0437 128 365'),
  ('CAROL', 'WEST', 'YES', 'YES', '290043810006', '1957-06-17', '0413670016', '2024-02-12', 'carolann669@gmail.com', '2 QUONDONG AVENUE', 'KENSINGTON GDNS', '5068', 'Daughter', 'Kylie West', '0416 101 703')
-- Add more members as needed...
ON CONFLICT (member_no) DO NOTHING;