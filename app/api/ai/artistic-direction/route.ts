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

    // According to official HF docs, the correct router endpoint for chat completions is:
    // https://router.huggingface.co/v1/chat/completions
    const response = await fetch(
      'https://router.huggingface.co/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.2-3B-Instruct",
          messages: [
            {
              role: "system",
              content: "You are an artistic director. Give poetic but precise artistic direction (3-5 sentences) based on spatial concept scores. Reference top concepts."
            },
            {
              role: "user",
              content: `Spatial concepts detected: ${classificationText}. Provide artistic direction for an architectural installation.`
            }
          ],
          max_tokens: 300,
          temperature: 0.7,
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `HF Router Error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || 'No response generated.';
    return NextResponse.json({ generated_text: resultText });
  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
