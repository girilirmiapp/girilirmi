# Girilirmi - AI Powered SaaS Platform

A production-ready, cloud-native SaaS platform built with Next.js 16, Supabase, and OpenAI.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   Create a `.env.local` file based on [.env.local.example](file:///c:/Users/PC/Documents/trae_projects/girilirmi/.env.local.example).

3. **Database Setup**
   Run the SQL provided in the Phase 1 instructions within your Supabase SQL Editor to create the necessary tables, functions, and RLS policies.

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **Frontend/Backend**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI**: OpenAI (Embeddings & Chat Completions)
- **UI**: Tailwind CSS, Lucide React
- **Integrations**: Google Sheets API

## 📁 Key Files

- [supabase.ts](file:///c:/Users/PC/Documents/trae_projects/girilirmi/lib/supabase.ts): Core Supabase/OpenAI client setup.
- [/api/ingest](file:///c:/Users/PC/Documents/trae_projects/girilirmi/app/api/ingest/route.ts): Endpoint for RAG data ingestion.
- [/api/chat](file:///c:/Users/PC/Documents/trae_projects/girilirmi/app/api/chat/route.ts): RAG-powered chat engine with streaming.
- [/admin](file:///c:/Users/PC/Documents/trae_projects/girilirmi/app/admin/page.tsx): Secure administration dashboard.

## 📄 Requirements

See [package.json](file:///c:/Users/PC/Documents/trae_projects/girilirmi/package.json) for the full list of dependencies. 

Main dependencies:
- `@supabase/ssr`
- `@supabase/supabase-js`
- `openai`
- `googleapis`
- `lucide-react`
- `next`
- `react`
- `react-dom`
- `clsx`
- `tailwind-merge`
