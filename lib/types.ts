export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface SiteContent {
  id: string;
  key: string;
  locale: string;
  section: string;
  title: string | null;
  body: string;
  metadata: Record<string, any>;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  source: string | null;
  chunk_index: number;
  content: string;
  metadata: Record<string, any>;
  embedding: number[];
  created_at: string;
  updated_at: string;
}

export interface SystemLog {
  id: string;
  user_id: string | null;
  prompt: string;
  retrieved_context_ids: string[];
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  model: string | null;
  latency_ms: number | null;
  error_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchDocumentResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  source: string | null;
  chunk_index: number;
  similarity: number;
}
