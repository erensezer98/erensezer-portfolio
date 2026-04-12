import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { classificationText } = await request.json();

    if (!classificationText) {
      return NextResponse.json({ error: 'Missing classification text' }, { status: 400 });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI key not configured on server' }, { status: 500 });
    }

    // Modern Chat Completions format (OpenAI compatible) for maximum compatibility with HF Router
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.3",
          messages: [
            {
              role: "system",
              content: "You are an artistic director working on an architectural installation. Give poetic but precise artistic direction to a designer based on spatial concept scores."
            },
            {
              role: "user",
              content: `An AI vision model analysed an image and returned these spatial concept scores:\n\n${classificationText}\n\nBased on these findings, give a short (3–5 sentences) artistic direction note to the designer. Reference the top concepts by name, suggest how the installation should emphasise or balance them, and recommend one tangible design move (material, light, form, or programme). Speak directly to the designer. Do not use bullet points.`
            }
          ],
          max_tokens: 250,
          temperature: 0.7,
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      // If the specific model path fails, try the universal router
      if (response.status === 404) {
         return await tryUniversalRouter(classificationText, apiKey);
      }
      return NextResponse.json({ error: `HF API Error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || 'No response generated.';
    return NextResponse.json({ generated_text: resultText });
  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function tryUniversalRouter(classificationText: string, apiKey: string) {
    const response = await fetch(
      'https://api-inference.huggingface.co/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.3",
          messages: [
            { role: "user", content: `Artistic direction for these concepts: ${classificationText}. Be poetic, 3 sentences.` }
          ],
          max_tokens: 150
        })
      }
    );
    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || 'No response generated.';
    return NextResponse.json({ generated_text: resultText });
}
