import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const runtime = 'nodejs';

// Interface for the expected response structure
interface AnalysisResponse {
  verdict: "GİRİLİR" | "GİRİLMEZ";
  risk_score: number; // 1-10
  opportunity_cost: string;
  survival_plan: string;
  detailed_analysis: string;
  market_saturation: "Yüksek" | "Orta" | "Düşük";
  local_competitor_radar: string;
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
    if (!genAI) {
      console.warn('GEMINI_API_KEY is not set. Returning mock response for testing.');
      const mockResponse: AnalysisResponse = {
        verdict: "GİRİLMEZ",
        risk_score: 8,
        opportunity_cost: "Bu proje ile harcayacağın 6 ayda, mevcut yeteneklerinle freelance çalışarak $20k kazanabilirsin. Bu proje ise muhtemelen $0 getirecek.",
        survival_plan: "Fikri tamamen değiştir. B2C yerine B2B bir mikro-SaaS'a odaklan. Pazarlama bütçesi olmadan bu işe girme.",
        detailed_analysis: "Fikir, doymuş bir pazarda farklılaşma sunmuyor. (MOCK RESPONSE: Gemini API Key eksik)",
        market_saturation: "Yüksek",
        local_competitor_radar: "Bölgenizde benzer hizmet veren 15+ işletme tespit edildi."
      };
      return NextResponse.json(mockResponse);
    }

    // Switch to 'gemini-pro' (Gemini 1.0) for universal access
    // REMOVED generationConfig with responseMimeType: "application/json" as it's not supported in Gemini 1.0
    const model = genAI.getGenerativeModel({
      model: "gemini-pro", 
    });

    const systemPrompt = `Sen top %1 seviyesinde, acımasız ve stratejik bir iş/yatırım analistisin. Kullanıcının metninde lokasyon varsa pazar doygunluğunu da analiz et. Kibar olma. Fikrin açığını ve fırsat maliyetini bul.

    Aşağıdaki JSON formatında yanıt ver:
    {
      "verdict": "GİRİLİR" veya "GİRİLMEZ",
      "risk_score": sayı (1-10),
      "opportunity_cost": "string",
      "survival_plan": "string",
      "detailed_analysis": "string",
      "market_saturation": "Yüksek" | "Orta" | "Düşük",
      "local_competitor_radar": "string"
    }
    
    CRITICAL: You MUST output ONLY valid JSON. Do not use markdown, do not use \`\`\`json backticks. Return purely the raw JSON object.`;
    
    const prompt = `${systemPrompt}\n\nAnaliz edilecek fikir: "${text}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error('Gemini returned empty content');
    }

    // Clean up responseText in case the model adds backticks despite instructions
    const cleanedResponseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    let analysis: AnalysisResponse;
    try {
      analysis = JSON.parse(cleanedResponseText) as AnalysisResponse;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Response:', responseText);
      throw new Error('Failed to parse AI response as JSON');
    }

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('Analysis API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
