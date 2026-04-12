import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { classificationText, imageBase64 } = await request.json();

    if (!classificationText) {
      return NextResponse.json({ error: 'Missing classification data' }, { status: 400 });
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
          model: "Qwen/Qwen2-VL-7B-Instruct",
          messages: [
            {
              role: "system",
              content: "You are a friendly architecture tutor giving literal, non-abstract advice to a student. Avoid poetic jargon. Use simple words like 'join', 'smooth', 'brighten', 'open up'."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Concepts: ${classificationText}. Weight your advice by these %. Give 3-5 simple sentences. For the top concept, tell the designer one literal physical change to make. Look at the image context.`
                },
                {
                  type: "image_url",
                  image_url: { url: imageBase64 }
                }
              ]
            }
          ],
          max_tokens: 300
        })
      }
    );

    if (!response.ok) {
      return await textOnlyFallback(classificationText, apiKey);
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || 'No response generated.';
    return NextResponse.json({ generated_text: resultText });

  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function textOnlyFallback(classificationText: string, apiKey: string) {
  const response = await fetch(
    'https://router.huggingface.co/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct",
        messages: [
          {
            role: "system",
            content: "You are a friendly architecture tutor giving literal, non-abstract advice to a student. Use basic English. No jargon like 'cohesion' or 'narrative'."
          },
          {
            role: "user",
            content: `Scores: ${classificationText}. 
            
            Based strictly on these weights, give 3-4 simple sentences of advice. For the highest score, tell the designer one LITERAL thing to do (e.g. 'add more windows', 'make the walls thicker', 'join the two boxes').`
          }
        ],
        max_tokens: 250
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    return NextResponse.json({ error: `AI Error (Text Fallback): ${errText}` }, { status: response.status });
  }

  const data = await response.json();
  const resultText = data.choices?.[0]?.message?.content || 'No response generated.';
  return NextResponse.json({ generated_text: resultText + "\n\n(Note: Vision was unavailable, advice based on scores only.)" });
}
