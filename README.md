# ECB Fun Run 2026 — Registration System

Production-ready, mobile-first registration platform for **ECB Fun Run 2026** (Saturday, 7 November
2026), celebrating ECB's 60th anniversary. Bilingual UI — English by default, Thai via the language
switcher — covering the full participant journey (register, pay, get reviewed, get approved, show a
QR code on BIB day) plus a complete admin back office.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma**.

## Quickstart — zero API keys needed

The app ships with sane dev-mode defaults so the entire participant → admin → BIB-day flow runs
locally with nothing but `npm install`:

- **Database**: SQLite (`prisma/dev.db`), zero setup. Swap to Postgres for production — see below.
- **Email**: no `RESEND_API_KEY` → emails are logged to the database instead of sent, viewable at
  `/admin/emails` (including the QR code image embedded in the approval email).
- **File storage**: payment slips are saved to `./private-storage` on disk (never under `/public`),
  served only through a signed, time-limited URL to authenticated admins.

```bash
npm install
cp .env.example .env      # defaults work as-is for local dev
npm run db:push           # creates prisma/dev.db from the schema
npm run db:seed           # seeds event config, quotas, and one Super Admin
npm run dev
```

Open `http://localhost:3000`. Admin login: whatever `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` are
set to in `.env` (defaults to `admin@ecbfunrun.example` / `ChangeMe123!` — **change this before any
real deployment**).

Registration only accepts submissions between 13 Sep–18 Oct 2026 by default. To test the form
before/after that window, log in as admin and use the **Force Open / Force Closed** override on the
Dashboard.

## Architecture

- **Frontend**: Next.js App Router, Tailwind, hand-built UI primitives (`components/ui`), mobile-first
  6-step registration wizard (`components/register`).
- **Data**: Prisma ORM. `prisma/schema.prisma` uses plain validated `String` fields instead of native
  `enum`s specifically so the same schema works unchanged on SQLite (dev) and Postgres (prod) — only
  the `datasource.provider` and `DATABASE_URL` change between environments.
- **Auth**: custom admin auth — `bcryptjs` password hashing, signed JWT session cookie (`jose`),
  role-based access control (`SUPER_ADMIN`, `REGISTRATION_STAFF`, `BIB_STAFF`) checked in every server
  action. No third-party auth provider dependency.
- **Mutations**: Next.js Server Actions (`lib/actions/*.ts`) for nearly everything — registration
  submit, admin approve/reject/verify, settings, check-in. Route handlers (`app/api/*`) are used only
  where a typed file response is needed: private slip download and CSV export.
- **Storage**: `lib/storage.ts` abstracts payment-slip storage behind `savePaymentSlip` /
  `readStoredFile`. The local-disk implementation is swappable for S3/Supabase Storage without
  touching any caller.
- **Email**: `lib/email/send.ts` abstracts sending behind one `sendEmail()` call. Resend is used when
  `RESEND_API_KEY` is set; otherwise everything is logged to `EmailLog` (the dev outbox).
- **QR codes**: generated only on admin approval (`lib/qr.ts`, `qrcode` package). The QR encodes a
  random opaque token + verification URL only — no PII, no health data, per spec.

## Core business rules (why the code is shaped this way)

- **Quota concurrency safety**: every quota change is a single atomic `UPDATE ... WHERE` statement
  (`lib/quota.ts`), never a read-then-write pair — this is what actually prevents overbooking under
  concurrent submissions, on both SQLite and Postgres.
- **Quota bucketing**: `Quota.reservedCount` counts registrations that hold a slot but aren't approved
  yet (`SUBMITTED`, `PAYMENT_PENDING`, `PAYMENT_REVIEW`, `PAYMENT_ISSUE`); `Quota.approvedCount` counts
  `APPROVED` only. `REJECTED`/`CANCELLED` free the slot. This is the "clear business rule to prevent
  overbooking" the spec asks for.
- **Reservation expiry**: registrations that never get a payment slip within
  `Settings.reservationExpiryMinutes` are auto-cancelled (releasing their quota slot) the next time the
  dashboard or landing page is read (`sweepExpiredReservations`). There's no real cron in this
  environment — wire one up in production for punctual expiry instead of relying on page loads.
- **Approve requires Verified payment**: `approveRegistration()` hard-blocks unless the participant's
  latest payment record is `VERIFIED`. Not explicit in the spec's button list, but approving an
  unverified/unpaid registration is a real correctness risk for a paid event, so it's enforced
  server-side, not just hidden in the UI.
