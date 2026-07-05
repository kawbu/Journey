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
- **Supabase Storage RLS needs a `select` policy, not just insert/update/delete.** The original
  `storage_buckets` migration omitted one and uploads failed with "new row violates row-level
  security policy" — `upsert`'s existence check (and reading back what you just wrote) needs
  read access too. Fixed in `fix_storage_policies.sql`; any new bucket/policy set needs all four
  (`select`/`insert`/`update`/`delete`), each scoped `to authenticated`.

## Committing & releases

Commit messages **must** follow [Conventional Commits](https://www.conventionalcommits.org/)
(`type(scope): subject`, e.g. `feat(dates): add past dates screen`, `fix(ci): bump node
version`) — a `commitlint` + `husky` `commit-msg` hook rejects anything else at commit time.
`docs`/`chore`/`refactor`/`style`/`test`/`ci` don't trigger a release; `fix` bumps patch, `feat`
bumps minor, a `BREAKING CHANGE:` footer bumps major. See `CONTRIBUTING.md` for the full type
table and examples.

Every push to `main` runs `.github/workflows/release.yml`, which invokes `semantic-release`
(config in `.releaserc.json`). It computes the next version from commit history, regenerates
`CHANGELOG.md`, syncs the version into `package.json` and `app.json`'s `expo.version`
(`scripts/sync-version.js`), tags the commit, and publishes a GitHub Release — **fully
automated, with no human/agent step in between**. Practical implications:

- **Never hand-edit** the `version` field in `package.json`/`app.json`, and never hand-write
  new `CHANGELOG.md` entries above the `## History` heading — the next push to `main` overwrites
  them.
- Every commit you create in this repo, including one-line fixes, must use a real Conventional
  Commit type — don't write a plain-English message "to keep it quick," since the hook will
  reject it anyway.
- Pushing to `main` is not inert: if the commit's type warrants a release (`feat`/`fix`/etc.),
  it will actually tag and publish a GitHub Release. Don't push to `main` on this repo's behalf
  without the user's go-ahead, same as any other action with an externally-visible effect.
- To preview what a push would do without side effects: `npx semantic-release --dry-run` (needs
  a `GITHUB_TOKEN` env var to fully validate, but will correctly report the computed version and
  changelog before failing on the auth check).

## Design system

`src/theme/theme.ts` is the only source of colors/fonts/spacing/radii/shadows — never hardcode
a hex color or font size in a component; add a token if one doesn't exist. The app supports
light/dark mode: `theme.ts` exports `lightTheme`/`darkTheme` (same shape, different `colors`/
`shadows`), and components read the active one via `useTheme()` from `src/context/ThemeContext.tsx`
— never `import { colors } from '../theme/theme'` directly in a component, since that's always
light mode regardless of the user's preference. If you add a new color token, add it to **both**
`lightColors` and `darkColors` (matching keys), not just one. Icons are `MaterialIcons` from
`@expo/vector-icons` everywhere except the Google "G" mark on the login screen
(`MaterialCommunityIcons`'s `google` glyph). Before using a new icon name, grep
`node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialIcons.json`
to confirm it exists — don't guess.

## Photo uploads

Profile avatars and per-date cover photos both go through `src/lib/imageUpload.ts`'s
`pickAndUploadImage(bucket, path)` — pick, downscale/compress, upload to Supabase Storage,
return a public URL (or `null`, never a throw). Reuse this helper for any new photo-upload
surface rather than re-implementing the pick/compress/upload sequence; if you need a new bucket,
add it under `UploadBucket` and give it the same four-policy (`select`/`insert`/`update`/
`delete`) RLS treatment described above.
