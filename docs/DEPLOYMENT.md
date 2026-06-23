# Local Development Guide

## Prerequisites

1. [Node.js](https://nodejs.org) 18+
2. [PostgreSQL](https://www.postgresql.org/download/) running locally
3. Google AI Studio (Gemini) API key
4. Groq API key (optional fallback)

## Setup

### 1. Install Dependencies

```bash
npm install
npx prisma generate
```

### 2. Database Setup

Create a local PostgreSQL database:

```bash
# macOS/Linux
createdb ai_outreach_dev

# Windows (using psql)
psql -U postgres -c "CREATE DATABASE ai_outreach_dev;"
```

### 3. Environment Variables

Create `.env.local`:

```env
# Database — local connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_outreach_dev
DIRECT_DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_outreach_dev

# Supabase Auth (Local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP3ySny_DkqQvgnqkkBNZa-E

# AI
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key (optional)

# Email (optional for testing)
RESEND_API_KEY=
RESEND_FROM_EMAIL=test@example.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=local-dev-secret
```

### 4. Initialize Database

```bash
npx prisma db push
# or
npx prisma migrate dev --name init
```

## Running Locally

```bash
npm run dev
```

Open http://localhost:3000

## Build for Production (Local Testing)

```bash
npm run build
npm run start
```

## Roadmap (Next Steps)

- [ ] Campaign edit page (`/dashboard/campaigns/[id]/edit`)
- [ ] Email open tracking pixel
- [ ] Advanced lead filtering
- [ ] Team workspaces
