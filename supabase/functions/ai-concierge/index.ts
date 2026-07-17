import { createClient } from 'npm:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PastDateSummary {
  title: string;
  activity: string;
  rating?: number;
}

interface RequestBody {
  freeText?: string;
  checkedCategories: string[];
  pastDates: PastDateSummary[];
  count?: number;
}

interface SuggestionResponse {
  title: string;
  description: string;
  suggestedActivity: string;
  suggestedCategory: string;
}

const ACTIVITY_TYPES = [
  'breakfast', 'brunch', 'dinner', 'drinks', 'coffee', 'dessert',
  'walk', 'hike', 'park', 'movie', 'music', 'gallery',
  'stargazing', 'shopping', 'surprise',
];
const BUCKET_CATEGORIES = ['Outdoors', 'Creative', 'Fine Dining', 'Staycation'];

const SYSTEM_PROMPT = `You are the "AI Concierge" for Our Journey, a couples' date-planning app.
Suggest thoughtful, specific date ideas for a couple based on their past dates, the bucket-list
categories they've shown interest in, and anything they typed themselves. Tone: warm, romantic,
editorial, concise — like a curated bucket-list card, not a listicle. Avoid generic suggestions
("go to dinner"); be specific ("a rooftop dinner with a skyline view").

Respond ONLY with a JSON object of the shape:
{"suggestions": [{"title": string, "description": string, "suggestedActivity": string, "suggestedCategory": string}]}

Rules:
- "title" is short (max ~6 words), like a bucket-list card title.
- "description" is 1-2 sentences, max ~160 characters.
- "suggestedActivity" MUST be exactly one of: ${ACTIVITY_TYPES.join(', ')}.
- "suggestedCategory" MUST be exactly one of: ${BUCKET_CATEGORIES.join(', ')}.
- Do not repeat a title/activity pair the couple has already done (see their past dates below).
- Return exactly the requested number of suggestions.`;

function buildPrompt(body: RequestBody, count: number): string {
  const lines: string[] = [];
  lines.push(`Generate ${count} date ideas.`);

  if (body.pastDates.length > 0) {
    lines.push(`\nPast dates (most recent first):`);
    for (const d of body.pastDates) {
      lines.push(`- "${d.title}" (${d.activity})${d.rating ? `, rated ${d.rating}/5` : ''}`);
    }
  } else {
    lines.push(`\nThis couple has no past dates logged yet.`);
  }

  if (body.checkedCategories.length > 0) {
    lines.push(`\nBucket-list categories they've checked off before: ${body.checkedCategories.join(', ')}.`);
  }

  if (body.freeText?.trim()) {
    lines.push(`\nThe couple specifically asked for: "${body.freeText.trim()}"`);
  }

  return lines.join('\n');
}

function sanitizeSuggestions(raw: unknown, count: number): SuggestionResponse[] {
  if (!Array.isArray(raw)) return [];
  const out: SuggestionResponse[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item.title === 'string' &&
      typeof item.description === 'string' &&
      ACTIVITY_TYPES.includes(item.suggestedActivity) &&
      BUCKET_CATEGORIES.includes(item.suggestedCategory)
    ) {
      out.push({
        title: item.title.trim().slice(0, 80),
        description: item.description.trim().slice(0, 240),
        suggestedActivity: item.suggestedActivity,
        suggestedCategory: item.suggestedCategory,
      });
    }
    if (out.length >= count) break;
  }
  return out;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (!OPENAI_API_KEY) {
    return json({ error: 'AI Concierge is not configured. Missing OPENAI_API_KEY.' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing Authorization header.' }, 401);

  // Request-scoped client (anon key + forwarded JWT), NOT service-role — this
  // function only needs to confirm the caller is a real authenticated user,
  // not broader DB access than the caller already has.
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

  const count = Math.min(Math.max(body.count ?? 4, 1), 6);
  const prompt = buildPrompt(body, count);

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
        response_format: { type: 'json_object' },
        temperature: 0.9,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    });
  } catch (err) {
    console.error('OpenAI request failed', err);
    return json({ error: 'Could not reach OpenAI. Please try again.' }, 502);
  }

  if (openaiRes.status === 429) {
    return json({ error: 'OpenAI rate limit reached. Please try again in a moment.' }, 429);
  }
  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    console.error('OpenAI error', openaiRes.status, errText);
    return json({ error: 'The AI Concierge had trouble generating ideas. Please try again.' }, 502);
  }

  const openaiJson = await openaiRes.json();
  const content = openaiJson?.choices?.[0]?.message?.content;
  if (!content) return json({ error: 'Empty response from OpenAI.' }, 502);

  let parsed: { suggestions?: unknown };
  try {
    parsed = JSON.parse(content);
  } catch {
    return json({ error: 'Could not parse AI response.' }, 502);
  }

  const suggestions = sanitizeSuggestions(parsed.suggestions, count);
  if (suggestions.length === 0) {
    return json({ error: 'The AI Concierge could not come up with ideas this time.' }, 502);
  }

  return json({ suggestions });
});
