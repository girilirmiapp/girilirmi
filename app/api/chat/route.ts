import { NextRequest } from 'next/server';
import { openai, supabaseAdmin, getEmbeddingModel, getChatModel } from '@/lib/supabase';
import type { MatchDocumentResult } from '@/lib/types';

export const runtime = 'nodejs';

/**
 * Chat API Request Interface
 */
interface ChatRequest {
  query: string;
  matchCount?: number;
  minSimilarity?: number;
  filterSource?: string | null;
  systemPrompt?: string | null;
}

const DEFAULT_SYSTEM_PROMPT = `You are a professional and helpful AI knowledge assistant.
Your task is to answer user queries using ONLY the provided context below.
If the answer is not contained within the context, politely state that you do not have enough information to answer.
STRICTLY avoid hallucinations and outside knowledge.

Context:
{context}`;

/**
 * POST: Vector search context and stream AI response
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse and Validate Request
    const body = (await req.json()) as ChatRequest;
    const query = body?.query?.trim();

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing required field: query' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const matchCount = body.matchCount || 6;
    const minSimilarity = body.minSimilarity || 0.15;
    const filterSource = body.filterSource || null;
    const embeddingModel = getEmbeddingModel();
    const chatModel = getChatModel();

    // 2. Generate Search Embedding
    const embedResponse = await openai.embeddings.create({
      model: embeddingModel,
      input: query,
    });

    const queryEmbedding = embedResponse.data[0]?.embedding;
    if (!queryEmbedding) {
      throw new Error('Failed to generate search embedding');
    }

    // 3. Perform Vector Search (RPC match_documents)
    const { data: matches, error: rpcError } = await supabaseAdmin.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_count: matchCount,
      min_similarity: minSimilarity,
      filter_source: filterSource,
    });

    if (rpcError) {
      console.error('[Chat API] RPC Search Error:', rpcError);
      throw new Error(`Knowledge base search failed: ${rpcError.message}`);
    }

    const results = (matches as MatchDocumentResult[]) || [];

    // 4. Construct Context-Augmented Prompt
    const contextText = results
      .map((m, i) => `[${i + 1}] Source: ${m.source || 'Unknown'}\nContent: ${m.content}`)
      .join('\n\n');

    const finalSystemPrompt = (body.systemPrompt || DEFAULT_SYSTEM_PROMPT).replace('{context}', contextText);

    // 5. Stream OpenAI Completion
    const completion = await openai.chat.completions.create({
      model: chatModel,
      messages: [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: query },
      ],
      stream: true,
      temperature: 0, // Deterministic for RAG
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error: unknown) {
          console.error('[Chat API] Streaming Error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: unknown) {
    console.error('[Chat API] Fatal Error:', error);
    const status = (error as { status?: number })?.status || 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
