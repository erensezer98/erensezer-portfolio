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

    const prompt = `<s>[INST] You are an artistic director working on an architectural installation. An AI vision model analysed an image and returned these spatial concept scores:

${classificationText}

Based on these findings, give a short (3–5 sentences) artistic direction note to the designer. Reference the top concepts by name, suggest how the installation should emphasise or balance them, and recommend one tangible design move (material, light, form, or programme). Be poetic but precise. Speak directly to the designer. Do not use bullet points. [/INST]`;

    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 220,
            temperature: 0.72,
            top_p: 0.92,
            do_sample: true,
            return_full_text: false,
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `HF API Error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
