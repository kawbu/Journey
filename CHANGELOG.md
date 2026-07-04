# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/).

Starting from the next release, entries below this point are generated automatically by
[semantic-release](https://semantic-release.gitbook.io/) from
[Conventional Commit](https://www.conventionalcommits.org/) messages on every push to `main` —
see the "Releases & versioning" section in `README.md`. Everything under **History** was
written by hand before that automation existed.

## History

### [1.0.0] - 2026-07-04

### Added

- **Past Memories screen** — a dedicated view of past dates, styled as a scrapbook feed
  (design inspiration: `stitch_romantic_date_itinerary_map/past_dates`).
  - Lists every `date_entry` whose date has already passed (`DatesContext.pastDates`, sorted
    most-recent-first), each rendered as a slightly rotated `MemoryCard` with cover image,
    title, date, and a category pill.
  - **Search** by date title.
  - **Filter by date type** — a horizontal row of chips built from the existing per-stop
    `activity` enum (Dinner, Outdoor, Coffee, etc.); no new schema column, since the entry's
    first stop's activity already expresses this.
  - **Filter by date range** — a calendar icon opens `DateRangeFilterModal`, a from/to date
    picker built on the existing `PickerField` component.
  - Reached from the hamburger `MenuSheet`'s new "Past Memories" row (between "Reminders" and
    "Settings"), consistent with how other secondary destinations are surfaced in this app.

### New files

- `src/screens/PastDatesScreen.tsx`
- `src/components/MemoryCard.tsx`
- `src/components/DateRangeFilterModal.tsx`

### Changed

- `src/context/DatesContext.tsx` — added a memoized `pastDates` selector (dates with
  `date < today`, descending).
- `src/navigation/types.ts` / `src/navigation/RootNavigator.tsx` — registered a `PastDates`
  route on the root stack.
- `src/components/MenuSheet.tsx` — added a "Past Memories" row that navigates to the new
  screen.
