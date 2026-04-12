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

    let imageDescription = "";

    // STEP 1: Get an objective description of the image using a 
    // highly-available natively hosted model (BLIP)
    if (imageBase64) {
      try {
        const blipResponse = await fetch(
            'https://router.huggingface.co/models/Salesforce/blip-image-captioning-large',
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputs: imageBase64.split(',')[1] })
            }
        );
        if (blipResponse.ok) {
            const blipData = await blipResponse.json();
            imageDescription = Array.isArray(blipData) ? blipData[0].generated_text : blipData.generated_text;
            console.log('Image description generated:', imageDescription);
        }
      } catch (e) {
        console.warn('Image captioning failed, proceeding with scores only.');
      }
    }

    // STEP 2: Use the high-availability Llama-3.3-70B text model to synthesize 
    // the scores and the image description into artistic direction.
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
              content: "You are a friendly architecture tutor giving literal, physical, non-abstract advice. Use very simple terms."
            },
            {
              role: "user",
              content: `Concept scores: ${classificationText}.
              ${imageDescription ? `Image description: ${imageDescription}.` : ''}
              
              Give 3-5 simple sentences of advice. 
              RULES:
              1. Weight your advice exactly by the scores (e.g. if one is 80%, talk 80% about that).
              2. For the highest score, tell the designer one LITERAL thing to do (e.g. 'add more glass', 'thicken the walls').
              3. Only reference the image description if it's available.`
            }
          ],
          max_tokens: 350
        })
      }
    );

    if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json({ error: `AI synthesizing failed: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || 'No response generated.';
    
    // Add a more subtle indicator if image analysis worked
    const suffix = imageDescription ? "" : "\n\n(Note: Image analysis was limited, advice based on scores.)";

    return NextResponse.json({ generated_text: resultText + suffix });

  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
