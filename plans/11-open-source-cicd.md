# Commit 11: Open source, CI/CD, issue templates

## Commit message

```
docs: add full README, CONTRIBUTING, and CI/CD pipelines
```

## Overview

Finalize the repo for open source: expand `README.md` with screenshots/GIF, features, downloads, architecture, IAM table; add `CONTRIBUTING.md`; add GitHub Actions workflows for CI (lint + typecheck + test on three OSes), build artifacts on `main`, and release on `v*` tags; add issue templates for bugs and features.

## Prerequisites

- [Commit 10](./10-packaging-auto-update.md) completed.
- Repository on GitHub with Actions enabled.

## Files to create

| Path                                        | Description                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| `CONTRIBUTING.md`                           | Dev setup, branch strategy, PR checklist, Conventional Commits, code style pointers.  |
| `.github/workflows/ci.yml`                  | On `pull_request` and `push` to `main`: lint, typecheck, test (add tests if present). |
| `.github/workflows/build.yml`               | On `push` to `main`: build Electron artifacts, upload artifacts.                      |
| `.github/workflows/release.yml`             | On tag `v*`: build, publish to GitHub Releases (Forge publish).                       |
| `.github/ISSUE_TEMPLATE/bug_report.md`      | YAML frontmatter + body sections.                                                     |
| `.github/ISSUE_TEMPLATE/feature_request.md` | YAML frontmatter + body sections.                                                     |

## Files to modify

| Path        | Changes                                                                                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `README.md` | Full documentation: hero, badges, screenshots, feature list, install from releases, build from source, architecture diagram (mermaid or image), IAM permissions table, troubleshooting, license. |

## Dependencies to install

None at repo level; CI uses `actions/setup-node`, `npm ci` or `npm install`.

## Implementation details

### README sections

1. **Title + badges** — build, license, release.
2. **Demo** — GIF or static screenshots.
3. **Features** — bullet list (connection cascade, env CRUD, import/export, deploy, diff, secrets, themes, etc.).
4. **Download** — link to latest GitHub Release.
5. **Prerequisites** — Node, AWS credentials, IAM policy table.
6. **Development** — clone, install, `npm start`, `npm run lint`.
7. **Architecture** — diagram: main process ↔ preload ↔ renderer; AWS SDK in main only.
8. **Security** — credentials stay local; no backend.
9. **Contributing** — link to `CONTRIBUTING.md`.

### `ci.yml` matrix

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
```

Steps: checkout, setup Node, `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` (add script or skip if no tests yet with `continue-on-error` — prefer adding a minimal smoke test).

### `build.yml`

- Run `npm run make` or `electron-forge make` with caching for `node_modules`.
- Upload `out/make/**` as artifacts.

### `release.yml`

- Trigger: `push` tags matching `v*`.
- Set `GITHUB_TOKEN` for `electron-forge publish` / publisher-github.
- Require secrets: `GITHUB_TOKEN` (default), optional `APPLE_*` for signing (future).

### Issue templates

- `.github/ISSUE_TEMPLATE/config.yml` with `blank_issues_enabled: false` (optional).

## Verification

- [ ] Open a PR — CI workflow runs green.
- [ ] Push tag `v0.0.0-test` on a fork — release workflow runs (or dry-run locally with `act` if used).
- [ ] README renders correctly on GitHub.

## Commit checklist

- [ ] No real AWS keys or tokens in repo.
- [ ] `CONTRIBUTING.md` references Conventional Commits and ESLint/Prettier.
- [ ] All three workflows valid YAML (lint with `actionlint` optional).
