-- Fix critical security vulnerability: Remove public access to sensitive member data
-- and implement proper authentication-based RLS policies

-- First, drop the existing public access policies
DROP POLICY IF EXISTS "Allow public read access to KPC2" ON "KPC2";
DROP POLICY IF EXISTS "Allow public insert to KPC2" ON "KPC2";
DROP POLICY IF EXISTS "Allow public update to KPC2" ON "KPC2";
DROP POLICY IF EXISTS "Allow public delete from KPC2" ON "KPC2";

-- Create secure RLS policies that require authentication
-- Only authenticated users can read member data
CREATE POLICY "Authenticated users can view members" ON "KPC2"
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Only authenticated users can insert member data
CREATE POLICY "Authenticated users can insert members" ON "KPC2"
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can update member data
CREATE POLICY "Authenticated users can update members" ON "KPC2"
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can delete member data
CREATE POLICY "Authenticated users can delete members" ON "KPC2"
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);