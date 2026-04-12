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

    // Vision-capable model messages structure
    const messages: any[] = [
      {
        role: "system",
        content: "You are an artistic director. Your task is to provide clear, simple, and practical artistic direction to a designer. You must weight your advice exactly based on the percentage scores provided. Use simple terms and avoid complex jargon."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `I have analyzed an image and found these concept scores: ${classificationText}. \n\nPlease provide an artistic direction note (3-5 sentences). \n\nIMPORTANT RULES:\n1. Weight your advice strictly by these percentages. If a concept has 80%, 80% of your advice should be about it.\n2. Look at the attached image to give context to your advice.\n3. Use simple, clear language that is easy to understand.\n4. Speak directly to the designer.`
          }
        ]
      }
    ];

    // Add image if provided (in OpenAI vision format supported by HF router)
    if (imageBase64) {
      messages[1].content.push({
        type: "image_url",
        image_url: {
          url: imageBase64 // This is a data:image/... base64 string
        }
      });
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
          model: "meta-llama/Llama-3.2-11B-Vision-Instruct", // Powerful vision-capable model
          messages: messages,
          max_tokens: 400,
          temperature: 0.5, // Lower temperature for more consistent weighting
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `HF Vision API Error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || 'No response generated.';
    
    return NextResponse.json({ generated_text: resultText });
  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
