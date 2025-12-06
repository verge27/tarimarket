-- Revert: Make user_id nullable again for anonymous swaps
ALTER TABLE public.swap_history ALTER COLUMN user_id DROP NOT NULL;

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Authenticated users can create swap records" ON public.swap_history;

-- Re-create INSERT policy allowing anonymous swaps
CREATE POLICY "Users can create swap records"
ON public.swap_history
FOR INSERT
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

-- Create a security definer function to look up swaps by trade_id
-- This allows anonymous users to view their swap if they know the trade_id
CREATE OR REPLACE FUNCTION public.get_swap_by_trade_id(p_trade_id text)
RETURNS SETOF swap_history
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM swap_history WHERE trade_id = p_trade_id LIMIT 1;
$$;