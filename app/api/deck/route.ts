import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

// Initialize Groq client
const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

export const runtime = 'nodejs';

interface DeckResponse {
  slides: {
    title: string;
    content: string;
  }[];
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
      const mockResponse: DeckResponse = {
        slides: [
          { title: "1. Problem", content: "Mevcut çözümler pahalı ve yavaş. Müşteriler verimsizlikten şikayetçi." },
          { title: "2. Çözüm", content: "Yapay zeka destekli otomasyon ile %50 maliyet avantajı ve 10x hız." },
          { title: "3. Pazar Büyüklüğü", content: "Global pazar 2025'te 50 Milyar $ büyüklüğe ulaşacak. TAM: 10B $, SAM: 2B $." },
          { title: "4. İş Modeli", content: "SaaS abonelik modeli. Freemium başlangıç ve Enterprise paketler." },
          { title: "5. Teknoloji", content: "Proprietary NLP motoru ve gerçek zamanlı veri işleme altyapısı." },
          { title: "6. Rekabet Avantajı", content: "İlk giren avantajı ve patentli algoritma. Rakiplerden %30 daha ucuz." },
          { title: "7. Pazarlama Planı", content: "Dijital pazarlama, içerik üretimi ve stratejik partnerlikler." },
          { title: "8. Ekip", content: "Deneyimli kurucular (Ex-Google, Ex-Amazon). 10+ yıl sektör tecrübesi." },
          { title: "9. Finansal Hedefler", content: "18 ayda başabaş noktası. 3. yıl sonunda 5M $ ARR hedefi." },
          { title: "10. Yatırım Talebi", content: "500K $ tohum yatırım. %15 hisse karşılığı. Fonlar Ar-Ge ve pazarlamaya harcanacak." }
        ]
      };
      return NextResponse.json(mockResponse);
    }

    const systemPrompt = `Sen profesyonel bir yatırım danışmanısın. Verilen iş fikri için 10 slaytlık bir Pitch Deck içeriği hazırlayacaksın. Slayt başlıkları: 1. Problem, 2. Çözüm, 3. Pazar Büyüklüğü, 4. İş Modeli, 5. Teknoloji, 6. Rekabet Avantajı, 7. Pazarlama Planı, 8. Ekip, 9. Finansal Hedefler, 10. Yatırım Talebi. Her slayt için kısa, vurucu ve ikna edici maddeler yaz. SADECE JSON formatında yanıt ver.

JSON STRUCTURE: { "slides": [ { "title": "...", "content": "..." }, ... ] }`;
    
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Pitch deck hazırlanacak iş fikri: "${prompt}"` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Groq returned empty content');
    }

    let deck: DeckResponse;
    try {
      deck = JSON.parse(responseText) as DeckResponse;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Response:', responseText);
      throw new Error('Failed to parse AI response as JSON');
    }

    return NextResponse.json(deck);

  } catch (error: any) {
    console.error('Deck API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}