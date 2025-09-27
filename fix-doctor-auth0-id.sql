-- Fix the doctor user to work properly with Auth0
-- Run this in your Supabase SQL Editor

-- Step 1: Delete the manual user (the system will auto-create with proper Auth0 ID)
DELETE FROM users WHERE email = 'raamiabichou@gmail.com';

-- Step 2: Check what users exist now
SELECT id, auth0_id, email, name, role FROM users;

-- After running this SQL:
-- 1. Log out of your account completely
-- 2. Log back in with raamiabichou@gmail.com 
-- 3. The system will auto-create you as a doctor with proper Auth0 ID
-- 4. You'll immediately see the Provider Console!
