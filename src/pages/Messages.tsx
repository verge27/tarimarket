import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { usePrivateKeyAuth } from '@/hooks/usePrivateKeyAuth';
import { useMessages, useConversation } from '@/hooks/useMessages';

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { privateKeyUser } = usePrivateKeyAuth();
  const { conversations, loading: convLoading, isAuthenticated } = useMessages();
  const { messages, loading: msgLoading, sendMessage, currentUserId } = useConversation(conversationId);

  const activeConversation = conversationId 
    ? conversations.find(c => c.id === conversationId)
    : conversations[0];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Redirect to first conversation if none selected
  useEffect(() => {
    if (!conversationId && conversations.length > 0) {
      navigate(`/messages/${conversations[0].id}`, { replace: true });
    }
  }, [conversationId, conversations, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Sign in to view messages</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to send and receive messages.
          </p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!messageText.trim() || !activeConversation || sending) return;
    
    setSending(true);
    const success = await sendMessage(messageText);
    setSending(false);
    
    if (success) {
      setMessageText('');
    } else {
      toast.error('Failed to send message');
    }
  };

  const getOtherParticipant = (participants: typeof activeConversation.participants) => {
    const other = participants.find(p => 
      p.user_id !== user?.id && 
      p.private_key_user_id !== privateKeyUser?.id
    );
    return other?.profile?.display_name || other?.pk_user?.display_name || 'Unknown';
  };

  const getSenderName = (msg: typeof messages[0]) => {
    return msg.sender_profile?.display_name || msg.sender_pk_user?.display_name || 'Unknown';
  };

  const isSentByMe = (msg: typeof messages[0]) => {
    if (user && msg.sender_user_id === user.id) return true;
    if (privateKeyUser && msg.sender_private_key_user_id === privateKeyUser.id) return true;
    return false;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Messages</h1>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Conversation List */}
          <Card className="lg:col-span-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-y-auto h-full">
                {convLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map(conv => {
                    const otherName = getOtherParticipant(conv.participants);
                    const isActive = conv.id === activeConversation?.id;

                    return (
                      <Link
                        key={conv.id}
                        to={`/messages/${conv.id}`}
                        className={`flex gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                          isActive ? 'bg-muted' : ''
                        }`}
                      >
                        <Avatar>
                          <AvatarFallback>{otherName[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold truncate">{otherName}</span>
                            {conv.unread_count > 0 && (
                              <Badge variant="default" className="ml-2">{conv.unread_count}</Badge>
                            )}
                          </div>
                          {conv.listing && (
                            <p className="text-xs text-muted-foreground truncate mb-1">
                              Re: {conv.listing.title}
                            </p>
                          )}
                          {conv.last_message && (
                            <>
                              <p className="text-sm text-muted-foreground truncate">
                                {conv.last_message.content}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                              </p>
                            </>
                          )}
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="p-12 text-center">
                    <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No conversations yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start a conversation by contacting a seller on a listing.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Conversation */}
          <Card className="lg:col-span-2 overflow-hidden flex flex-col">
            {activeConversation ? (
              <>
                {/* Header */}
                <div className="border-b border-border p-4 flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getOtherParticipant(activeConversation.participants)[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="font-semibold">
                      {getOtherParticipant(activeConversation.participants)}
                    </h2>
                    {activeConversation.listing && (
                      <Link 
                        to={`/listing/${activeConversation.listing_id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {activeConversation.listing.title}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {msgLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map(msg => {
                      const isSent = isSentByMe(msg);
                      return (
                        <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-lg p-3 ${
                            isSent 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            {!isSent && (
                              <p className="text-xs font-medium mb-1">{getSenderName(msg)}</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>No messages yet. Send the first message!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      disabled={sending}
                    />
                    <Button onClick={handleSend} disabled={!messageText.trim() || sending}>
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {conversations.length > 0 
                      ? 'Select a conversation to start messaging'
                      : 'No conversations yet'
                    }
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
