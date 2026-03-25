# Commit 2: Dev tooling — ESLint, Prettier, Tailwind v4, path aliases

## Commit message

```
chore: configure ESLint, Prettier, Tailwind v4, and tsconfig aliases
```

## Overview

Add static analysis and formatting (`eslint`, `prettier`), `lint` / `typecheck` scripts, integrate Tailwind CSS v4 with the Vite renderer via `@tailwindcss/vite`, and configure TypeScript path aliases (`@shared/*`, `@renderer/*`) so later commits can import shared types and UI code cleanly.

## Prerequisites

- [Commit 1](./01-initial-setup.md) completed: Electron Forge + Vite + TypeScript project runs with `npm start`.

## Files to create

| Path | Description |
|------|-------------|
| `.eslintrc.cjs` or `eslint.config.js` | ESLint flat config or legacy; extend recommended TypeScript + React rules if React is already in template. |
| `.prettierrc` | Prettier options (semi, singleQuote, trailingComma, printWidth). |
| `.prettierignore` | Ignore `out/`, `dist/`, `node_modules/`, lockfiles if desired. |
| `src/renderer/styles/globals.css` | Tailwind v4 entry: `@import "tailwindcss";` and optional `@theme inline { ... }` placeholder. |

## Files to modify

| Path | Changes |
|------|---------|
| `package.json` | Add scripts: `"lint"`, `"lint:fix"`, `"typecheck"`, `"format"` (optional). Add devDependencies: `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` (if React), `prettier`, `eslint-config-prettier`, Tailwind v4 packages (see below). |
| `vite.renderer.config.ts` (or equivalent) | Add `@tailwindcss/vite` plugin to the renderer Vite config. |
| `src/renderer/**/*` entry (e.g. `main.tsx` or `index.tsx`) | Import `./styles/globals.css` (or correct relative path). |
| `tsconfig.json` and/or `tsconfig.renderer.json` | Add `paths`: `"@shared/*": ["src/shared/*"]`, `"@renderer/*": ["src/renderer/*"]` (adjust to match actual `src` layout). |
| `vite.renderer.config.ts` | Add `resolve.alias` mirroring `@shared` and `@renderer` so Vite resolves them. |

**Note:** Create `src/shared/` as an empty folder (or add `src/shared/.gitkeep`) so `paths` resolve even before Commit 4.

## Dependencies to install

```bash
npm install -D tailwindcss @tailwindcss/vite prettier eslint prettier eslint-config-prettier
```

Use TypeScript ESLint v8 compatible with your ESLint version:

```bash
npm install -D typescript-eslint @eslint/js
```

Add React plugins only if the renderer uses React.

## Implementation details

1. **Tailwind v4**
   - Install `@tailwindcss/vite`.
   - In renderer Vite config: `import tailwindcss from '@tailwindcss/vite'` and `plugins: [tailwindcss()]`.
   - In `globals.css`: start with:
     ```css
     @import "tailwindcss";
     ```
   - Optionally add a minimal `@theme inline { }` block later; shadcn commit will expand this.

2. **ESLint**
   - Configure for TypeScript; include `src/main`, `src/preload`, `src/renderer` (and `src/shared` when files exist).
   - Extend `eslint-config-prettier` last to avoid conflicts with Prettier.

3. **Prettier**
   - Add `.prettierrc` with team defaults; run `npx prettier --write .` once on tracked files (optional in this commit).

4. **Path aliases**
   - `tsconfig`: `baseUrl` + `paths` for `@shared/*` and `@renderer/*`.
   - Vite: `resolve.alias` with `path.resolve` or `fileURLToPath` for `__dirname` in ESM configs.

5. **Empty `src/shared`**
   - Add `src/shared/.gitkeep` so the folder exists.

## Verification

- [ ] `npm run lint` exits 0 (fix any template issues or add minimal overrides).
- [ ] `npm run typecheck` passes (add script: `tsc --noEmit` or use project references).
- [ ] `npm start` still works; renderer shows Tailwind styles if you add a test class (e.g. `className="bg-red-500 p-4"` on a div).

## Commit checklist

- [ ] `.gitignore` still excludes `node_modules` and build dirs.
- [ ] No secrets committed.
- [ ] Lint + typecheck + start verified.
