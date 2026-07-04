# Agent instructions — Our Journey

Native mobile app (Expo/React Native + TypeScript, SDK 57) backed by Supabase. See
**[DESIGN.md](./DESIGN.md)** for the full architecture/data-model writeup and
**[README.md](./README.md)** for setup. This file is operational guidance for working in the
repo — read it before making changes.

## Stack

- Expo SDK 57, React Native, TypeScript, React Navigation (bottom tabs + native stack).
- Supabase: Postgres + Auth + Realtime, accessed via `@supabase/supabase-js`.
- No Redux/MobX/etc. — state is four React contexts (`Auth`, `Dates`, `BucketList`,
  `Notifications`), each mirroring the same shape (see below).

Expo APIs and Expo Go's supported feature set change between SDKs. If something native-module
related behaves unexpectedly, check the versioned docs at
`https://docs.expo.dev/versions/v57.0.0/` rather than assuming older-SDK behavior — this bit us
once already (see the `expo-notifications` gotcha below).

## Verifying changes

Always run before considering a change done:
```bash
npx tsc --noEmit
npx expo export --platform ios      # and --platform android if the change touches native modules
```
Then actually run it — `npx expo start --ios` (or `--android`), boot a simulator, and drive the
affected flow. Don't rely on `tsc`/bundle success alone to claim a UI or runtime behavior works.

## Context/data-layer conventions

Every context (`src/context/*.tsx`) follows the same shape — match it for anything new:
- `isLoaded` boolean, set once the initial fetch resolves.
- Mutators are optimistic: update local state immediately, write to Supabase, revert local
  state on error. No loading spinners on individual toggles.
- **No separate "Save" buttons anywhere in this app.** Every toggle/field autosaves on change
  (stop-completed, bucket checkoff, notification preferences, anniversary date). Keep it that
  way — don't introduce a second interaction pattern for new settings.
- Realtime subscriptions: one `supabase.channel(...)` per relevant table/journey, filtered by
  `journey_id=eq.${journeyId}` where the table has that column; every event just triggers a
  refetch rather than patching state from the payload. RLS is enforced server-side on Realtime
  too, so subscribing "unfiltered" to a table is safe — you only ever receive rows you could
  already `select`.
- Provider nesting in `App.tsx` is order-dependent (`BucketListProvider` → `NotificationsProvider`
  → `DatesProvider`, all inside `AuthProvider`) because each depends on hooks from the one
  before it. If you add a context that needs another context's hook, it must be nested inside
  that context's provider.

## Supabase / schema changes

Schema lives in `supabase/migrations/*.sql`, one file per change, named
`YYYYMMDDHHMMSS_description.sql`. Workflow for any schema change:
```bash
npx supabase db push --dry-run      # catch SQL errors before touching the live project
npx supabase db push                # applies for real — this hits the linked live database
npx supabase gen types typescript --linked > src/lib/database.types.ts
```
Never hand-edit `src/lib/database.types.ts` — always regenerate it. Never edit an
already-applied migration file — add a new one (see e.g. how `journeys.anniversary_date` and
`notification_preferences` were added later rather than rewriting `initial_schema.sql`).

RLS pattern: almost every policy leans on the `is_journey_member(journey_id)` SECURITY DEFINER
SQL helper (defined in `initial_schema.sql`). Reuse it for new tables scoped to a journey rather
than writing a fresh recursive check — a plain policy that queries the same table it's attached
to (e.g. `journey_members` checking `journey_members`) will recurse.

**Never fetch or print live Supabase API keys/credentials into a transcript or a file the user
didn't explicitly ask for.** Ask the user to paste them, or have them add to `.env` themselves.

## Known gotchas already solved — don't reintroduce

- **`expo-notifications` throws (not warns) on Android inside Expo Go**, at import time, via a
  side-effect module the package loads internally. Guarded in `src/lib/pushNotifications.ts`
  (checks `isRunningInExpoGo() && Platform.OS === 'android'` before ever `require()`-ing the
  module). Any new code that touches `expo-notifications` must go through that guard's
  `Notifications`/`NOTIFICATIONS_SUPPORTED` exports, not a fresh `import * as Notifications`.
- **Supabase's default email sender is rate-limited to a handful of emails/hour.** For local
  dev, email confirmation should be off (Dashboard → Authentication → Providers → Email). Don't
  "fix" a rate-limit error by adding retry logic — it's a project setting, not a bug.
- **Location search** (`PlanDateScreen`'s "set pin on map") uses OpenStreetMap Nominatim, not
  Google Places — deliberately, to avoid requiring API keys/billing for a personal project.
  Don't swap this for a paid provider without checking with the user first.

## Design system

`src/theme/theme.ts` is the only source of colors/fonts/spacing/radii/shadows — never hardcode
a hex color or font size in a component; add a token if one doesn't exist. Icons are
`MaterialIcons` from `@expo/vector-icons` everywhere except the Google "G" mark on the login
screen (`MaterialCommunityIcons`'s `google` glyph). Before using a new icon name, grep
`node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialIcons.json`
to confirm it exists — don't guess.
