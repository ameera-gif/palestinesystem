# MyFundAction — Gaza Child Sponsorship Platform

A child sponsorship platform for MyFundAction's Gaza programme: a public sponsorship website plus a secure
three-role portal (Sponsor, Ufuk field team, MyFundAction Project Coordinator) and an Admin area, built around the
core workflow:

```
Ufuk updates → Ufuk submits → MyFundAction reviews → MyFundAction approves/publishes → Sponsor receives update
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full architecture proposal (sitemaps, role-permission matrix,
database design, privacy/safeguarding controls, and the scoping decisions made for this build).

All data in this project is **fictional demo data** — no real child, sponsor, or field-partner information is used
anywhere.

## Tech stack

- Next.js 16 (App Router, Server Components + Server Actions), TypeScript, Tailwind CSS v4
- Prisma ORM + **Postgres** (a free [Neon](https://neon.tech) or [Vercel Postgres](https://vercel.com/storage/postgres)
  database works fine for both local dev and production — see "Deploying to Vercel" below)
- Auth.js (NextAuth) v5, credentials + bcrypt
- Local filesystem storage behind an authenticated route handler (stands in for signed S3/R2 URLs in production)
- A small hand-built design-system component set on Tailwind tokens (no external UI kit dependency)
- Lightweight custom i18n (English fully localized; Malay/Arabic scaffolded with RTL support) — see `src/lib/i18n`

## Getting started

1. Get a Postgres connection string — the fastest option is a free [Neon](https://neon.tech) database (no card
   required), or provision Vercel Postgres from your Vercel project's Storage tab.
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` (and generate a real `AUTH_SECRET` — see the comment
   in the file).
3. Run:

```bash
npm install                # also runs `prisma generate` via postinstall
npx prisma migrate deploy  # creates all tables from prisma/migrations
npm run db:seed            # seeds fictional demo data
npm run dev
```

Open http://localhost:3000.

To reset the database and reseed from scratch:

```bash
npm run db:reset
```

## Deploying to Vercel

1. Import the GitHub repo into Vercel as a new project.
2. In the project's **Settings → Environment Variables**, add `DATABASE_URL` (a Postgres connection string — Neon
   or Vercel Postgres both work), `AUTH_SECRET` (a real generated secret, not the dev placeholder), and
   `NEXTAUTH_URL` (your deployed URL, e.g. `https://your-project.vercel.app`).
3. Deploy. The build command (`prisma migrate deploy && next build`) applies all migrations to your database
   automatically on every deploy — no manual migration step needed once the env vars above are set.
4. Seed demo data once, from your own machine, pointed at the production database:
   ```bash
   DATABASE_URL="<your production connection string>" npm run db:seed
   ```
   (PowerShell: `$env:DATABASE_URL="<connection string>"; npm run db:seed`)

**Uploaded files (Ufuk's report photos, distribution evidence, media) currently save to local disk**
(`src/lib/storage.ts`), which — like SQLite — does not persist on Vercel's serverless functions. Uploads will
appear to succeed but won't be retrievable afterward. This wasn't addressed in this pass since it wasn't blocking
the reported error; swapping in real object storage (Vercel Blob, S3, etc.) is a contained change to that one
file whenever you're ready for it.

## Demo accounts

All demo accounts share the password `Passw0rd!`.

| Role | Email |
|---|---|
| Sponsor | `sponsor.amira@example.com` |
| Sponsor | `sponsor.james@example.com` |
| Ufuk field team | `yusuf.alamin@ufuk-partner.org` |
| MyFundAction PC | `nadia.suleiman@myfundaction.org` |
| MyFundAction PC | `farid.rahman@myfundaction.org` |
| Admin | `admin@myfundaction.org` |

Sign in at `/login` — each role lands on its own portal home automatically.

## Where things live

```
src/app/(public)/        Public marketing + sponsorship site (home, directory, child profile, how-it-works, etc.)
src/app/portal/          Sponsor portal
src/app/implementer/     Ufuk field portal
src/app/management/      MyFundAction Project Coordinator portal (incl. the Review Centre)
src/app/admin/           Admin (users/roles, programme settings)
src/app/api/             NextAuth route, authenticated file serving, upload endpoint

src/lib/services/        Domain logic — sponsorship lifecycle, report workflow, distribution workflow,
                          media approval, meetings, messages, notifications, audit log
src/lib/mappers/child.ts Privacy boundary — the only sanctioned way to turn a Child row into public/sponsor-facing data
src/lib/rbac.ts           Server-side role guards (requireRole/requireSession) used by every action & route handler
src/middleware.ts         Route-group gate (redirects unauthenticated/wrong-role users)
src/components/ui/        Shared design-system primitives
prisma/schema.prisma      Full data model
prisma/seed.ts            Fictional demo data generator
```

## Key workflows implemented

- **Report review**: Ufuk drafts → submits → MyFundAction approves/returns → MyFundAction publishes → sponsor sees it.
  Sponsors never see anything but `PUBLISHED` reports.
- **Distribution**: Ufuk creates a batch (e.g. "Q1 2026") covering many children at once → records delivery →
  attaches evidence → MyFundAction verifies → sponsor sees a plain-language "Support Update."
- **Media**: Ufuk uploads with a requested visibility → MyFundAction approves (and sets final visibility:
  Internal / Sponsor Only / Public Approved).
- **Sponsorship matching**: sponsor requests a child (stub payment) → request queues in the Review Centre →
  MyFundAction confirms → child flips to Sponsored. Guards against double-booking an available child.
- **Meetings**: MyFundAction requests Ufuk's availability → Ufuk confirms → MyFundAction schedules (manual
  Meet/Zoom/Teams link) → sponsor is notified. No sponsor-initiated meeting creation, per the safeguarding
  requirement that a representative always facilitates.
- **Moderated messages**: sponsor writes a greeting → MyFundAction moderates → delivered. No direct sponsor-child
  messaging.
- **Audit log**: every review decision, status change, and approval is recorded (`src/lib/services/audit.ts`).

## Known limitations (by design, for this build)

See ARCHITECTURE.md §17 for the full reasoning. In short: SQLite instead of Postgres (no local DB service
available), a stub payment confirmation instead of a real gateway, a manual meeting-link field instead of live
Google Meet/Zoom API integration, and partial (not full-page) Malay/Arabic translation coverage. All of these are
called out as Phase 2 items in the original brief.
