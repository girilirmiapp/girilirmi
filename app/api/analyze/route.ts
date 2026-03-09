import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
// The API key is retrieved from process.env.OPENAI_API_KEY by default
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key-for-build', // Fallback to avoid build errors if key is missing
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
    const { userIdea } = body;

    if (!userIdea || typeof userIdea !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. "userIdea" is required and must be a string.' },
        { status: 400 }
      );
    }

    // Check if API key is actually present for real execution
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY is not set. Returning mock response for testing.');
      // Return a mock response if no key is present (for development/testing without cost)
      // This allows the frontend to be built and tested even without the key.
      const mockResponse: AnalysisResponse = {
        verdict: "GİRİLMEZ",
        risk_score: 9,
        opportunity_cost: "Bu fikirle harcayacağın zamanı, limon satarak değerlendirsen daha fazla ROI elde edersin.",
        survival_plan: "Önce pazar araştırması yap, sonra rakip analizine bak, en son bu fikri çöpe at.",
        detailed_analysis: "Fikir teoride güzel ama pratikte uygulanabilirliği sıfır. Ölçeklenme sorunu var ve pazar doymuş durumda. (MOCK RESPONSE: API Key eksik)"
      };
      return NextResponse.json(mockResponse);
    }

    const systemPrompt = `
      You are a ruthless, top 1% investment and strategy advisor. 
      You are NOT polite. You are brutally honest.
      Your goal is to save the user from bankruptcy or push them to a unicorn status if the idea is truly exceptional.
      
      Analyze the user's business idea or investment proposal.
      Identify fatal flaws, massive opportunity costs, and scalability bottlenecks.
      
      You must return a valid JSON object with the following structure:
      {
        "verdict": "GİRİLİR" or "GİRİLMEZ",
        "risk_score": integer (1-10, where 10 is highest risk),
        "opportunity_cost": "A sharp explanation of what is being lost by pursuing this instead of a better opportunity",
        "survival_plan": "A strict, step-by-step plan to fix the flaws (if fixable) or an exit strategy",
        "detailed_analysis": "A comprehensive, ruthless breakdown of the idea's viability, market fit, and financial logic"
      }
      
      Do not include any markdown formatting (like \`\`\`json). Just return the raw JSON object.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Or gpt-3.5-turbo if budget is tight, but gpt-4 is better for "ruthless" analysis
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this idea: "${userIdea}"` }
      ],
      temperature: 0.7, // Slight creativity for the "ruthless" persona
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
