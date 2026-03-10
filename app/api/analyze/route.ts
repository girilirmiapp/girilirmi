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
  case_study: string;
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
        survival_plan: "1. İlk 30 günde: Sadece landing page yapıp reklam ver. 2. Ön sipariş almaya çalış. 3. Eğer 100+ talep gelmezse fikri öldür.",
        detailed_analysis: "Fikir, doymuş bir pazarda farklılaşma sunmuyor. (MOCK RESPONSE: Groq API Key eksik)",
        market_saturation: "Yüksek",
        local_competitor_radar: "Bölgenizde benzer hizmet veren 15+ işletme tespit edildi.",
        case_study: "Benzer bir girişim olan 'Quibi', pazar fitini doğrulamadan 1.7 milyar dolar harcadı ve 6 ayda battı. Kısa video formatını yanlış platformda denediler."
      };
      return NextResponse.json(mockResponse);
    }

    const systemPrompt = `Sen top %1 seviyesinde, acimasiz bir yatirim analistisin. Verilen fikri analiz ederken SADECE bu formati kullan ve raw JSON dondur: 
1. verdict: GİRİLİR veya GİRİLMEZ. 
2. risk_score: 1-10 arasi. 
3. market_saturation: Yüksek/Orta/Düşük. 
4. detailed_analysis: Fikrin zayifliklarini ve pazar dinamiklerini acimasizca yaz. 
5. opportunity_cost: Nakit ve zaman israfini somut rakamlarla belirt. 
6. case_study (YENI): Bu sektorde ve benzer lokasyonlarda (veya globalde) yapilmis gercek/emsal bir basarisizlik veya basari hikayesini ornek ver (Ornek: "X sirketi ayni hatayi yapip 6 ayda batti cunku..."). 
7. survival_plan (GUNCELLENDI): Jenerik laflar etme. Kurucuya "Ilk 30 gunde yapilmasi gereken 3 taktiksel adim" seklinde milimetrik bir yol haritasi ver. 
8. local_competitor_radar: Rakiplerin neyi yanlis yaptigini veya hangi avantaja sahip oldugunu analiz et.

Aşağıdaki JSON formatında yanıt ver:
{
  "verdict": "GİRİLİR" veya "GİRİLMEZ",
  "risk_score": sayı (1-10),
  "opportunity_cost": "string",
  "survival_plan": "string",
  "detailed_analysis": "string",
  "market_saturation": "Yüksek" | "Orta" | "Düşük",
  "local_competitor_radar": "string",
  "case_study": "string"
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
