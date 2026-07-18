import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notes } = body;

    if (!notes || typeof notes !== 'string') {
      return NextResponse.json({ error: 'Valid notes text is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert Study Session Summarizer.
Analyze the following study notes and generate a highly structured summary.

Raw Notes:
${notes}

Extract and format the information exactly matching this JSON structure:
{
  "topics": ["topic 1", "topic 2"],
  "key_concepts": ["concept 1 explained briefly", "concept 2 explained briefly"],
  "weak_areas": ["any questions or doubts mentioned in the notes", "areas to review"],
  "revision_notes": "A concise paragraph summarizing the core takeaways."
}
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        }
    });

    // Parse the JSON returned by the model
    const summaryText = response.text;
    let summaryJson;
    try {
        summaryJson = JSON.parse(summaryText || "{}");
    } catch (e) {
        console.error("Failed to parse Gemini output as JSON", summaryText);
        summaryJson = { error: "Failed to generate structured summary." };
    }

    return NextResponse.json({ summary: summaryJson });
  } catch (error: any) {
    console.error('AI Summarize Error:', error);
    return NextResponse.json({ error: error.message || 'Error generating summary' }, { status: 500 });
  }
}
