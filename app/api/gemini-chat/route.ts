import { NextResponse } from "next/server"
import { GoogleGenAI, Type } from "@google/genai"

// create client - the library will read credentials from environment
const ai = new GoogleGenAI({})

export async function POST(request: Request) {
    const diagnostic_tool = {
        name: 'diagnostic_tool',
        description: `Use this tool to send the results of a diagnostic session to the user.
          The tool should only be called after the assistant has gathered the user's problem, objective, and motivation.
          `,
        parameters: {
            type: Type.OBJECT,
            properties: {

                problem: {
                    type: Type.STRING,
                    description: 'The main issue or challenge the user is facing.',
                },
                objectif: {
                    type: Type.STRING,
                    description: 'The goal the user wants to achieve.',
                },
                motivation: {
                    type: Type.STRING,
                    description: 'The reason or incentive driving the user to reach this goal.',
                }

            },
            required: ['problem', 'objectif', 'motivation'],
        },
    };

    try {
        const body = await request.json()
        const prompt = String(body.prompt ?? "")
        if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 })

        // Use chat API and accept history from the client so the UI can control conversation context.
        const historyFromClient = Array.isArray(body.history) ? body.history : []

        const sdkHistory = historyFromClient.map((m: any) => ({
            // map client roles to SDK roles: 'user' -> 'user', 'assistant' -> 'model'
            role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'model' : m.role,
            parts: [{ text: String(m.content ?? m.text ?? '') }],
        }))

        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: "Your task is to help the user identify their problem, objective, and motivation. " +
                    "Ask the user one by one: first their main problem, then their objective, then their motivation. " +
                    "Don't talk too much. " +
                    "After collecting all three pieces of information, call the diagnostic tool to push the structured results. " +
                    "Do not format text, speak only in plain voice-friendly sentences. " +
                    "Always respond in plain sentences suitable for voice. " +
                    "You read only letters and numbers.",
                tools: [{
                    functionDeclarations: [diagnostic_tool]
                }],
            },
            history: sdkHistory,
        })

        // send the user's prompt as the latest message in the chat
        const response = await chat.sendMessage({ message: prompt })
        // Normalize useful fields for the client
        const text = (response as any).text ?? null
        const thoughtSignature = (response as any).thoughtSignature ?? null
        const nonTextParts = (response as any).nonTextParts ?? null

        let functionCalls = null
        if ((response as any).functionCalls && Array.isArray((response as any).functionCalls) && (response as any).functionCalls.length > 0) {
            functionCalls = (response as any).functionCalls.map((fc: any) => ({ name: fc.name, args: fc.args }))
        } else if ((response as any).agent && (response as any).agent.functionCalls) {
            const fcs = (response as any).agent.functionCalls
            if (Array.isArray(fcs) && fcs.length > 0) {
                functionCalls = fcs.map((fc: any) => ({ name: fc.name, args: fc.args }))
            }
        }

        return NextResponse.json({ text, thoughtSignature, nonTextParts, functionCalls })
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 })
    }
}

export async function generateTasks(diagnostic: string) {
  const prompt = `
Based on the following diagnostic information:
${diagnostic}

Generate 5 daily tasks that help the user achieve their objective. 
Each task should include:
- id (string),
- title (string),
- pillar (one of Health, Mind, Social, Career, Din),
- duration (string, e.g., "30 min"),
- startDate (today's date or tomorrow),
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
                pillar: { type: Type.STRING }, // you can cast as const in TS later
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

  // The response.text should be JSON matching the `tasks` array format
  const text = typeof response.text === "string"
    ? response.text
    : (() => { throw new Error("Empty response.text from AI response"); })();
  const data = JSON.parse(text);
  return data;
}

