import { NextRequest, NextResponse } from 'next/server';
import { openai, supabaseAdmin, requireAdmin, getEmbeddingModel } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * Ingest API Request Interface
 */
interface IngestRequest {
  text: string;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
  chunkSize?: number | null;
  chunkOverlap?: number | null;
}

/**
 * Text Chunking Helper
 */
function createChunks(text: string, size: number, overlap: number): string[] {
  if (!text) return [];
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + size, text.length);
    chunks.push(text.slice(i, end));
    if (end === text.length) break;
    i = end - overlap;
    if (i < 0) i = 0;
    if (overlap >= size) i = end; // Safety to prevent infinite loop
  }
  return chunks;
}

/**
 * POST: Chunk and Ingest text into vector DB
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Validate Admin Auth
    await requireAdmin(req.headers);

    // 2. Parse and Validate Request
    const body = (await req.json()) as IngestRequest;
    const text = body?.text?.trim();
    if (!text) {
      return NextResponse.json({ error: 'Missing required field: text' }, { status: 400 });
    }

    const source = body.source?.trim() || 'manual_ingest';
    const metadata = body.metadata || {};
    const chunkSize = body.chunkSize || 1000;
    const chunkOverlap = body.chunkOverlap || 200;

    // 3. Create Chunks
    const chunks = createChunks(text, chunkSize, chunkOverlap);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No valid content chunks generated' }, { status: 400 });
    }

    // 4. Generate OpenAI Embeddings
    const embeddingModel = getEmbeddingModel();
    const response = await openai.embeddings.create({
      model: embeddingModel,
      input: chunks,
    });

    if (!response.data || response.data.length !== chunks.length) {
      throw new Error('Partial failure in embedding generation');
    }

    // 5. Insert into Supabase 'documents' table
    const documents = response.data.map((item, index) => ({
      content: chunks[index],
      source: source,
      chunk_index: index,
      metadata: { ...metadata, model: embeddingModel },
      embedding: item.embedding,
    }));

    const { error: dbError } = await supabaseAdmin
      .from('documents')
      .insert(documents);

    if (dbError) {
      console.error('[Ingest API] DB Error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      count: chunks.length,
      message: `Successfully ingested ${chunks.length} chunks from ${source}`
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('[Ingest API] Fatal Error:', error);
    const status = (error as { status?: number })?.status || 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status });
  }
}
