# AI Outreach SaaS — Architecture

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui |
| State | React Query (server data), Zustand (UI preferences) |
| Auth | Supabase Auth (email/password) |
| Database | Supabase PostgreSQL + Prisma ORM 7 |
| AI | Google Gemini (primary), Groq Mixtral (fallback) |
| Email | Resend API |

## Folder Structure

```
ai-outreach-saas/
├── prisma/
│   └── schema.prisma          # Data models
├── prisma.config.ts           # Prisma 7 DB URL + migrations
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, signup, forgot password
│   │   ├── (dashboard)/       # Protected app shell
│   │   ├── api/               # REST API routes
│   │   └── auth/callback/     # Supabase OAuth callback
│   ├── components/
│   │   ├── dashboard/         # Sidebar, header
│   │   ├── leads/             # Lead forms
│   │   └── ui/                # shadcn components
│   ├── hooks/                 # React Query hooks
│   ├── lib/
│   │   ├── ai/                # Gemini + Groq + unified index
│   │   ├── auth/              # getAuthUser helper
│   │   ├── email/             # Resend integration
│   │   ├── follow-ups/        # Scheduler (day 3, 7, 14)
│   │   └── supabase/          # SSR clients + middleware
│   └── store/                 # Zustand UI store
└── docs/
```

## Data Model

- **User** — synced from Supabase Auth (`supabaseId`)
- **Campaign** — outreach config (goal, industry, template, status)
- **Lead** — contact database with optional campaign link
- **LeadResearch** — AI-generated company insights (1:1 with Lead)
- **Email** — outbound messages with status tracking
- **EmailReply** — inbound reply + AI sentiment analysis
- **FollowUp** — scheduled sequences (max 3: day 3, 7, 14)
- **Message** — inbox thread messages (inbound/outbound)
- **Analytics** — daily per-campaign aggregates

## AI Workflows

### Lead Research
`POST /api/leads/[id]/research` → Gemini/Groq → upsert `LeadResearch`

### Email Generation
`POST /api/emails/generate` → uses lead + research + campaign goal → creates draft `Email`

### Reply Analysis
`POST /api/inbox` with `replyBody` → sentiment + summary + suggested action

### Follow-Ups
On email send → `scheduleFollowUps()` creates 3 pending records  
Cron: `POST /api/follow-ups/process` (Bearer `CRON_SECRET`) → sends due follow-ups

## Email Workflow

1. Generate or compose email
2. `POST /api/emails/send` → Resend → update status → schedule follow-ups
3. Manual reply logging via inbox → AI analysis → cancel pending follow-ups

## Security

- Middleware protects `/dashboard/*` routes
- API routes use `getAuthUser()` — auto-creates DB user on first request
- Cron endpoint requires `CRON_SECRET` header
- Row-level isolation via `userId` on all queries
