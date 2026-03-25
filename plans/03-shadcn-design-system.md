# Commit 3: shadcn/ui design system and tokens

## Commit message

```
feat: add shadcn/ui components and design system tokens
```

## Overview

Initialize shadcn/ui (New York style, default dark theme) targeting `src/renderer/`, add the listed Radix-based components, define light/dark CSS variables aligned with the Developer Tool palette (including `--success` and `--warning`), and load Inter + JetBrains Mono variable fonts for UI and monospace env content.

## Prerequisites

- [Commit 2](./02-dev-tooling.md) completed: Tailwind v4, ESLint/Prettier, path aliases, renderer imports `globals.css`.

## Files to create

| Path | Description |
|------|-------------|
| `components.json` | shadcn config (style: new-york, paths under `src/renderer`). |
| `src/renderer/components/ui/*` | Generated shadcn components (button, badge, select, dialog, alert-dialog, input, label, checkbox, table, command, tooltip, popover, dropdown-menu, scroll-area, separator, sonner, skeleton, progress). |

**Component count note:** The reference lists 16 named primitives; the list includes **17** names (`button` … `progress`). Implement **all listed** — treat “16 components” as the core set plus sonner/skeleton as needed; ensure **button, badge, select, dialog, alert-dialog, input, label, checkbox, table, command, tooltip, popover, dropdown-menu, scroll-area, separator, sonner, skeleton, progress** are present per project choice (merge overlapping “16” with README in repo).

## Files to modify

| Path | Changes |
|------|---------|
| `src/renderer/styles/globals.css` | shadcn theme tokens (`:root`, `.dark`), `@layer base` for border-radius and body; add `--success`, `--warning` (and map to utilities if using `@theme`). |
| `src/renderer/main.tsx` (or entry) | Wrap app with any required providers (e.g. `TooltipProvider`); import `@fontsource/inter` and `@fontsource-variable/jetbrains-mono`; apply `font-sans` / `font-mono` classes per design. |
| `package.json` | Dependencies from shadcn CLI + `@fontsource/inter`, `@fontsource-variable/jetbrains-mono`. |

## Dependencies to install

```bash
npm install @fontsource/inter @fontsource-variable/jetbrains-mono
npx shadcn@latest init
```

Then add components (example — run per component or use CLI prompts):

```bash
npx shadcn@latest add button badge select dialog alert-dialog input label checkbox table command tooltip popover dropdown-menu scroll-area separator sonner skeleton progress
```

Install peer deps the CLI reports (typically `class-variance-authority`, `clsx`, `tailwind-merge`, Radix packages, `lucide-react`, `cmdk` for command, etc.).

## Implementation details

1. **shadcn init**
   - Style: **New York**.
   - Base color: **Slate** or neutral that maps to the reference palette.
   - CSS variables: **Yes**.
   - Paths: components → `src/renderer/components`, utils → `src/renderer/lib/utils`, etc., per CLI.

2. **Design tokens (reference palette)**

   **Dark**
   - Background `#0F172A`, card `#1E293B`, border `#334155`, foreground `#F8FAFC`, muted `#94A3B8`.

   **Light**
   - Background `#F8FAFC`, card `#FFFFFF`, border `#E2E8F0`, foreground `#0F172A`, muted `#64748B`.

   **Semantic**
   - Primary `#3B82F6`, destructive `#EF4444`, success `#22C55E`, warning `#F59E0B`.
   - Radius: `--radius: 0.5rem`.

   Map these into `:root` / `.dark` HSL or OKLCH variables as shadcn expects (`--background`, `--foreground`, `--card`, `--border`, `--primary`, `--destructive`, plus custom `--success`, `--warning`).

3. **Fonts**
   - Import in `main.tsx`:
     ```ts
     import '@fontsource/inter/400.css';
     import '@fontsource/inter/500.css';
     import '@fontsource/inter/600.css';
     import '@fontsource-variable/jetbrains-mono/index.css';
     ```
   - Tailwind `theme` / `@theme`: set `--font-sans` to Inter, `--font-mono` to JetBrains Mono variable.

4. **Smoke test page**
   - Temporary route or `App.tsx` fragment: render `Button`, `Badge`, `Select`, `Input` to verify theme and focus rings.

## Verification

- [ ] `npm run lint` and `npm run typecheck` pass.
- [ ] `npm start`: window shows shadcn-styled controls; toggling `.dark` on `<html>` (DevTools) switches light/dark tokens correctly.
- [ ] Success/warning colors visible on test badges or inline styles using CSS variables.

## Commit checklist

- [ ] `components.json` and all UI components committed.
- [ ] `globals.css` contains full token set including `--success` / `--warning`.
- [ ] Fonts load without FOUT issues (acceptable for dev).
