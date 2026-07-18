import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // The SDK expects contents to be an array of { role: 'user' | 'model', parts: [{ text: '...' }, { inlineData: ... }] }
    const contents = messages.map((msg: any) => {
      const parts: any[] = [{ text: msg.content }];
      if (msg.file && msg.file.data) {
        // Strip the data url prefix (e.g., data:image/png;base64,)
        const base64Data = msg.file.data.split(',')[1];
        if (base64Data) {
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: msg.file.mimeType
            }
          });
        }
      }
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts
      };
    });

    // Prepend a system instruction to guide the tutor's behavior
    const systemInstruction = {
      role: 'user',
      parts: [{ text: 'System Instruction: You are an expert AI Study Tutor inside a study room application. Your goal is to help the user understand complex topics, debug code, or answer questions concisely. Keep your answers brief and focused. Do not give away direct answers immediately if you can guide them to think about it, but be helpful and friendly.' }]
    };

    const finalContents = [systemInstruction, ...contents];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: finalContents,
    });

    const reply = response.text;

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: error.message || 'Error generating response' }, { status: 500 });
  }
}
