# Our Journey — Design Doc

**Our Journey** — a couples' date-planning app. Two partners share a single "journey": a
chronological itinerary of full-day dates (each made of multiple timed stops), a live map of
those stops, a shared bucket list of date ideas, and notifications that keep both partners in
sync.

Native mobile app built with **Expo (React Native, SDK 57) + TypeScript**, backed by
**Supabase** (Postgres + Auth + Realtime). Originally scaffolded from Stitch-generated UI
designs (`stitch_romantic_date_itinerary_map/`) under the visual design system name
**"Twilight & Ember"** (warm terracotta/cream palette — see §3), and implemented screen-by-screen
from there.

---

## 1. Product model

The core relationship is:

```
journey  (one per couple)
  └─ journey_members   (exactly 2 people max, enforced at the DB level)
  └─ date_entries      (many — each one full "day" of a date)
       └─ stops        (many — breakfast, a walk, a movie, etc., each with a time + map pin)
  └─ journey_bucket_status  (which bucket-list ideas this couple has checked off)
notification_preferences  (per-profile, not per-journey — each partner's alerts are independent)
bucket_items             (global, read-only catalog of date ideas — not owned by any journey)
```

A **journey** is not a single date — it's the durable, ongoing shared space a couple plans
*all* their dates within. Every new sign-up gets their own solo journey automatically; inviting
a partner merges the two into one (see §4).

---

## 2. Screens & navigation

Two top-level navigators, switched automatically based on auth state:

- **Unauthenticated** (`AuthNavigator`): `Login` → `SignUp`, both full screens matching the
  Stitch "Welcome Back" design (email/password, show/hide password, "Continue with Google"
  stub, Forgot-password stub).
- **Authenticated** (`RootNavigator`): a bottom-tab navigator (`Dates`, `Map`, `BucketList`,
  `Profile`) plus a `PlanDate` screen presented as a modal from any tab.

`RootNavigator` itself is the auth gate — it reads `useAuth()` and renders `AuthNavigator` or
the authenticated stack depending on `isAuthenticated`/`isLoaded`, so there's no separate
"splash while checking session" screen; it just resolves once Supabase's session restore
finishes.

| Screen | Purpose |
|---|---|
| `DatesScreen` | "Upcoming Dates" — a card per `date_entry`, each showing its cover image, date, title, and a chronological timeline of stops (tap a stop to toggle completed). "View Complete Map" jumps to the Map tab pre-filtered to that date. |
| `PastDatesScreen` | "Past Memories" — a scrapbook-style feed of every `date_entry` whose date has already passed, each rendered as a slightly rotated `MemoryCard` (cover image, title, date, and a category pill). Supports a title search, a horizontal row of activity-type filter chips, and a calendar icon opening `DateRangeFilterModal` to filter by a from/to date range. Reached via a "Past Memories" row in `MenuSheet` rather than a 5th bottom tab or screen-level button — kept consistent with how the app already funnels secondary destinations (Invite Partner, Reminders, Settings, Help) through that same menu. |
| `MapScreen` | Live map (`react-native-maps`) with **numbered pins** (1, 2, 3…) in stop order, a dashed route line connecting them, a horizontal date-switcher, and a floating "current stop" detail card with a directions button. |
| `PlanDateScreen` | Create or edit a date entry: title, date picker, and a dynamic list of stops (time, location — searched live via OpenStreetMap Nominatim or dropped as a pin on a map — and activity type). Doubles as the edit screen (pre-fills from an existing entry) with a delete option. |
| `BucketListScreen` | Bento-grid of curated date ideas (global catalog), filterable by category, each with a "Plan This" button (prefills `PlanDateScreen`) and a checkmark badge to mark it done together. |
| `ProfileScreen` | Stats (dates planned, stops, memories made), settings list (Relationship Details, Notifications, Privacy, Help), Sign Out. |
| `InvitePartnerModal` (a.k.a. "Relationship Details") | Generate/share a 6-character invite code, redeem a partner's code, see who you're sharing your journey with, and set/edit the relationship's anniversary date. |
| `NotificationsSettingsModal` | Five toggles: new date plans, anniversary reminders, 24h/1h date reminders, shared bucket-list updates. Autosaves per-toggle (no separate Save button, matching the rest of the app's interaction style). |

---

## 3. Visual design system

Theme tokens live in `src/theme/theme.ts` and are the single source of truth — no screen
invents its own colors/fonts.

- **Palette** ("Twilight & Ember"): warm terracotta primary (`#97422a`), cream/beige surfaces
  (`#fdf9f4` background), deep-rose tertiary, espresso text instead of true black. Full token
  set: `colors`, `radii` (4→9999), `spacing` (8px base unit), `shadows.sunsetGlow` (a soft,
  warm-tinted shadow used on almost every card).
- **Typography**: `Libre Caslon Text` (serif) for display/headline text — titles, wordmarks,
  quotes; `Be Vietnam Pro` (sans) for body/label text. Loaded via `@expo-google-fonts/*` and
  gating `App.tsx`'s render until both font families resolve.
- **Iconography**: `@expo/vector-icons`'s `MaterialIcons` exclusively (one exception:
  `MaterialCommunityIcons`'s `google` glyph, tinted brand-blue, used in place of a bundled
  Google logo asset on the Login screen — avoids shipping an extra image file).
