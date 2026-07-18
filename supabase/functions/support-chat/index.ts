import { createClient } from 'npm:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_MESSAGES = 20;

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: IncomingMessage[];
}

const SYSTEM_PROMPT = `You are the support assistant for "Our Journey," a couples' date-planning app. You help users navigate the app and use its features. Be warm, concise, and action-oriented — tell people exactly where to tap, not vague generalities.

App feature map:
- Dates tab: plan a new date via the + button (stop-by-stop: time, activity, map pin search), or tap an upcoming date to edit it. Stops can be reordered by long-pressing and dragging.
- Map tab: shows the active date's route on a map. Swipe left/right on the floating stop card to move between stops. Tap the stop card to edit the date. Tap the near-me icon on the card to open turn-by-turn directions in Maps.
- Bucket List tab: browse curated date ideas by category, tap the checkmark to mark one done. The "Ask the Concierge" card (tagged Journey+) opens an AI-powered personalized date-idea generator — type what you're in the mood for and it suggests ideas you can save or plan immediately.
- Past Memories: reachable from the menu — a scrapbook of past dates. Tap a past date to open its photo gallery, where you can upload photos, view them full-screen with pinch-to-zoom, and delete ones you added.
- Profile tab: toggle dark mode, change your avatar, and see the Journey+ upsell for premium features.
- Menu (hamburger icon, top-left on most screens): invite your partner via a code, manage reminder/notification preferences, and access Settings and Help & Feedback.
- Settings: manage account and app preferences.
- Help & Feedback: submit bug reports or feature suggestions, email support directly, rate the app, or chat here with you.

If a user asks something unrelated to the app, answer briefly and helpfully but steer back to how you can help with Our Journey. If you don't know the answer to something app-specific, say so honestly rather than inventing steps that don't exist in the app.`;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function sanitizeMessages(raw: unknown): IncomingMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: IncomingMessage[] = [];
  for (const item of raw) {
    if (
      item &&
      (item.role === 'user' || item.role === 'assistant') &&
      typeof item.content === 'string' &&
      item.content.trim().length > 0
    ) {
      out.push({ role: item.role, content: item.content.trim().slice(0, 4000) });
    }
  }
  return out.slice(-MAX_MESSAGES);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (!OPENAI_API_KEY) {
    return json({ error: 'Support chat is not configured. Missing OPENAI_API_KEY.' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing Authorization header.' }, 401);

  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await supabaseUser.auth.getUser();
  if (userError || !userData?.user) return json({ error: 'Unauthorized.' }, 401);

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const messages = sanitizeMessages(body.messages);
  if (messages.length === 0) {
    return json({ error: 'No valid messages provided.' }, 400);
  }

  let openaiRes: Response;
  try {
    openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.6,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      }),
    });
  } catch (err) {
    console.error('OpenAI request failed', err);
    return json({ error: 'Could not reach support right now. Please try again.' }, 502);
  }

  if (openaiRes.status === 429) {
    return json({ error: 'Support is a bit busy right now. Please try again in a moment.' }, 429);
  }
  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    console.error('OpenAI error', openaiRes.status, errText);
    return json({ error: 'Support had trouble responding. Please try again.' }, 502);
  }

  const openaiJson = await openaiRes.json();
  const reply = openaiJson?.choices?.[0]?.message?.content;
  if (!reply || typeof reply !== 'string') {
    return json({ error: 'Empty response from support.' }, 502);
  }

  return json({ reply: reply.trim() });
});
