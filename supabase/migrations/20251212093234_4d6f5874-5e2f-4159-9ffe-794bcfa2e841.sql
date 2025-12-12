-- Fix the SECURITY DEFINER view warning by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  display_name,
  reputation_score,
  total_reviews,
  pgp_public_key,
  created_at
FROM public.profiles;

-- Re-grant SELECT permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;