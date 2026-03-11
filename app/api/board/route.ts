import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

// Initialize Groq client
const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

export const runtime = 'nodejs';

interface BoardResponse {
  investor: string;
  growth_hacker: string;
  lawyer: string;
  verdict: string;
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
      const mockResponse: BoardResponse = {
        investor: "Bu fikirle paranızı çöpe atıyorsunuz. Pazar çoktan doymuş ve ROI 5 yıldan önce gelmez. Exit stratejiniz tam bir hayal ürünü.",
        growth_hacker: "SEO ve ücretli reklamlar yetmez, viral bir 'referral' döngüsü kurmalısınız. Influencer marketing ve TikTok challenges ile CAC düşürülebilir.",
        lawyer: "Kullanıcı verilerini işlerken KVKK ve GDPR uyumluluğu kritik. Ayrıca fikri mülkiyet hakları konusunda rakiplerden dava yeme riskiniz var.",
        verdict: "Riskli ama doğru ekiple pivot edilirse yatırım yapılabilir."
      };
      return NextResponse.json(mockResponse);
    }

    const systemPrompt = `Sen 3 farklı kişiden oluşan acımasız bir yönetim kurulunun beynisin. 1. Acımasız Melek Yatırımcı (ROI, pazar büyüklüğü, exit stratejisi ve neden batacağı odaklı). 2. Agresif Growth Hacker (Müşteri edinme kanalları, viral döngü ve pazarlama hileleri odaklı). 3. Paranoyak Şirket Avukatı (KVKK, regülasyon, tazminat riskleri ve fikri mülkiyet odaklı). İş fikrini bu 3 farklı ağızdan eleştir. SADECE aşağıdaki JSON formatında yanıt ver.

REQUIRED JSON STRUCTURE:
{
  "investor": "Yatırımcı ağzıyla 3 cümlelik sert eleştiri ve ROI beklentisi.",
  "growth_hacker": "Growth hacker ağzıyla 3 cümlelik pazarlama taktiği.",
  "lawyer": "Avukat ağzıyla 3 cümlelik hukuki risk analizi.",
  "verdict": "Kurulun oybirliğiyle aldığı nihai karar (Örn: Riskli ama yatırım yapılabilir)."
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

    let analysis: BoardResponse;
    try {
      analysis = JSON.parse(responseText) as BoardResponse;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Response:', responseText);
      throw new Error('Failed to parse AI response as JSON');
    }

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('Board API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}