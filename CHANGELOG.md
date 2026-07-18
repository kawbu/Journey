## [1.2.5](https://github.com/kawbu/Journey/compare/v1.2.4...v1.2.5) (2026-07-18)


### Bug Fixes

* **build:** build React Native from source to fix RNWorklets crash ([8d01254](https://github.com/kawbu/Journey/commit/8d012541fa16d75f3bcefd0e903cf04bba192295))

## [1.2.4](https://github.com/kawbu/Journey/compare/v1.2.3...v1.2.4) (2026-07-18)


### Bug Fixes

* **build:** force static framework linkage for reanimated compatibility ([c057b7d](https://github.com/kawbu/Journey/commit/c057b7d057ff2c4aa0ba43d5324d59289f857f87))

## [1.2.3](https://github.com/kawbu/Journey/compare/v1.2.2...v1.2.3) (2026-07-18)


### Bug Fixes

* **build:** add missing @react-native-community/cli dependency ([fdec5ec](https://github.com/kawbu/Journey/commit/fdec5ec4da9a7cf2440ce9ddfbb567761a36f93c))

## [1.2.2](https://github.com/kawbu/Journey/compare/v1.2.1...v1.2.2) (2026-07-18)


### Bug Fixes

* **build:** add missing babel-preset-expo dependency ([1bd282c](https://github.com/kawbu/Journey/commit/1bd282ceef60c64f109d2063ff5835772514a484))
* **ci:** fully regenerate package-lock.json from scratch ([4735550](https://github.com/kawbu/Journey/commit/4735550cfc75199ba96e166990ac53a5b357b664))

## [1.2.1](https://github.com/kawbu/Journey/compare/v1.2.0...v1.2.1) (2026-07-18)


### Bug Fixes

* **build:** add missing babel.config.js for reanimated/worklets ([bf1c182](https://github.com/kawbu/Journey/commit/bf1c182f2f74397ae7154f3b9b4ff2d674d13f02))
* **build:** pin react-native-worklets to 0.10.2 ([81af7b3](https://github.com/kawbu/Journey/commit/81af7b3e204c74fd6ce0f946f3205de8947ef568))

# [1.2.0](https://github.com/kawbu/Journey/compare/v1.1.0...v1.2.0) (2026-07-17)


### Bug Fixes

* **ci:** regenerate package-lock.json to sync with package.json ([d442ae4](https://github.com/kawbu/Journey/commit/d442ae4e63f933b1f399b88af1aeda47878c7969))


### Features

* add AI concierge date suggestions and photo memory gallery ([62350da](https://github.com/kawbu/Journey/commit/62350da8efde3168250e40a5507e02114300122f))
* **dates:** add drag-and-drop stop reordering ([b04bc95](https://github.com/kawbu/Journey/commit/b04bc954f6b87f6d1238736db0355e922a909821))
* **map:** add swipe navigation between spots ([0603e55](https://github.com/kawbu/Journey/commit/0603e55fc87a718e1d6df2f6c24bc154bbaac5fb))

# [1.1.0](https://github.com/kawbu/Journey/compare/v1.0.0...v1.1.0) (2026-07-05)


### Features

* **profile:** add dark mode, profile/date-cover photos, and settings screens ([1463677](https://github.com/kawbu/Journey/commit/14636778f6012117297aff17b52a28e4d27a9657))

# 1.0.0 (2026-07-04)


### Bug Fixes

* **ci:** bump release workflow to Node 22 ([fd7a49d](https://github.com/kawbu/Journey/commit/fd7a49d86633cbb8664f524ac7523c58a637331e))
* **ci:** regenerate package-lock.json under Node 22 ([f45b8fa](https://github.com/kawbu/Journey/commit/f45b8fa60996dce920598ea15bbddd1ed7576791))


### Features

* **dates:** add Past Memories screen and automated semantic versioning ([15377d7](https://github.com/kawbu/Journey/commit/15377d77c13d086bc6d474face9bbfcf48bb00b5))

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
