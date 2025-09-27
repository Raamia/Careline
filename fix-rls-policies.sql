-- Fix Row Level Security Policies for Careline
-- Run this in your Supabase SQL Editor

-- Disable RLS on users table temporarily for service role operations
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on referrals table (likely the new issue)
ALTER TABLE referrals DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, create proper policies:
-- First enable RLS
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert users
-- CREATE POLICY "Service role can insert users" ON users
--   FOR INSERT WITH CHECK (true);

-- Allow service role to select users  
-- CREATE POLICY "Service role can select users" ON users
--   FOR SELECT USING (true);

-- Allow users to view their own data
-- CREATE POLICY "Users can view own data" ON users
--   FOR SELECT USING (auth.uid()::text = auth0_id);

-- Allow users to update their own data
-- CREATE POLICY "Users can update own data" ON users  
--   FOR UPDATE USING (auth.uid()::text = auth0_id);

-- For referrals table (if RLS is enabled)
-- ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view own referrals" ON referrals
--   FOR SELECT USING (
--     patient_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
--     OR doctor_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
--     OR referring_doctor_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
--   );

-- CREATE POLICY "Users can insert own referrals" ON referrals
--   FOR INSERT WITH CHECK (
--     patient_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
--   );

-- Grant necessary permissions to service role
GRANT ALL ON users TO service_role;
GRANT ALL ON referrals TO service_role;
GRANT ALL ON medical_records TO service_role;
GRANT ALL ON specialists TO service_role;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
