-- Quick fix: Create raamiabichou@gmail.com as healthcare provider
-- Run this in your Supabase SQL Editor

INSERT INTO users (
  auth0_id,
  email,
  name,
  role,
  created_at,
  updated_at
) VALUES (
  'auth0|68d8269e16b8ac0e91bc4dbc',
  'raamiabichou@gmail.com',
  'Dr. Raami Abichou',
  'doctor',
  NOW(),
  NOW()
) ON CONFLICT (auth0_id) DO UPDATE SET
  email = 'raamiabichou@gmail.com',
  name = 'Dr. Raami Abichou',
  role = 'doctor',
  updated_at = NOW();

-- Verify the user was created
SELECT id, auth0_id, email, name, role, created_at 
FROM users 
WHERE auth0_id = 'auth0|68d8269e16b8ac0e91bc4dbc';

-- Also check by email to make sure no duplicates
SELECT id, auth0_id, email, name, role 
FROM users 
WHERE email = 'raamiabichou@gmail.com';