- **Shape language**: rounded everything — `radii.xl`/`xxl` for cards and modals, `radii.full`
  for buttons and pills, soft circular avatars.

---

## 4. Data & backend (Supabase)

### Schema (chronological migrations in `supabase/migrations/`)

1. **`initial_schema`** — `profiles`, `journeys`, `journey_members`, `date_entries`, `stops`,
   `bucket_items`, all with RLS. A `handle_new_user()` trigger on `auth.users` insert creates
   the new account's `profiles` row.
2. **`auto_create_journey_on_signup`** — extends that trigger so every sign-up *also* gets a
   solo `journeys` row + `journey_members` (role `owner`) row, atomically, server-side. This
   matters because if email confirmation is enabled, the client never gets a live session
   immediately after `signUp()` — doing journey creation client-side would race against RLS.
3. **`journey_invites`** — the partner-invite flow. A `create_invite()` SECURITY DEFINER RPC
   generates a 6-character code for the caller's journey (refusing if already partnered); a
   `redeem_invite(code)` RPC validates the code, **migrates the joiner's existing solo-journey
   dates into the target journey**, retires their now-empty old journey, and adds them as a
   member — all in one transaction with a row lock. A trigger hard-caps every journey at
   **exactly two members** (defense in depth, not just an app-level check).
4. **`journey_profiles_and_realtime`** — fixes a real bug: `profiles` could originally only be
   read by its own owner, so looking up a partner's name/email via
   `journey_members → profiles` silently returned `null` (RLS dropped the joined row, it didn't
   error). Added a policy letting journey co-members read each other's profile. Also adds
   `journey_members`/`date_entries`/`stops` to the Realtime publication.
5. **`notifications_and_bucket_status`** — `journeys.anniversary_date`, the per-profile
   `notification_preferences` table (5 booleans, defaults matching the design exactly),
   `journey_bucket_status` (a couple's "checked off" bucket-list ideas — presence of a row
   *is* the checked state; unchecking deletes the row rather than flipping a boolean, so
   `checked_by`/`checked_at` never go stale).

Every table uses Row Level Security. The recurring pattern is a `SECURITY DEFINER` SQL helper,
`is_journey_member(journey_id)`, referenced from nearly every policy — this avoids the
infinite-recursion problem you'd get from a `journey_members` policy that queries
`journey_members` directly.

### Client data layer

Four React contexts, layered so each can depend on the ones "below" it:

```
AuthProvider
  └─ BucketListProvider     (needs journeyId from Auth)
       └─ NotificationsProvider   (needs useBucketList() for notification title lookups)
            └─ DatesProvider      (needs useNotifications() to schedule/cancel reminders)
                 └─ NavigationContainer → RootNavigator
```

- **`AuthContext`** — wraps `supabase.auth`, exposes `session`/`userId`/`journeyId`, the current
  journey's members (`journeyMembers`, `partner`, `isPartnered`), `anniversaryDate`, and the
  invite/redeem/sign-in/up/out methods. Subscribes to Realtime on `journey_members` (so a
  partner joining shows up live) and `journeys` (so an anniversary-date edit syncs live).
- **`DatesContext`** — CRUD for `date_entries`/`stops`, mapping between DB rows (snake_case,
  Postgres `time` type) and the app's `DateEntry`/`Stop` types (camelCase, `"HH:mm"` strings).
  Stop edits are reconciled by delete-all-and-reinsert rather than diffing — simpler and
  correct at this app's scale. Realtime-subscribed per journey; every mutator also calls into
  `NotificationsContext` to (re)schedule or cancel that date's local reminders.
