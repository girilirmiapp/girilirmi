import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

// Initialize Groq client
const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

export const runtime = 'nodejs';

interface FinanceResponse {
  initial_investment: string;
  monthly_burn_rate: string;
  estimated_cac: string;
  break_even_months: string;
  year_1_revenue: string;
  profit_margin: string;
  financial_summary: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. "prompt" is required and must be a string.' },
        { status: 400 }
      );
    }

    if (!groq) {
      console.warn('GROQ_API_KEY is not set. Returning mock response for testing.');
      const mockResponse: FinanceResponse = {
        initial_investment: "250.000 TL",
        monthly_burn_rate: "40.000 TL",
        estimated_cac: "150 TL",
        break_even_months: "8 Ay",
        year_1_revenue: "1.200.000 TL",
        profit_margin: "%35",
        financial_summary: "Yüksek başlangıç maliyeti riskli olsa da, SaaS modeli sayesinde 8. aydan sonra nakit akışı pozitife dönüyor. Pazarlama bütçesi kritik."
      };
      return NextResponse.json(mockResponse);
    }

    const systemPrompt = `Sen acımasız ve gerçekçi bir CFO'sun (Finans Direktörü). Verilen iş fikrinin Türkiye veya global pazar şartlarında ilk 1 yıllık finansal projeksiyonunu çıkaracaksın. Rakamlar son derece gerçekçi, muhafazakar ve mantıklı olmalı. SADECE JSON formatında yanıt ver, markdown kullanma.

REQUIRED JSON STRUCTURE:
{
  "initial_investment": "Başlangıç Sermayesi (Örn: 250.000 TL)",
  "monthly_burn_rate": "Aylık Gider/Yakım Hızı (Örn: 40.000 TL)",
  "estimated_cac": "Müşteri Edinme Maliyeti (Örn: 150 TL)",
  "break_even_months": "Başabaş Noktası (Örn: 8 Ay)",
  "year_1_revenue": "1. Yıl Tahmini Ciro (Örn: 1.200.000 TL)",
  "profit_margin": "Tahmini Kar Marjı (Örn: %35)",
  "financial_summary": "Finansal riskleri anlatan 2 cümlelik acımasız CFO özeti."
}`;
    
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analiz edilecek fikir: "${prompt}"` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Groq returned empty content');
    }

    let analysis: FinanceResponse;
    try {
      analysis = JSON.parse(responseText) as FinanceResponse;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Response:', responseText);
      throw new Error('Failed to parse AI response as JSON');
    }

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('Finance API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}