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

    // Using LLaVA 1.5 - A highly compatible vision model that usually works 
    // on the standard Inference API without the 'Provider' restriction.
    const response = await fetch(
      'https://api-inference.huggingface.co/models/llava-hf/llava-1.5-7b-hf',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `[INST] <image>\nYou are an artistic director. Provide clear, simple artistic direction (3-5 sentences) to a designer.
          
Strictly weight your advice based on these scores: ${classificationText}.

The image above is the context. Use it to make your advice tangible. 
Use simple terms and speak directly to the designer. Do not use bullet points. [/INST]`,
          parameters: {
            max_new_tokens: 300,
          },
          // Some HF models expect the image in a specific payload for legacy inference
          image: imageBase64?.split(',')[1] // Just the base64 part
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `HF Vision API Error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    
    // LLaVA typical response is an array with {generated_text: "..."}
    let resultText = '';
    if (Array.isArray(data) && data[0] && data[0].generated_text) {
      resultText = data[0].generated_text;
    } else if (data.generated_text) {
      resultText = data.generated_text;
    }

    // Remove the prompt/instruction from the result if present
    const cleanText = resultText.replace(/\[INST\].*?\[\/INST\]/gs, '').trim();

    return NextResponse.json({ generated_text: cleanText || 'No response generated.' });
  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
