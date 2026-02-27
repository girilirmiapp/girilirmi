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
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      console.warn('[Leads API] GOOGLE_SHEET_ID is missing');
      // For build/dev without keys, we just log and return success to avoid blocking
      return NextResponse.json({ success: true, message: 'Lead logged (simulation)' });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toISOString(), name, email, source]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Leads API] Google Sheets Error:', error);
    return NextResponse.json({ error: 'Failed to process lead' }, { status: 500 });
  }
}
