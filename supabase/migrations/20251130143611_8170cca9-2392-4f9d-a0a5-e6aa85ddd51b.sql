-- Drop the overly permissive RLS policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON profiles;

-- Now only the "Users can view own profile" policy remains, which restricts users to their own data
-- This protects XMR addresses from being scraped by any logged-in user