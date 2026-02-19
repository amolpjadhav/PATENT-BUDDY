# PatentBuddy

A mobile-friendly web app that helps solo inventors draft a US provisional-style patent application via a guided interview.

> **Not legal advice.** PatentBuddy produces a draft document for informational purposes only. Always consult a registered patent attorney before filing with the USPTO.

---

## Features

- **5-step guided interview** — collects invention details, components, novel aspects, embodiments, and context
- **AI-generated draft** — produces all standard provisional patent sections (Field, Background, Summary, Detailed Description, Abstract) plus a claim set
- **Quality checks** — flags antecedent basis issues, undefined terms, missing support, and thin sections
- **Editable sections and claims** — inline editing directly in the browser
- **DOCX export** — formatted Word document with confidential header, ready for attorney review
- **Anonymous sessions** — no sign-up required; projects are tied to your browser session via a cookie
- **Delete project** — full data deletion with one click

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | SQLite (local) via Prisma 7 + `better-sqlite3` adapter |
| AI | OpenAI API (provider-agnostic interface — swap easily) |
| Export | `docx` npm package |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel-ready |

---

## Local Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd patent-buddy
npm install
```

### 2. Environment variables

Copy the example and fill in your OpenAI key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> The app uses `gpt-4o-mini` by default (fast and cheap). Change the model in `lib/ai/openai.ts`.

### 3. Set up the database

```bash
npx prisma migrate dev
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
patent-buddy/
├── app/
│   ├── layout.tsx                    # Root layout with DisclaimerBanner
│   ├── page.tsx                      # Landing page / project list
│   ├── projects/
│   │   ├── new/page.tsx              # Create project
│   │   └── [id]/
│   │       ├── page.tsx              # Project dashboard
│   │       ├── interview/page.tsx    # Guided 5-step wizard
│   │       ├── draft/page.tsx        # Section & claim editor
│   │       └── export/page.tsx       # DOCX export
│   └── api/
│       ├── projects/                 # CRUD for projects
│       ├── interview/[id]/           # Save interview progress
│       ├── generate/[id]/            # AI draft generation
│       ├── quality/[id]/             # Quality check runner
│       ├── sections/[id]/            # Update section content
│       ├── claims/[id]/              # Update claim content
│       └── export/[id]/              # Stream DOCX file
├── components/
│   ├── ui/                           # Button, Card, Input, Textarea, Badge
│   ├── DisclaimerBanner.tsx
│   ├── InterviewWizard.tsx           # Multi-step client wizard
│   ├── DraftEditor.tsx               # Sections/Claims/Quality tabs
│   ├── ExportPage.tsx
│   └── ProjectActions.tsx            # Delete confirmation
├── lib/
│   ├── ai/
│   │   ├── provider.ts               # Provider-agnostic AIProvider interface
│   │   ├── openai.ts                 # OpenAI implementation
│   │   └── index.ts
│   ├── prompts/
│   │   ├── draft.ts                  # Section + claims generation prompts
│   │   └── quality.ts                # Quality check prompt
│   ├── prisma.ts                     # Prisma client singleton
│   ├── docx.ts                       # DOCX document builder
│   ├── session.ts                    # Cookie-based session tokens
│   └── utils.ts
├── prisma/schema.prisma
├── types/index.ts
└── .env.example
```

---

## Switching AI Providers

The AI layer uses a provider-agnostic interface (`lib/ai/provider.ts`). To add a new provider:

1. Create `lib/ai/myprovider.ts` implementing `AIProvider`:
   ```ts
   export class MyProvider implements AIProvider {
     async complete(messages: AIMessage[], options?: AIOptions): Promise<string> { ... }
   }
   ```
2. Update `lib/ai/index.ts` to use your provider.

All prompts are isolated in `lib/prompts/` — edit them there without touching generation logic.

---

## Deploying to Vercel

For production, switch to PostgreSQL:

1. Provision a Postgres database (e.g., Vercel Postgres, Neon, Supabase)
2. Update `prisma/schema.prisma` datasource provider to `postgresql`
3. Install `@prisma/adapter-pg` and update `lib/prisma.ts`
4. Set `DATABASE_URL` in Vercel environment variables
5. Run `npx prisma migrate deploy` during your build step

Add to `vercel.json`:
```json
{
  "buildCommand": "npx prisma generate && npm run build"
}
```

---

## Guardrails

- Disclaimer banner on every page: "Not legal advice."
- All exported DOCX files are marked **CONFIDENTIAL**
- Projects are accessible only via the browser session that created them (cookie-gated)
- Delete-project feature permanently removes all data

---

## Limitations (MVP non-goals)

- No real legal advice
- No USPTO e-filing integration
- No prior art search
- No multi-user collaboration
- No email magic link auth (uses anonymous session tokens)
