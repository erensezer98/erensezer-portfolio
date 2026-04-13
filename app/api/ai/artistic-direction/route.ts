import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an architectural artistic director suggesting a physical installation to the inside of the given image's space.
Structure your response exactly as follows:
1. One sentence commenting on what you see in the space.
2. For each of the top three prominent concept words provided, spend exactly one sentence describing a specific physical installation idea that embodies that word.
3. One sentence that sums up all the installation ideas, describing how the final design should look like.

Constraints: Only suggest physical, always-visible installations (sculptures, structures, suspended objects, surfaces, materials). No lighting, projection, screens, or electronics. Be direct and specific, never poetic.`;

// ── GEMINI (primary — vision capable) ────────────────────────────────
const GEMINI_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

async function tryGemini(base64Data: string | null, scores: string, geminiKey: string): Promise<string> {
  const userPrompt = `Concept scores: ${scores}

Follow the exact instructions: (1) one sentence commenting on what you see in the image, (2) three sentences (one for each of the top 3 words) describing installation ideas, (3) one summary sentence on the final design layout.`;

  for (const model of GEMINI_MODELS) {
    const parts: object[] = [];
    if (base64Data) parts.push({ inline_data: { mime_type: 'image/jpeg', data: base64Data } });
    parts.push({ text: userPrompt });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts }],
          generationConfig: { maxOutputTokens: 400, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
      if (text) {
        console.log(`[artistic-direction] Gemini (${model}) → ok`);
        return text;
      }
    }
    const err = await res.text();
    console.warn(`[artistic-direction] Gemini (${model}) → ${res.status}: ${err.slice(0, 120)}`);
  }
  throw new Error('All Gemini models failed');
}

// ── LLAMA FALLBACK (scores only, no vision) ───────────────────────────
async function tryLlama(scores: string, hfKey: string): Promise<string> {
  const prompt = `Concept scores: ${scores}

Follow the exact instructions: (1) one sentence commenting on what you see in the image (or general space type based on concepts), (2) three sentences (one for each of the top 3 words) describing installation ideas, (3) one summary sentence on the final design layout.`;

  const res = await fetch('https://router.huggingface.co/novita/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${hfKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`Llama ${res.status}: ${(await res.text()).slice(0, 100)}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

// ── HANDLER ───────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { classificationText, imageBase64 } = await request.json();
    if (!classificationText) {
      return NextResponse.json({ error: 'Missing classification data' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const hfKey     = process.env.HUGGINGFACE_API_KEY;

    // Extract raw base64 from data URL (e.g. "data:image/jpeg;base64,/9j/...")
    let base64Data: string | null = null;
    if (imageBase64 && typeof imageBase64 === 'string') {
      const comma = imageBase64.indexOf(',');
      base64Data = comma !== -1 ? imageBase64.slice(comma + 1) : imageBase64;
    }

    let resultText = '';
    let usedVision = false;

    // 1. Try Gemini (with vision if image present)
    if (geminiKey) {
      try {
        resultText = await tryGemini(base64Data, classificationText, geminiKey);
        usedVision = !!base64Data;
      } catch (e) {
        console.warn('[artistic-direction] Gemini failed, falling back to Llama:', e);
      }
    }

    // 2. Llama fallback (scores only)
    if (!resultText && hfKey) {
      try {
        console.log('[artistic-direction] falling back to Llama');
        resultText = await tryLlama(classificationText, hfKey);
      } catch (e) {
        console.warn('[artistic-direction] Llama fallback failed:', e);
      }
    }

    if (!resultText) {
      return NextResponse.json({ error: 'All AI models failed to respond' }, { status: 503 });
    }

    const note = (base64Data && !usedVision)
      ? '\n\n⚠️ Image could not be analysed right now — try again in 60 seconds for direction based on your actual space.'
      : '';

    return NextResponse.json({ generated_text: resultText + note });

  } catch (error: unknown) {
    console.error('[artistic-direction] Unhandled error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
