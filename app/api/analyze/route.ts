import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

// Initialize Groq client
const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

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
    if (!groq) {
      console.warn('GROQ_API_KEY is not set. Returning mock response for testing.');
      const mockResponse: AnalysisResponse = {
        verdict: "GİRİLMEZ",
        risk_score: 8,
        opportunity_cost: "Bu proje ile harcayacağın 6 ayda, mevcut yeteneklerinle freelance çalışarak $20k kazanabilirsin. Bu proje ise muhtemelen $0 getirecek.",
        survival_plan: "Fikri tamamen değiştir. B2C yerine B2B bir mikro-SaaS'a odaklan. Pazarlama bütçesi olmadan bu işe girme.",
        detailed_analysis: "Fikir, doymuş bir pazarda farklılaşma sunmuyor. (MOCK RESPONSE: Groq API Key eksik)",
        market_saturation: "Yüksek",
        local_competitor_radar: "Bölgenizde benzer hizmet veren 15+ işletme tespit edildi."
      };
      return NextResponse.json(mockResponse);
    }

    const systemPrompt = `Sen top %1 seviyesinde, acimasiz, milyarder bir yatirim analistisin. Asla teselli verme. Asla "modern tasarim bir avantajdir" gibi amatorce seyler soyleme. Tasarim karin doyurmaz, pazar doyurur! Kurucuyu tokatla. Firsat maliyeti kismina "Bu 1.5 Milyon TL ve 6 ay ile X yapabilirdin, 0 TL kazanacaksin" gibi somut finansal gercekler yaz. Hayatta kalma planina jenerik laflar yazma; "Kodu cope at, WhatsApp grubu kurarak basla" gibi aci/gercekci taktikler ver. Eger fikir operasyonel bir intiharsa GİRİLMEZ de. SADECE raw JSON dondur. Markdown kullanma.
    
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
    
    IMPORTANT: Return raw JSON only. No markdown. No explanations.`;
    
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analiz edilecek fikir: "${text}"` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Groq returned empty content');
    }

    let analysis: AnalysisResponse;
    try {
      analysis = JSON.parse(responseText) as AnalysisResponse;
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
