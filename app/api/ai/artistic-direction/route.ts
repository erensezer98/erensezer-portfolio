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

    // STEP 1: Attempt image description with multiple fallbacks
    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1];
      
      // Attempt 1: PaliGemma (Modern, High Availability)
      try {
        const pgResponse = await fetch(
            'https://router.huggingface.co/models/google/paligemma-3b-pt-224',
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputs: base64Data })
            }
        );
        if (pgResponse.ok) {
            const pgData = await pgResponse.json();
            imageDescription = Array.isArray(pgData) ? (pgData[0].generated_text || pgData[0]) : pgData.generated_text;
        }
      } catch {
        console.warn('PaliGemma failed');
      }

      // Attempt 2: BLIP Fallback (Classic Stability)
      if (!imageDescription) {
        try {
          const blipResponse = await fetch(
              'https://router.huggingface.co/models/Salesforce/blip-image-captioning-large',
              {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ inputs: base64Data })
              }
          );
          if (blipResponse.ok) {
              const blipData = await blipResponse.json();
              imageDescription = Array.isArray(blipData) ? blipData[0].generated_text : blipData.generated_text;
          }
        } catch {
          console.warn('BLIP fallback failed');
        }
      }
    }

    // STEP 2: Llama Synthesizer
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
              content: `You are a professional architectural tutor in a generative design workshop. 
              You MUST explicitly reference the top-scoring concepts from the classification and their specific percentages in your response (e.g., "At 85% Flow, your form suggests...").
              Translate these abstract scores into ONE specific physical or structural piece of advice.
              Keep the response to 3-4 concise, inspiring sentences.`
            },
            {
              role: "user",
              content: `The spatial analysis scores are: ${classificationText}.
              ${imageDescription ? `The visual content shows: ${imageDescription}.` : 'Visual analysis is pending.'}
              
              Task: Provide artistic direction. Speak directly to the designer. Ensure you use the exact names of the high-scoring concepts.`
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
    
    return NextResponse.json({ generated_text: resultText + (imageDescription ? "" : "\n\n(Note: Image analysis was limited, advice based on scores.)") });

  } catch (error: unknown) {
    console.error('AI Proxy Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
