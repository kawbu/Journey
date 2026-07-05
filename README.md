# Our Journey

A native mobile app for couples to plan dates together — a shared, chronological itinerary of
full-day dates (each made of multiple timed stops), a live map with numbered pins, a shared
bucket list, notifications to keep both partners in sync, profile/date-cover photos, and full
light/dark mode support.

Built with **Expo (React Native) + TypeScript**, backed by **Supabase** (Postgres + Auth +
Realtime).

For the full product/architecture writeup — data model, screens, schema, and notable design
decisions — see **[DESIGN.md](./DESIGN.md)**. For commit conventions and the release process,
see **[CONTRIBUTING.md](./CONTRIBUTING.md)**. This file is just about running the project.

## Prerequisites

- Node.js and npm
- The [Expo Go](https://expo.dev/go) app on your phone, or an iOS Simulator / Android Emulator
- A Supabase project (see [Supabase setup](#supabase-setup) below if you don't have one linked yet)

## Getting started

```bash
npm install
cp .env.example .env
# then fill in EXPO_PUBLIC_SUPABASE_ANON_KEY in .env (see below)

npm start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go on your
phone.

## Environment variables

The app reads its Supabase connection from `.env` (copied from `.env.example`):

```
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Find both in the Supabase Dashboard under **Project Settings → API**. The anon key is safe to
embed client-side — it's constrained by Row Level Security, not a secret. `.env` is gitignored;
never commit real keys.

## Supabase setup

This project's schema lives in `supabase/migrations/` as plain SQL files, applied in order. If
you're pointing this app at a fresh Supabase project:

```bash
npx supabase login          # opens a browser auth flow
npx supabase link --project-ref <your-project-ref>
npx supabase db push        # applies all migrations in supabase/migrations/
npx supabase db push --include-seed   # also seeds the bucket-list catalog (supabase/seed.sql)
```

Migrations also create two public Storage buckets, `avatars` and `date-covers` (for profile
pictures and date cover photos), with RLS policies scoping uploads to their owner/journey — no
separate manual Storage setup needed.

After any future schema change, regenerate the TypeScript types so the client stays in sync
with the real database:

```bash
npx supabase gen types typescript --linked > src/lib/database.types.ts
```

**Turn off email confirmation for local development**: Supabase Dashboard → Authentication →
Providers → Email → toggle off "Confirm email." With it on, `signUp()` won't return a live
session until the user clicks a confirmation link — and Supabase's own default email sender is
rate-limited to only a handful of emails per hour, which you'll hit fast while testing sign-up
repeatedly.

## Project structure

```
src/
  components/   Shared UI pieces (cards, modals, form fields)
  context/      Auth, Dates, BucketList, Notifications — see DESIGN.md §4
  screens/      One file per screen
  navigation/   React Navigation stacks/tabs + route types
  theme/        Design tokens (colors, fonts, spacing, radii, shadows)
  lib/          Supabase client + generated database types
  types/        Shared app-level TypeScript types
supabase/
  migrations/   Schema history, applied in filename order
  seed.sql      Bucket-list catalog seed data
```

## Verifying changes

```bash
npx tsc --noEmit                        # type-check
npx expo export --platform ios          # confirm the bundle builds
npx expo start --ios                    # run it for real on a simulator
```

## Releases & versioning

Versioning is fully automated via [semantic-release](https://semantic-release.gitbook.io/),
driven by [Conventional Commit](https://www.conventionalcommits.org/) messages (enforced by a
local git hook). See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for the commit message format and
exactly what happens on release — don't hand-edit version numbers or `CHANGELOG.md`.

## Known limitations

- **Notifications are local-only** — no real cross-device push yet (would need an EAS
  dev-client build + a server-side sender). See `DESIGN.md` §5 for details, including an
  Android + Expo Go crash workaround already in place (`src/lib/pushNotifications.ts`).
- **No Google sign-in yet** — the button exists but is a stub pending Supabase OAuth provider
  configuration.
- **A journey is capped at exactly two members**, enforced at the database level — this is a
  couples app by design.
- **"Journey+" is a UI-only paywall stub** — no billing/subscription integration exists behind
  it yet.
