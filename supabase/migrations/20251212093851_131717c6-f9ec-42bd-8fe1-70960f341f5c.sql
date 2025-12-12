-- Fix broken RLS policies on conversations, messages, and conversation_participants

-- 1. Fix conversations SELECT policy
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations" 
ON public.conversations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversations.id
    AND (
      cp.user_id = auth.uid() 
      OR cp.private_key_user_id IS NOT NULL
    )
  )
);

-- 2. Fix conversation_participants SELECT policy
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;

CREATE POLICY "Users can view participants of their conversations" 
ON public.conversation_participants 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR public.is_conversation_participant(conversation_id, auth.uid(), NULL)
);

-- 3. Fix messages SELECT policy
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;

CREATE POLICY "Participants can view messages" 
ON public.messages 
FOR SELECT 
USING (
  public.is_conversation_participant(conversation_id, auth.uid(), NULL)
);

-- 4. Fix messages INSERT policy
DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;

CREATE POLICY "Participants can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  sender_user_id = auth.uid() 
  AND public.is_conversation_participant(conversation_id, auth.uid(), NULL)
);

-- 5. Fix messages UPDATE policy
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;

CREATE POLICY "Users can mark messages as read" 
ON public.messages 
FOR UPDATE 
USING (
  public.is_conversation_participant(conversation_id, auth.uid(), NULL)
);

-- 6. Create public view for private_key_users that hides sensitive fields
DROP VIEW IF EXISTS public.public_private_key_users;

CREATE VIEW public.public_private_key_users 
WITH (security_invoker = true)
AS
SELECT 
  id,
  display_name,
  public_key,
  pgp_public_key,
  reputation_score,
  total_trades,
  created_at,
  updated_at
FROM public.private_key_users;

-- Grant SELECT permissions
GRANT SELECT ON public.public_private_key_users TO authenticated;
GRANT SELECT ON public.public_private_key_users TO anon;