import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const runtime = 'nodejs';

/**
 * Lead Request Interface
 */
interface LeadRequest {
  email: string;
  name?: string;
  source?: string;
}

/**
 * POST: Capture lead and push to Google Sheets
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LeadRequest;
    const { email, name = 'N/A', source = 'landing_page' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Google Auth Configuration
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !privateKey || !spreadsheetId) {
      console.warn('[Leads API] Google credentials or Sheet ID missing. Simulation mode.');
      return NextResponse.json({ 
        success: true, 
        message: 'Lead logged (simulation)',
        data: { email, name, source }
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toISOString(), name, email, source]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[Leads API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to process lead', details: errorMessage }, { status: 500 });
  }
}
