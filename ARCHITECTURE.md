# MyFundAction Gaza Child Sponsorship Platform — Architecture Proposal

Reference used for UX/structural inspiration only (public sponsorship sites of this type — directory grid, individual profile with hero + story + sponsor CTA, trust/impact sections, updates gallery): orphanssociety.com and equivalent orphan-sponsorship sites. Nothing from any reference site is reproduced; branding, copy and information architecture below are original and adapted to MyFundAction's three-party operating model.

## 0. Operating model (drives every decision below)

```
SPONSOR → MYFUNDACTION (owns relationship, verifies everything) → UFUK (field partner, Gaza) → CHILD
```

Ufuk never publishes directly to a sponsor. Every field submission (report, distribution evidence, media, profile change) lands in a **Review Centre** queue that only MyFundAction can approve. Sponsors only ever see `PUBLISHED`/`VERIFIED`/`APPROVED` records. This is enforced in the data model (status enums) and at the API layer (role checks on every mutation), not just hidden in the UI.

## 1. System architecture

Single Next.js 16 (App Router) application, TypeScript, serving both the public marketing/sponsorship site and the authenticated portal from one codebase (shared design system, one deploy unit). Server Components + Route Handlers act as the API layer; Prisma is the only DB access path (no direct SQL in components). Role checks live in a `lib/auth/guard.ts` helper called at the top of every server action / route handler — UI hides buttons too, but the server is the actual gate.

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                           │
│  ┌───────────────┐   ┌────────────────────────────────────┐ │
│  │ Public site    │   │ Authenticated portal (/portal,     │ │
│  │ (marketing +   │   │ /implementer, /management, /admin) │ │
│  │ directory)     │   │ role-gated layouts                 │ │
│  └───────┬───────┘   └───────────────┬────────────────────┘ │
│          │        Server Actions / Route Handlers            │
│          └──────────────────┬─────────────────────────────┘ │
│                     lib/auth/guard.ts (RBAC)                 │
│                     lib/services/*  (domain logic)           │
└─────────────────────────────┬─────────────────────────────┘
                               │ Prisma ORM
                       PostgreSQL (SQLite in local/demo mode)
                               │
                    Object storage (local /storage in demo,
                    S3-compatible + signed URLs in production)
```

Auth: Auth.js (NextAuth) v5, credentials provider + bcrypt for the demo (swap in SSO/Entra/Google later without changing the RBAC model). JWT session carries `userId`, `role`, and the linked domain-profile id (sponsorId / ufukStaffId / pcId).

## 2. Public website sitemap

```
/                     Home
/sponsor-a-child      Directory (search, filter by age/gender/education/location)
/children/[slug]      Public child profile
/how-it-works         Sponsor → MyFundAction → Ufuk → Child explainer
/impact               Programme-level stats (aggregated, non-identifying)
/stories              Approved public stories/updates feed
/about                About MyFundAction + Ufuk partnership
/faq
/contact
/login                Shared login, redirects by role after auth
```

## 3. Sponsor portal sitemap

```
/portal                        Dashboard (my children summary, notifications)
/portal/children/[id]           Sponsored child profile (approved info only)
/portal/children/[id]/reports   Published academic/progress reports
/portal/children/[id]/support   Support Updates (plain-language distribution history)
/portal/children/[id]/media     Approved photos/videos
/portal/meetings                Upcoming/past sponsor-child meetings
/portal/messages                Moderated greetings (Eid/Ramadan/encouragement)
/portal/sponsorship             Billing/contribution status, sponsorship history
/portal/notifications
```

## 4. Ufuk (implementer) portal sitemap

```
/implementer                        Task-first dashboard ("what do I owe today")
/implementer/children               Roster (search/filter/status)
/implementer/children/[id]          Full record incl. restricted guardian/education tabs
/implementer/children/new
/implementer/reports                My submitted/draft/returned reports
/implementer/reports/new
/implementer/distributions          Batches (e.g. "Q1 2027")
/implementer/distributions/new
/implementer/media                  Upload queue + status
/implementer/meetings               Availability requests from MyFundAction
/implementer/tasks                  Unified overdue/due queue
```

## 5. MyFundAction portal sitemap

```
/management                    KPI dashboard (overdue-first, not vanity charts)
/management/review              Review Centre: reports | evidence | media | profile changes | messages | meetings
/management/children
/management/sponsors
/management/sponsorships         Matching + lifecycle
/management/meetings              Coordination workflow
/management/analytics
/admin/users                     Users, roles, programme settings (ADMIN)
/admin/settings                  Sponsorship amount, currency, frequency, cycle length
```

## 6. Role–permission matrix (enforced server-side)

| Capability | SPONSOR | UFUK | MYFUNDACTION_PC | ADMIN |
|---|:---:|:---:|:---:|:---:|
| Browse/select public child | ✔ | – | – | – |
| View own sponsored child (approved fields) | ✔ | – | ✔ | ✔ |
| View/edit full child record incl. guardian data | – | ✔ (assigned) | ✔ | ✔ |
| Create/edit child | – | ✔ | ✔ | ✔ |
| Change child status (with reason) | – | propose | approve | ✔ |
| Submit report | – | ✔ | – | – |
| Review/return/approve/publish report | – | – | ✔ | ✔ |
| Record distribution / evidence | – | ✔ | – | – |
| Verify distribution | – | – | ✔ | ✔ |
| Upload media | – | ✔ | – | – |
| Approve media visibility | – | – | ✔ | ✔ |
| Confirm sponsorship match | – | – | ✔ | ✔ |
| Schedule/coordinate meeting | – | confirm availability | ✔ | ✔ |
| Send/receive moderated message | ✔ (send) | deliver/relay | moderate | ✔ |
| Manage sponsors | – | – | ✔ | ✔ |
| Manage users/roles/settings | – | – | – | ✔ |
| View audit log | – | own actions | ✔ | ✔ |

## 7. Sponsor journey

Browse directory → open child profile → "Sponsor This Child" → create account/login → confirm amount & frequency (config-driven) → sponsorship request `PENDING` → payment stub confirms → MyFundAction confirms match → child flips to `SPONSORED`, sponsorship `ACTIVE` → sponsor portal unlocks child → sponsor receives update/report/support notifications on each MyFundAction publish event → periodic meeting invitations → ongoing relationship until paused/completed/cancelled.

## 8. Ufuk reporting journey

Dashboard flags report due (based on child's reporting cycle) → Ufuk fills structured form (academic, development, narrative, media) → `SAVE DRAFT` (autosaved) or `SUBMIT` → status `SUBMITTED` → PC reviews in Review Centre → `RETURNED` (with comment, Ufuk edits & resubmits, history retained) or `APPROVED` → PC `PUBLISHES` → sponsor notified, report appears in `/portal/.../reports`.

## 9. MyFundAction approval journey

Review Centre queue grouped by type → open submission → view full context (child, submitter, history) → `APPROVE` / `RETURN FOR CORRECTION` / `REQUEST MORE INFO` / `REJECT` → decision + comment recorded → on approve, a **publish** step (separate from approve, so PC can batch-approve then publish on a schedule if desired) makes it sponsor-visible → audit log entry written.

## 10. Sponsorship lifecycle

`PENDING → ACTIVE ⇄ PAUSED / PAYMENT_ISSUE → COMPLETED | CANCELLED`. Each transition is a service-layer function (not a raw status write) that also updates the child's status and writes an audit entry, so child and sponsorship state can never silently drift apart (e.g. child `SPONSORED` with no `ACTIVE` sponsorship).

## 11. Child data structure (summary)

- **Identity** (Ufuk-managed, PC-visible, sponsor sees display name/photo/age/gender only)
- **Guardian/Household** (Ufuk + PC only — never serialized into any sponsor- or public-facing API response, enforced by a dedicated Prisma `select` allow-list per audience rather than a deny-list)
- **Education** (approved subset visible to sponsor)
- **Programme info** (status, eligibility, current sponsorship)
- **Documents/consent** (internal only)
- **Status history** (with required reason on significant transitions)

## 12. Database / ERD proposal

Core entities and key relationships (see `prisma/schema.prisma` for the full, implemented schema):

- `User 1—1 {Sponsor|UfukStaff|ProjectCoordinator}` — one auth identity, one domain profile, role on `User`.
- `Child 1—N ChildStatusHistory`, `1—1 Guardian` (or 1—N household members), `1—N EducationRecord`, `1—N ChildDocument`.
- `Sponsorship N—1 Sponsor`, `N—1 Child` (a child has at most one **active** sponsorship, enforced in service logic); `1—N SponsorshipTransaction` (payment history).
- `Report N—1 Child`, `N—1 UfukStaff (submittedBy)`, `N—1 ProjectCoordinator (reviewedBy)`, `1—N ReportReview` (history of return/approve decisions), `1—N Media` (attachments).
- `DistributionBatch 1—N DistributionRecord N—1 Child`, `DistributionRecord 1—N DistributionEvidence`.
- `Media N—1 Child`, optional `N—1 Report`/`DistributionRecord`, own `visibility`/`approvalStatus`.
- `Meeting N—1 Child`, `N—1 Sponsor`, `N—1 ProjectCoordinator`, `N—1 UfukStaff`.
- `Message N—1 Sponsor`, `N—1 Child`, moderation fields (`reviewedBy`, `status`).
- `Notification N—1 User` (polymorphic `entityType/entityId` reference, no FK needed for a lightweight inbox).
- `AuditLog N—1 User` (polymorphic actor + entity reference; append-only).
- `ProgrammeSetting` — singleton/key-value config (monthly amount, currency, distribution frequency, reporting cycle length, meeting cycle length) so the "$50/quarter" numbers are never hard-coded.

## 13. Dashboard wireframe structure (shared shell)

All three portals share one layout primitive: left/top nav (role-specific items) + page header with a single primary action + content in cards/tables, no dense chart walls. Sponsor dashboard = one "My Child" hero card per sponsored child + a slim timeline of recent updates. Ufuk dashboard = counters that are really queues (click a number → filtered list, e.g. "Reports overdue: 3" opens the overdue report list). PC dashboard = the same queue pattern plus an aggregate KPI strip at the top (coverage %, on-time %, verification %).

## 14. MVP vs. later

MVP (this build): auth+RBAC, public directory+profile, sponsor matching flow (stubbed payment confirmation), all three dashboards, full child management, structured report workflow (draft→submit→review→return→approve→publish), distribution batches + evidence + verification, media upload+approval, in-app notifications, audit log, i18n/RTL scaffolding.

Deferred to Phase 2/3 (stubbed with clear "coming soon" or interface-only where useful): real payment gateway, real Google Meet/Zoom link generation (meeting record + manual link field is built now), moderated messaging delivery to a real external channel, PDF export, email/WhatsApp delivery, bulk CSV import, deep analytics/SROI.

## 15. Privacy & safeguarding controls

- Guardian/household/document/internal-notes fields are on separate Prisma models never queried by any sponsor- or public-facing code path (not just filtered — structurally absent from those queries' `select`).
- Every child-facing API response for SPONSOR/PUBLIC contexts is built through a single `toPublicChild()`/`toSponsorChild()` mapper, so a new field added to the schema doesn't leak by default (opt-in, not opt-out).
- Media has `visibility` (`INTERNAL`/`SPONSOR_ONLY`/`PUBLIC_APPROVED`) and `approvalStatus`; nothing is servable until approved.
- No exact address/location — only a coarse region string (e.g. "Gaza").
- Audit log on: child profile edits, status changes, report submit/approve/publish, distribution verify, media approve, sponsorship match, document view.
- Uploaded files served via a signed, time-limited route handler even in local demo mode (mirrors production signed-URL behaviour so the pattern transfers directly to S3).

## 16. Technical architecture (as implemented)

- Next.js 16 (App Router, Server Components + Server Actions), TypeScript, Tailwind v4.
- Prisma ORM + **PostgreSQL**, in every environment including local dev (see README's "Getting started" for a free Neon/Vercel Postgres option). Originally SQLite for local-only development (no Docker/Postgres service was available in that environment), switched to Postgres once the app was deployed to Vercel — SQLite is a file on disk and cannot run on serverless functions with no persistent filesystem. The schema was deliberately kept free of Postgres-only features from the start specifically so this was a one-line provider swap, per the brief's recommendation.
- Auth.js (NextAuth) v5, Credentials provider + bcrypt for demo accounts; JWT session.
- Hand-built, small design-system component set (Button, Card, Badge/StatusPill, Table, Tabs, Field/Input/Select/Textarea) on Tailwind tokens matching MyFundAction brand colours — avoids the extra CLI/network dependency of shadcn's installer while following the same composition pattern, so it can be swapped in later with no architectural change.
- Local filesystem storage under a private `/storage` directory, served only via an authenticated/signed route handler — swappable for S3/R2 by replacing one `lib/storage.ts` module.
- Lightweight custom i18n (`lib/i18n`) — JSON message dictionaries per locale + a `dir` toggle for Arabic RTL — rather than full `next-intl` locale-prefixed routing, to keep the three-portal routing tree simple for this build. English is fully localized; Malay/Arabic dictionaries are scaffolded with representative coverage (nav, hero, key CTAs, portal labels) so extending to full coverage is additive, not architectural.

## 17. Requirements I adjusted, and why

1. **Database engine**: originally SQLite for local/demo (no Docker/Postgres available in that environment); switched to PostgreSQL everywhere once the app moved to Vercel, since SQLite cannot run there at all. The schema was Postgres-compatible from the start, so this was the one-line swap it was designed to be.
2. **i18n**: lightweight custom dictionary approach instead of next-intl's locale-prefixed routing, to avoid tripling the route tree across public + 3 portals in the MVP. Same end-user capability (language switch, RTL), smaller footprint; upgrade path documented above.
3. **Payment**: modeled fully (transactions, statuses) but the actual charge is a stub confirmation step — no real gateway credentials exist yet, and wiring one in is explicitly Phase 2 in the brief.
4. **Meetings**: platform link is a manual field set during coordination rather than an API-generated Meet/Zoom link, since that requires OAuth credentials for a real Google/Microsoft account. The workflow, statuses and safeguarding assumption (a MyFundAction/Ufuk representative facilitates) are fully built.
5. **"Approve" vs "Publish" split** for reports (not explicitly separated in the brief): added a distinct publish step after approval so MyFundAction can batch-approve but control the moment sponsors are notified — small addition, no conflict with the brief's intent.
