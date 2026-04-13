import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { classificationText, imageBase64 } = await request.json();

    if (!classificationText) {
      return NextResponse.json({ error: 'Missing classification data' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured on server' }, { status: 500 });
    }

    // Prepare Gemini Request parts
    const promptParts: { text?: string; inline_data?: { mime_type: string; data: string } }[] = [
      { text: `The spatial analysis scores are: ${classificationText}. Ensure you use the exact names of the high-scoring concepts.` }
    ];

    // If an image is provided, add it to the prompt parts
    if (imageBase64) {
      const parts = imageBase64.split(';');
      const mimeType = parts[0].split(':')[1];
      const base64Data = parts[1].split(',')[1];
      
      promptParts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data
        }
      });
    }

    // Call Gemini 1.5 Flash API via REST
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: promptParts,
          }],
          system_instruction: {
            parts: [{
              text: `You are a professional architectural tutor in a generative design workshop. 
              You MUST explicitly reference the top-scoring concepts from the classification and their specific percentages in your response (e.g., "At 85% Flow, your form suggests...").
              Translate these abstract scores into ONE specific physical or structural piece of advice.
              If an image is provided, analyze its visual properties to make your advice more concrete and relevant to the design's current state.
              Keep the response to 3-4 concise, inspiring sentences.`
            }]
          },
          generationConfig: {
            maxOutputTokens: 350,
            temperature: 0.7,
          }
        })
      }
    );

    if (!response.ok) {
        const errJson = await response.json();
        const errMsg = errJson.error?.message || 'Gemini synthesis failed';
        return NextResponse.json({ error: errMsg }, { status: response.status });
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    
    return NextResponse.json({ 
        generated_text: resultText + (imageBase64 ? "" : "\n\n(Note: No image provided, advice based strictly on scores.)") 
    });

  } catch (error: unknown) {
    console.error('Gemini Proxy Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
