import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key-for-build',
});

export const runtime = 'nodejs';

// Interface for the expected response structure
interface AnalysisResponse {
  verdict: "GİRİLİR" | "GİRİLMEZ";
  risk_score: number; // 1-10
  opportunity_cost: string;
  survival_plan: string;
  detailed_analysis: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. "text" is required and must be a string.' },
        { status: 400 }
      );
    }

    // Check if API key is actually present for real execution
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY is not set. Returning mock response for testing.');
      const mockResponse: AnalysisResponse = {
        verdict: "GİRİLMEZ",
        risk_score: 8,
        opportunity_cost: "Bu proje ile harcayacağın 6 ayda, mevcut yeteneklerinle freelance çalışarak $20k kazanabilirsin. Bu proje ise muhtemelen $0 getirecek.",
        survival_plan: "Fikri tamamen değiştir. B2C yerine B2B bir mikro-SaaS'a odaklan. Pazarlama bütçesi olmadan bu işe girme.",
        detailed_analysis: "Fikir, doymuş bir pazarda farklılaşma sunmuyor. (MOCK RESPONSE: API Key eksik)"
      };
      return NextResponse.json(mockResponse);
    }

    const systemPrompt = `Sen top %1 seviyesinde, acımasız ve stratejik bir iş/yatırım analistisin. Kibar olma. Fikrin açığını, operasyonel darboğazlarını ve fırsat maliyetini bul. Asla standart ChatGPT gibi konuşma. Eğer fikir zayıfsa, kurucuyu uyar.
    
    Aşağıdaki JSON formatında yanıt ver:
    {
      "verdict": "GİRİLİR" veya "GİRİLMEZ",
      "risk_score": sayı (1-10),
      "opportunity_cost": "string",
      "survival_plan": "string",
      "detailed_analysis": "string"
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error('OpenAI returned empty content');
    }

    const analysis = JSON.parse(content) as AnalysisResponse;

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('Analysis API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