- **Two distinct acknowledgement checkboxes**: the PAR-Q "please consult a doctor" checkbox (section 6,
  only required when any answer is YES) and the Participant Declaration (section 7, always required)
  are separate fields (`ParqResponse.declarationAccepted` vs `Participant.declarationAccepted`) — they
  look similar in the spec text but are genuinely different consents with different trigger
  conditions.
- **Health Consent is mandatory to submit**; Marketing/Communication consent are optional and never
  block registration — per spec sections 8A vs 8B.

## Language (English / Thai)

- All translated strings live in one place, `lib/i18n/dictionaries.ts` — an `en` object (source of
  truth) and a `th` object typed against it (`th: Dictionary`), so a missing or mismatched Thai key
  fails `tsc`, not silently falls back to English at runtime.
- `lib/i18n/LanguageProvider.tsx` holds the current locale in React context, persisted to
  `localStorage` (`ecb-locale`), defaulting to `en`. The switcher (`components/ui/LanguageSwitcher.tsx`)
  is on the landing page header, the registration wizard's step bar, and the participant status page.
- Covered: landing page, the full 6-step registration wizard (including all 7 PAR-Q questions and the
  three PDPA consent texts — official English PAR-Q wording, not a literal translation), the secure
  status page, and all 4 transactional emails (the language a participant registered in is stored on
  `Participant.preferredLocale` and used for every email sent to them afterward).
- **Not covered (intentionally, to keep scope sane): the admin panel.** Staff-facing screens
  (dashboard, registration review, settings, reports, BIB check-in) stay in the original Thai/English
  mix — admins are assumed to be comfortable with both, and translating internal tooling wasn't part
  of the ask.
- The ECB 60th-anniversary logo referenced in the landing page header/hero (`/logo.png`) is not
  bundled — drop the exported logo file at `public/logo.png` (any resolution; it's rendered at ~40px
  and ~140px) and it'll pick up automatically. Until then those two spots show a broken-image icon,
  nothing else is affected.

## Deploying to production

1. **Database**: point `DATABASE_URL` at a real Postgres instance (Supabase, Neon, RDS, ...) and change
   `datasource.provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`. Run
   `npx prisma db push` (or set up migrations) and `npm run db:seed` once.
2. **Storage**: swap `lib/storage.ts`'s `savePaymentSlip`/`readStoredFile` for S3 or Supabase Storage
   calls. Keep the signed-URL pattern (`signedSlipUrl`) — never expose a public/direct path to a slip.
3. **Email**: set `RESEND_API_KEY` (and `EMAIL_SENDER_NAME`/reply-to via Admin Settings). Verify a
   sending domain with Resend.
4. **Secrets**: generate real values for `SESSION_SECRET` and `FILE_TOKEN_SECRET`
   (`openssl rand -base64 32`), set `NEXT_PUBLIC_APP_URL` to the real domain.
5. Put the reservation-expiry sweep and quota checks behind HTTPS in front of everything (Vercel,
   Fly.io, etc. terminate TLS for you).
6. Consider swapping the in-memory rate limiter (`lib/rateLimit.ts`) for a Redis-backed one if you run
   more than one server instance.

## Project structure

```
app/                       Routes (App Router)
  page.tsx                 Landing page
  register/                Public registration wizard
  status/[token]/          Participant secure status page (no login)
  admin/login/              Admin login (public)
  admin/(protected)/        Everything else under /admin — auth-gated by layout.tsx
  api/files/slip/           Signed private-file download
  api/admin/reports/export/ CSV export
lib/
  actions/                  Server Actions (mutations)
  auth/session.ts            Admin session + password hashing
  workflow.ts                 Approve/reject/verify/BIB-collect business logic
  quota.ts                    Atomic quota reservation
  registration.ts             Registration submit + slip attach
  email/                      Templates + send abstraction
  storage.ts                  Private file storage abstraction
  qr.ts                       QR generation
  config.ts                   Domain constants (distances, shirt sizes, PAR-Q questions, ...)
prisma/schema.prisma        Data model (see file header for the SQLite/Postgres note)
```

## Security notes

- Payment slips are never served from a public path — only via `/api/files/slip?token=...`, a signed,
  15-minute HMAC token, and only to an authenticated admin session.
- PAR-Q health answers are only shown on the admin registration detail page (auth + RBAC gated), never
  in dashboard summaries.
- QR codes encode a random opaque token only — no phone/email/health data.
- Passwords are hashed with bcrypt (cost 12); admin sessions are signed JWTs in an `httpOnly`,
  `sameSite=lax` cookie.
- All mutating Server Actions re-check the caller's admin session and role server-side — the UI hiding
  a button is never the only guard.
- Every status change, payment action, and BIB collection writes an `AuditLog` row
  (admin, participant, action, previous/new value, note, timestamp).
