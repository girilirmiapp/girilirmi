import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, requireAdmin } from '@/lib/supabase';
import type { SiteContent } from '@/lib/types';

export const runtime = 'nodejs';

/**
 * GET: Fetch site content sections or specific keys
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');
    const key = searchParams.get('key');

    let query = supabaseAdmin.from('site_content').select('*').eq('published', true);

    if (section) query = query.eq('section', section);
    if (key) query = query.eq('key', key);

    const { data, error } = await query;

    if (error) {
      console.error('[Content API] Fetch Error:', error);
      throw new Error(`Failed to fetch content: ${error.message}`);
    }

    return NextResponse.json(data as SiteContent[]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST: Create or Update (Upsert) site content
 * Admin only access
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Check Admin
    await requireAdmin(req.headers);

    // 2. Parse Body
    const body = (await req.json()) as Partial<SiteContent>;
    const { key, locale = 'tr', section, title, body: contentBody, metadata = {}, published = true } = body;

    if (!key || !section || !contentBody) {
      return NextResponse.json({ error: 'Missing required fields: key, section, body' }, { status: 400 });
    }

    // 3. Upsert
    const { data, error } = await supabaseAdmin
      .from('site_content')
      .upsert({
        key,
        locale,
        section,
        title,
        body: contentBody,
        metadata,
        published,
      }, { onConflict: 'key,locale' })
      .select()
      .single();

    if (error) {
      console.error('[Content API] Upsert Error:', error);
      throw new Error(`Database upsert failed: ${error.message}`);
    }

    return NextResponse.json(data as SiteContent);
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
  }
}

/**
 * DELETE: Remove content entry by ID
 * Admin only access
 */
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req.headers);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing required parameter: id' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('site_content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Content API] Delete Error:', error);
      throw new Error(`Failed to delete content: ${error.message}`);
    }

    return NextResponse.json({ success: true, message: `Content ${id} deleted` });
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
  }
}
