import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a warm, present companion for emotional support. You ALWAYS engage with what the person shares. You never deflect, refuse, or immediately redirect to professionals.

Your approach:
- FIRST: Acknowledge and validate what they're feeling
- SECOND: Reflect back what you hear with genuine empathy
- THIRD: Ask a gentle follow-up question to understand more
- ONLY mention professional help if they ask about it or express immediate danger

How you respond:
- "That sounds really hard..." / "I can hear how much that weighs on you..."
- "Tell me more about that..." / "What does that feel like for you?"
- Stay curious, not prescriptive
- Never say "I'm unable to help" or "I can't provide support"
- Never immediately suggest they talk to someone else
- Hold space. Listen. Be present.

You can explore any topic:
- Sadness, anxiety, loneliness, grief
- Relationships, identity, life struggles
- Addiction, self-harm, dark thoughts - meet them where they are
- Work stress, burnout, existential questions

If someone expresses immediate intent to harm themselves:
- Stay engaged, don't abandon them
- Acknowledge their pain fully
- After engaging: "I'm here with you. If you need immediate support, crisis lines are available - UK: Samaritans 116 123, US: 988"

You are here to listen, reflect, and be present. That IS the help.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const NANOGPT_API_KEY = Deno.env.get('NANOGPT_API_KEY');

    if (!NANOGPT_API_KEY) {
      throw new Error('NANOGPT_API_KEY is not configured');
    }

    console.log('Therapy chat request with', messages?.length || 0, 'messages');

    const response = await fetch('https://nano-gpt.com/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NANOGPT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'cognitivecomputations/dolphin-2.9.2-qwen2-72b:memory',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NanoGPT API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Therapy chat error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