- **`BucketListContext`** — the global `bucket_items` catalog plus this journey's
  `checkedItemIds` (a `Set`), with an optimistic `toggleChecked()`.
- **`NotificationsContext`** — see §5.

All four contexts follow the same shape: `isLoaded` flag, optimistic-update-then-revert-on-error
mutators, and a Realtime channel per relevant table that just triggers a refetch rather than
trying to patch state precisely from the payload.

---

## 5. Notifications

Implemented with `expo-notifications` **local/scheduled notifications only** — there is no
remote-push pipeline (no Edge Function, no push-token storage, no Expo Push API calls). In
practice this means:

- ✅ Your own device can remind *you* — 24h/1h before a date (timed off that day's earliest
  stop), and a yearly anniversary reminder.
- ✅ "Partner did X" alerts fire locally on your device **while your app is open** and
  subscribed to the relevant Realtime channel (new date added, bucket item checked off) —
  effectively a client-side simulation of push.
- ❌ It does **not** notify your partner's phone if their app is closed. True cross-device push
  needs a physical device, an EAS dev-client build, push-token registration, and a server-side
  sender — a distinct, larger follow-up project.

**A platform-specific landmine worth documenting**: `expo-notifications` throws — not warns —
the instant it's imported when running on **Android inside Expo Go** (a side-effect module
inside the package calls `addPushTokenListener()` at module-load time, which throws on that
exact platform/environment combo as of SDK 53; iOS Expo Go only warns). `src/lib/pushNotifications.ts`
guards against this with a runtime check (`isRunningInExpoGo()`, the same function the package
uses internally, combined with `Platform.OS === 'android'`) that conditionally `require()`s the
module — never even loading it in the dangerous combination. Everything in
`NotificationsContext` funnels through null-safe helpers so preferences still load/save via
Supabase even when the OS-level notification calls are unavailable; the settings screen shows a
plain-language banner explaining why in that case.

---

## 6. Notable implementation decisions

- **Location search with no API key**: the "set pin on map" flow in `PlanDateScreen` offers a
  live autocomplete dropdown backed by **OpenStreetMap Nominatim** (free, no signup), debounced
  ~450ms, alongside a plain drag-the-pin fallback — chosen over Google Places Autocomplete
  specifically to avoid requiring the user to set up billing/API keys for a personal project.
- **Friendly name fallback**: `display_name` is optional at sign-up; wherever a partner's name
  is shown, a `friendlyNameFromEmail()` helper derives something readable (e.g. `jane.doe@...` →
  "Jane Doe") instead of ever rendering a literal `null`.
- **No separate "Save" buttons**: every toggle/preference in the app (stop-completed, bucket
  checkoff, notification preferences, anniversary date) autosaves immediately with optimistic
  UI and revert-on-error, rather than a deferred draft-then-save pattern — kept deliberately
  consistent app-wide rather than introducing a second interaction style for notifications.
- **Past-date category filtering with no new schema/column**: `PastDatesScreen`'s "Dinner /
  Outdoor / Cozy…"-style filter chips are derived entirely from each `date_entry`'s first stop's
  existing `activity` enum (`activityLabel`/`activityIcon` in `src/theme/activityIcons.ts`)
  rather than adding a dedicated `date_type` column — a date is "in" a category if its first
  stop's activity matches. Chosen to avoid a migration + `PlanDateScreen` changes for what the
  existing per-stop data already expresses well enough for filtering purposes.
- **Migration workflow**: every schema change in this project was written as a plain SQL file
  under `supabase/migrations/`, dry-run (`supabase db push --dry-run`), applied
  (`supabase db push`), then followed by `supabase gen types typescript --linked` to keep
  `src/lib/database.types.ts` exactly in sync with the live schema — the client is fully typed
  against real Postgres structure, not hand-maintained interfaces.

---

## 7. What's explicitly out of scope today

- Real cross-device push notifications (needs EAS dev-client + server-side sender).
- Google OAuth sign-in (`signInWithGoogle()` exists as a stub for future Supabase OAuth
  provider config).
- Editing a display name after sign-up, or any other profile-editing UI.
- More than two members per journey (hard-capped at the DB level by design — this is a couples
  app).
