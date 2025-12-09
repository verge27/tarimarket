-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation participants table (supports both auth types)
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  private_key_user_id UUID REFERENCES public.private_key_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT one_user_type CHECK (
    (user_id IS NOT NULL AND private_key_user_id IS NULL) OR
    (user_id IS NULL AND private_key_user_id IS NOT NULL)
  )
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_private_key_user_id UUID REFERENCES public.private_key_users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT one_sender_type CHECK (
    (sender_user_id IS NOT NULL AND sender_private_key_user_id IS NULL) OR
    (sender_user_id IS NULL AND sender_private_key_user_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is participant
CREATE OR REPLACE FUNCTION public.is_conversation_participant(
  _conversation_id UUID,
  _user_id UUID DEFAULT NULL,
  _private_key_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conversation_id
    AND (
      (user_id = _user_id AND _user_id IS NOT NULL) OR
      (private_key_user_id = _private_key_user_id AND _private_key_user_id IS NOT NULL)
    )
  )
$$;

-- RLS policies for conversations
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = id
    AND (cp.user_id = auth.uid() OR cp.private_key_user_id IS NOT NULL)
  )
);

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for conversation_participants
CREATE POLICY "Users can view participants of their conversations"
ON public.conversation_participants FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp2
    WHERE cp2.conversation_id = conversation_id
    AND cp2.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can add participants"
ON public.conversation_participants FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for messages
CREATE POLICY "Participants can view messages"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_id
    AND (cp.user_id = auth.uid() OR cp.private_key_user_id IS NOT NULL)
  )
);

CREATE POLICY "Participants can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  (sender_user_id = auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can mark messages as read"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_id
    AND cp.user_id = auth.uid()
  )
);

-- Trigger to update conversation updated_at
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;