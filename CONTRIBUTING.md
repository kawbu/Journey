# Contributing

This is a solo/personal project, but the workflow below is documented so it's consistent even
with one contributor — and so it's easy to onboard a second one later.

For setup instructions (installing dependencies, Supabase, running the app), see
[README.md](./README.md). For architecture and design decisions, see [DESIGN.md](./DESIGN.md).

## Before you start

```bash
npm install    # also installs the commit-msg git hook via husky's "prepare" script
```

Always verify a change before considering it done:

```bash
npx tsc --noEmit                        # type-check
npx expo export --platform ios          # confirm the bundle builds
npx expo start --ios                    # run it for real on a simulator
```

If the change touches Supabase schema, see [README.md's Supabase setup](./README.md#supabase-setup)
for the migration workflow (`db push --dry-run` → `db push` → regenerate types).

## Commit message format

Every commit message must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(optional-scope): subject

optional longer body

optional footer(s)
```

This is enforced locally — a `commitlint` git hook (installed by husky) rejects a malformed
commit message before it's even created. It's not just style: the `type` you choose directly
drives the automated release described below.

**Common types:**

| Type | Use for | Triggers on release |
|---|---|---|
| `feat` | A new feature or user-facing capability | Minor version bump (`1.2.0` → `1.3.0`) |
| `fix` | A bug fix | Patch version bump (`1.2.0` → `1.2.1`) |
| `docs` | Documentation only (README, DESIGN.md, comments) | No release |
| `chore` | Tooling, dependency bumps, config — no source behavior change | No release |
| `refactor` | Code change that neither fixes a bug nor adds a feature | No release |
| `perf` | A performance improvement | Patch version bump |
| `style` | Formatting only, no logic change | No release |
| `test` | Adding or correcting tests | No release |
| `ci` | Changes to `.github/workflows/*` or other CI config | No release |
| `revert` | Reverts a previous commit | Depends on what's reverted |

A footer of `BREAKING CHANGE: <description>` (in any commit type) triggers a **major** version
bump instead, regardless of the type prefix.

**Examples:**

```
feat(dates): add Past Memories screen with search and date-range filtering

fix(notifications): guard expo-notifications import on Android + Expo Go

docs: document the past-dates screen in DESIGN.md

chore: add semantic-release and commitlint tooling
```

Scope is optional — omit it (`feat: add past dates screen`) if there's no obviously narrower
area the change belongs to.

## Releases & versioning

Versioning is fully automated with [semantic-release](https://semantic-release.gitbook.io/) —
this is *why* commit message format matters (see above).

- Every push to `main` triggers `.github/workflows/release.yml`, which runs `semantic-release`.
- It inspects every commit since the last release, determines the next version from the
  highest-impact commit type in that range (see the table above), and if a release is warranted,
  automatically:
  - updates `CHANGELOG.md` with generated release notes,
  - syncs the new version into both `package.json` and `app.json`'s `expo.version`
    (`scripts/sync-version.js`),
  - commits those changes back to `main` (`chore(release): x.y.z [skip ci]`), tags the commit,
    and publishes a GitHub Release.
- **Never hand-edit the version** in `package.json` or `app.json`, and never hand-write new
  `CHANGELOG.md` entries above the `## History` heading — both are overwritten/prepended by the
  next automated release. Just write a properly-typed commit message and let the workflow do
  the rest.
- To preview what the next release would compute, without tagging or publishing anything:
  ```bash
  npx semantic-release --dry-run
  ```
- Config lives in `.releaserc.json`; the commit-linting rules are in `commitlint.config.js`.
