# Commit 1: Initial setup — Electron Forge + Vite + TypeScript

## Commit message

```
chore: scaffold Electron Forge + Vite + TypeScript project
```

## Overview

Bootstrap a minimal Electron application using Electron Forge with the Vite + TypeScript template, add a root `.gitignore` suitable for Node/Electron builds, and establish `README.md` plus MIT `LICENSE` so the repo is ready for the first commit.

## Prerequisites

- Node.js 18+ (LTS 20+ recommended) and npm installed.
- Repository root is `/Users/tomcerdeira/Documents/ecenvs` (or your clone). If the directory is not empty except `.git`, move or remove conflicting files before scaffolding, or scaffold into a subfolder and move files up per team preference.

## Files to create

| Path         | Description                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| `.gitignore` | Ignore `node_modules/`, build outputs, caches, OS junk, env files, coverage, and packaged installers. |
| `README.md`  | Project name, WIP badge, purpose, prerequisites, IAM permissions, dev commands, license line.         |
| `LICENSE`    | MIT license text (year + copyright holder).                                                           |

After running the scaffold, Electron Forge will also create (names may vary slightly by template version):

- `package.json`, `package-lock.json`
- `forge.config.ts` (or `.js`)
- `src/` with main, preload, and renderer entry points for Vite
- `vite.*.config.ts` files
- `tsconfig.json` (and possibly nested configs)

## Files to modify

- None before scaffold. After scaffold, you may only need to adjust `package.json` `name`, `description`, and `author` if the template used placeholders.

## Dependencies to install

No extra packages beyond what `npm create electron-app` installs. Run:

```bash
npm create electron-app@latest . -- --template=vite-typescript
```

If the tool refuses a non-empty directory, use an empty temp folder and copy results, or run with `--force` if the CLI supports it.

## Implementation details

1. **Scaffold**
   - From repo root: run the `create-electron-app` command above.
   - Accept defaults where reasonable; the goal is a working Forge + Vite + TS skeleton.

2. **`.gitignore`** — ensure these patterns exist (merge with template output if duplicate):

   ```
   node_modules/
   dist/
   out/
   .vite/
   .eslintcache
   .DS_Store
   Thumbs.db
   *.log
   npm-debug.log*
   .env
   .env.local
   .env.*.local
   !.env.example
   coverage/
   *.dmg
   *.AppImage
   *.exe
   *.deb
   *.rpm
   .idea/
   .vscode/*
   !.vscode/extensions.json
   ```

3. **`README.md`** — include at minimum:
   - Title: e.g. **sync-ecs-envs** (or final repo name).
   - Badge: `![WIP](https://img.shields.io/badge/status-work%20in%20progress-yellow)` or similar.
   - One paragraph: desktop app to browse AWS ECS and edit task definition **plain** environment variables on a selected container.
   - **Prerequisites**: Node 18+, AWS credentials in `~/.aws` (profiles).
   - **IAM** (minimum): `ecs:ListClusters`, `ecs:ListServices`, `ecs:DescribeServices`, `ecs:DescribeTaskDefinition`, `ecs:RegisterTaskDefinition`, `ecs:UpdateService`.
   - **Dev**: `npm install`, `npm start` (or whatever scripts the template adds — document the exact commands from `package.json`).
   - **Tech** (brief): Electron, Vite, TypeScript (more added in later commits).
   - **License**: MIT (point to `LICENSE`).

4. **`LICENSE`**
   - Standard MIT text; set `Copyright (c) <year> <Your Name or Org>`.

5. **Electron launch**
   - If `require('electron')` fails or `app` is undefined, document clearing `ELECTRON_RUN_AS_NODE` (many templates add `env -u ELECTRON_RUN_AS_NODE` in `npm start`).

## Verification

- [ ] `npm install` completes without errors.
- [ ] `npm start` (or documented script) opens an Electron window with the default template UI.
- [ ] No secrets or `node_modules/` in the index you intend to commit (`git status` clean except intended files).

## Commit checklist

- [ ] `.gitignore`, `README.md`, `LICENSE` present; scaffold files committed.
- [ ] App runs (`npm start`).
- [ ] Verification steps above pass.
