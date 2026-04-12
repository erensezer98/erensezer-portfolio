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

    // Attempting a Vision request via the Router
    // This uses the confirmed stable router URL
    const response = await fetch(
      'https://router.huggingface.co/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.2-11B-Vision-Instruct",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Artistic director role. Scores: ${classificationText}. Weight advice by these %. Image attached. Simple terms, 3-5 sentences.`
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

    // If Vision fails due to provider issues, fallback to a robust TEXT-ONLY model
    // This ensures the students ALWAYS get a response, even if vision is offline.
    if (!response.ok) {
      console.warn('Vision failed, falling back to text-only artistic direction');
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
        model: "meta-llama/Llama-3.3-70B-Instruct", // Highly available text model
        messages: [
          {
            role: "user",
            content: `You are an artistic director. A designer has a work with these scores: ${classificationText}. 
            
            Give 3-5 clear, simple sentences of direction. Weight your advice strictly by the percentages (e.g. if one is 80%, talk mostly about that). Use simple terms. Speak directly to the designer.`
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
  return NextResponse.json({ generated_text: resultText + " (Note: Vision was unavailable, using scores only.)" });
}
