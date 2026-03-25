# Commit 9: Theme toggle, native menus, persistence

## Commit message

```
feat: add theme toggle, native menus, and state persistence
```

## Overview

Add Zustand `ui-store` for theme (`light` | `dark` | `system`), toggle `class="dark"` on `<html>` and sync with CSS variables. Create `src/main/menu.ts` for **File**, **Edit**, **View** (theme toggle), **Help** (About, GitHub). Persist last five profile/region/cluster/service combos and window bounds via `electron-store` in the main process.

## Prerequisites

- [Commit 3](./03-shadcn-design-system.md) tokens support light/dark.
- Commits through [8](./08-diff-secrets-clipboard.md) for a complete app shell.

## Files to create

| Path | Description |
|------|-------------|
| `src/renderer/stores/ui-store.ts` | Theme state + `setTheme`, `toggle`, persist preference to `localStorage` (optional) or rely on main. |
| `src/main/menu.ts` | `Menu.buildFromTemplate` or `Menu.setApplicationMenu`; wire accelerators. |
| `src/main/store.ts` | `electron-store` instances: `recents` (max 5), `windowState` (x, y, width, height, maximized). |

## Files to modify

| Path | Changes |
|------|---------|
| `src/main/index.ts` | Import menu; set menu after `app.ready`; on `before-quit` save window state; on launch read and `BrowserWindow` bounds. |
| `src/renderer/main.tsx` | `useEffect` to apply theme class from store; subscribe to system theme if `system` mode. |
| `src/renderer/components/layout/Header.tsx` or `Sidebar.tsx` | Theme toggle control (Sun/Moon icon). |
| Connection flow | On successful “connect” or deploy, push combo to recents via IPC `add-recent` or store from renderer with IPC. |

## Dependencies to install

```bash
npm install electron-store
```

## Implementation details

### Theme

- **View → Toggle Theme** or menu item cycles light/dark or opens submenu.
- Applying `dark` class on `document.documentElement` matches shadcn/Tailwind dark variant.

### Window state

- Use `electron-window-state` pattern manually: read store on `createWindow`, `win.on('close')` save `getBounds()`, `isMaximized()`.

### Recents

- Structure: `{ profile, region, cluster, service, container?, timestamp }[]`, dedupe by tuple, keep latest 5.
- Expose **File → Open Recent** submenu (optional) or only pre-fill connection panel.

### About / GitHub

- Help → About: `dialog.showMessageBox` with version from `app.getVersion()`.
- Help → GitHub: `shell.openExternal('https://github.com/ORG/REPO')` (placeholder URL from README).

## Verification

- [ ] Theme toggles instantly; survives reload if persisted.
- [ ] Native menus visible on macOS/Windows; accelerators work.
- [ ] Resize/move window, quit, reopen — position restored (single display caveat documented).
- [ ] Recents list updates after successful connection/deploy.

## Commit checklist

- [ ] No blocking `sync` store writes on every resize (debounce save ~500ms).
