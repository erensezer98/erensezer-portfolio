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

    const response = await fetch(
      'https://router.huggingface.co/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.3-70B-Instruct", // Top tier model, widely supported on router
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
          max_tokens: 350,
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `HF Router Error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    
    // Robust extraction: Check OpenAI format first, then fallback to HF array format
    let resultText = '';
    if (data.choices && data.choices[0] && data.choices[0].message) {
      resultText = data.choices[0].message.content;
    } else if (Array.isArray(data) && data[0] && data[0].generated_text) {
      resultText = data[0].generated_text;
    } else if (data.generated_text) {
      resultText = data.generated_text;
    }

    return NextResponse.json({ generated_text: resultText || 'No response generated from the model.' });
  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
