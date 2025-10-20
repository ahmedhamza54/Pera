import { NextResponse } from "next/server"
import { GoogleGenAI, Type } from "@google/genai"

// create client - the library will read credentials from environment
const ai = new GoogleGenAI({})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const diagnostic = body?.plan ?? body?.diagnostic ?? body
    const diagString = typeof diagnostic === 'string' ? diagnostic : JSON.stringify(diagnostic, null, 2)

    const prompt = `
Today's date is ${new Date().toISOString().split('T')[0]}.
Based on the following diagnostic information:
${diagString}

Generate 5 daily tasks that help the user achieve their objective. 
Each task should include:
- id (string),
- title (string),
- pillar (one of Health, Mind, Social, Career, Din),
- duration (string, e.g., "30 min"),
- startDate (date need to be spreaded in the range after the current date to 15 day later, in YYYY-MM-DD format),
- completed (false).

Output the result as JSON in this exact format: 
{
  "tasks": [
    { "id": "<string>", "title": "...", "pillar": "...", "duration": "...", "startDate": "...", "completed": false },
    ...
  ]
}
`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  pillar: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN },
                },
                propertyOrdering: ["id", "title", "pillar", "duration", "startDate", "completed"],
              },
            },
          },
        },
      },
    });

    // Try to extract text from response, but be defensive about the shape
    let text = ''
    if (typeof (response as any).text === 'string') {
      text = (response as any).text
    } else if ((response as any).output && Array.isArray((response as any).output)) {
      // attempt to find text content inside output
      const out = (response as any).output[0]
      if (out?.content) {
        const contentItem = out.content.find((c: any) => c?.type === 'output_text' || c?.type === 'text' || typeof c?.text === 'string')
        text = contentItem?.text ?? JSON.stringify(response)
      } else {
        text = JSON.stringify(response)
      }
    } else {
      text = JSON.stringify(response)
    }

    try {
      const data = typeof text === 'string' ? JSON.parse(text) : text
      return NextResponse.json(data)
    } catch (err) {
      // If parse fails, return the raw text so client can inspect
      return NextResponse.json({ raw: text }, { status: 200 })
    }
  } catch (err: any) {
    console.error('Error in /api/gemini-tasks:', err)
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 })
  }
}
