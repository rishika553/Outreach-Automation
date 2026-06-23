# OutreachAI — AI-Powered Sales Outreach SaaS

A production-ready AI outreach bot SaaS built with Next.js 15, TypeScript, Tailwind CSS, Supabase, Prisma ORM, Gemini AI, Groq, and Resend.

---

## Features

- **Authentication** — Email/password via Supabase Auth (login, signup, forgot password)
- **Dashboard** — Stats cards (campaigns, leads, emails sent, reply rate, positive replies, pending follow-ups) + charts
- **Campaign Management** — Create, edit, pause, activate, delete campaigns
- **Lead Database** — Add, edit, delete, search, filter, CSV import/export
- **AI Lead Research Agent** — One-click AI analysis: company summary, pain points, outreach angle, personalized hook
- **AI Email Generator** — Personalized emails in 4 tones (Professional, Friendly, Startup Founder, Sales) using Gemini + Groq fallback
- **Email Sending** — Send individual, test, and bulk emails via Resend
- **Email Tracking** — Track Sent → Delivered → Opened → Replied status
- **Reply Analysis Agent** — AI sentiment detection (Positive/Neutral/Negative) with summary and suggested actions
- **Automatic Follow-Up Agent** — Auto follow-ups at Day 3, 7, 14 if no reply received (max 3 per lead)
- **Inbox** — Threaded conversation view with AI analysis panel
- **Analytics** — Open rate, reply rate, campaign performance, best times, top templates
- **Settings** — Profile, password, notifications, integrations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand + TanStack Query |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL + Prisma ORM |
| AI (primary) | Google Gemini API |
| AI (fallback) | Groq (Mixtral) |
| Email | Resend API |
| Validation | Zod + React Hook Form |
| Charts | Recharts |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Signup, Forgot Password
│   ├── (dashboard)/      # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── page.tsx          # Main dashboard
│   │       ├── campaigns/        # Campaign management
│   │       ├── leads/            # Lead database
│   │       ├── emails/           # Email compose & list
│   │       ├── inbox/            # Inbox & replies
│   │       ├── analytics/        # Analytics charts
│   │       └── settings/         # Account settings
│   ├── (marketing)/      # Landing page
│   ├── api/
│   │   ├── campaigns/    # CRUD + [id]
│   │   ├── leads/        # CRUD + import + export + [id]/research
│   │   ├── emails/       # List + generate + send
│   │   ├── inbox/        # Threads + reply analysis
│   │   ├── follow-ups/   # Cron-triggered processing
│   │   ├── analytics/    # Campaign analytics
│   │   ├── dashboard/    # Stats endpoint
│   │   └── users/        # User management
│   └── auth/callback/    # Supabase OAuth callback
├── components/
│   ├── ui/               # All shadcn/ui components
│   ├── dashboard/        # Sidebar, Header
│   ├── leads/            # LeadFormDialog, ResearchDialog
│   └── emails/           # EmailComposeDialog
├── hooks/
│   ├── use-api.ts        # TanStack Query hooks
│   └── use-toast.ts      # Toast hook
├── lib/
│   ├── ai/               # Gemini + Groq + unified index
│   ├── auth/             # getAuthUser helper
│   ├── email/            # Resend integration
│   ├── follow-ups/       # Scheduler logic
│   ├── supabase/         # client, server, middleware
│   ├── prisma.ts         # Prisma client singleton
│   ├── utils.ts          # Helper utilities
│   └── validations.ts    # Zod schemas
├── store/                # Zustand stores
├── types/                # TypeScript types
└── middleware.ts         # Auth middleware
```

---

## Setup Guide

### 1. Clone and install

```bash
git clone <repo>
cd ai-outreach-saas
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy:
   - Project URL
   - anon/public key
   - service_role key
3. Go to **Settings → Database** and copy the connection string

### 3. Set up environment variables

Copy `.env.local` and fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database (use the "direct connection" string for migrations)
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# AI APIs
GEMINI_API_KEY=your_gemini_api_key       # https://aistudio.google.com/apikey
GROQ_API_KEY=your_groq_api_key           # https://console.groq.com

# Email
RESEND_API_KEY=your_resend_api_key       # https://resend.com
RESEND_FROM_EMAIL=you@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron security (optional but recommended)
CRON_SECRET=your_random_secret_string
```

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Follow-Up Automation

The follow-up cron endpoint is at `POST /api/follow-ups/process`.

Set up a cron job to hit this endpoint daily:

**Vercel Cron** — add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/follow-ups/process",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Protect it with the `CRON_SECRET` env variable by passing `Authorization: Bearer <secret>` header.

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

Make sure to use the **pooled** Supabase connection string for `DATABASE_URL` in production.

---

## CSV Import Format

Your CSV must have a header row. Supported columns:

| Column | Required |
|--------|----------|
| name | ✅ |
| email | ✅ |
| company | |
| website | |
| linkedin | |
| industry | |
| location | |
| notes | |

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET/POST | `/api/campaigns` | List / create campaigns |
| GET/PATCH/DELETE | `/api/campaigns/[id]` | Single campaign |
| GET/POST | `/api/leads` | List / create leads |
| GET/PATCH/DELETE | `/api/leads/[id]` | Single lead |
| POST | `/api/leads/[id]/research` | AI research a lead |
| POST | `/api/leads/import` | Bulk CSV import |
| GET | `/api/leads/export` | CSV export |
| GET | `/api/emails` | List emails |
| POST | `/api/emails/generate` | AI generate email |
| POST | `/api/emails/send` | Send single email |
| PUT | `/api/emails/send` | Bulk send |
| GET/POST | `/api/inbox` | Threads / log reply |
| GET | `/api/analytics` | Campaign analytics |
| POST | `/api/follow-ups/process` | Process due follow-ups (cron) |
