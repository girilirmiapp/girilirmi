import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

// Initialize Groq client
const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

export const runtime = 'nodejs';

// Interface for the expected response structure
interface AnalysisResponse {
  verdict: string;
  risk_score: number;
  opportunity_cost: string;
  survival_plan: string;
  detailed_analysis: string;
  // Optional fields for the Tier 2 deep dive:
  board_opinions?: {
    investor: string;
    growth_hacker: string;
    lawyer: string;
  };
  financials?: {
    estimated_cac: string;
    break_even_months: string;
    year_1_revenue: string;
  };
  market_saturation?: string;
  local_competitor_radar?: string;
  case_study?: string;
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

    const systemPrompt = `Sen üst düzey bir stratejistsin. Cevapların ÇOK DETAYLI, UZUN ve KAPSAMLI olmalı. Her analizi en az 2-3 paragraf ve vurucu maddeler (bullet points) halinde yaz. Kurumsal, agresif ve son derece profesyonel bir dil kullan. Asla kısa kesme.
    
    Çıktın SADECE aşağıdaki JSON formatında olmalıdır (Markdown yok, açıklama yok):
    
    {
      "board_opinions": {
        "investor": "Agresif melek yatırımcı gözüyle detaylı, uzun ve acımasız eleştiri.",
        "growth_hacker": "Kullanıcı edinme (Acquisition) stratejisi ve viralite potansiyeli hakkında kapsamlı taktikler.",
        "lawyer": "Olası yasal riskler, regülasyon engelleri ve KVKK uyarıları hakkında detaylı analiz."
      },
      "financials": {
        "estimated_cac": "Tahmini Müşteri Edinme Maliyeti (Rakam)",
        "break_even_months": "Başabaş noktası (Ay sayısı)",
        "year_1_revenue": "Gerçekçi 1. yıl ciro tahmini"
      },
      "verdict": "Projeye girilir mi? (Evet/Hayır ve tek cümlelik net karar)"
    }
    
    Eğer girdi bir iş fikri değilse, 'verdict' alanına 'Lütfen geçerli bir iş fikri giriniz' yaz ve diğer alanları boş bırak.`;
    
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
