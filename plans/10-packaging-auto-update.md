# Commit 10: Packaging and auto-update

## Commit message

```
chore: configure packaging and auto-update
```

## Overview

Configure Electron Forge makers (DMG, deb, rpm, Squirrel/NSIS for Windows), add `@electron-forge/publisher-github`, wire `update-electron-app` in main for GitHub Releases, add platform icons under `assets/icons/`, and document that **macOS auto-updates require code signing and notarization**.

## Prerequisites

- App runs and builds from [prior commits](./09-theme-menus-persistence.md).
- GitHub repo for releases (optional for local `make` only).

## Files to create

| Path                      | Description                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `src/main/auto-update.ts` | Import `update-electron-app` and call it when `app.isPackaged` (or per package docs). |
| `assets/icons/icon.icns`  | macOS icon.                                                                           |
| `assets/icons/icon.ico`   | Windows icon.                                                                         |
| `assets/icons/icon.png`   | Linux / generic (512×512 or multi-size).                                              |

## Files to modify

| Path                | Changes                                                                                                                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `forge.config.ts`   | Add `makers`: `@electron-forge/maker-dmg`, `@electron-forge/maker-deb`, `@electron-forge/maker-rpm`, `@electron-forge/maker-squirrel` **or** `@electron-forge/maker-wix` / `@electron-forge/maker-zip` per platform support matrix. |
| `forge.config.ts`   | `publishers`: `@electron-forge/publisher-github` with `owner`, `repo`, OAuth token via env in CI only.                                                                                                                              |
| `forge.config.ts`   | `packagerConfig.icon` paths per OS.                                                                                                                                                                                                 |
| `package.json`      | `build`/`make` scripts; `repository` field for publisher.                                                                                                                                                                           |
| `src/main/index.ts` | Import `./auto-update` after `app.whenReady()` (or conditional).                                                                                                                                                                    |

## Dependencies to install

```bash
npm install @electron-forge/maker-dmg @electron-forge/maker-deb @electron-forge/maker-rpm @electron-forge/maker-squirrel @electron-forge/publisher-github update-electron-app
```

(Adjust makers to Forge v7 compatible names; verify with `npm create electron-app` template version.)

## Implementation details

### `update-electron-app`

- Typical pattern:
  ```ts
  import updateElectronApp from 'update-electron-app';
  updateElectronApp();
  ```
- Only runs in packaged builds; requires `GITHUB_TOKEN` or public repo for electron-updater feed.

### Icons

- Source a single branded PNG; generate `.icns` / `.ico` via `electron-icon-builder` or design tools (document in README).

### GitHub publisher

- `authToken: process.env.GITHUB_TOKEN` in CI for release workflow only — **never** commit tokens.

### macOS signing

- Document in README: Apple Developer ID, hardened runtime, notarization, and that unsigned DMGs won’t auto-update.

## Verification

- [ ] `npm run make` produces artifacts under `out/` for your OS (full matrix on CI in Commit 11).
- [ ] Packaged app launches; icon appears in dock/taskbar.
- [ ] (Optional) Draft GitHub release with assets manually to test updater.

## Commit checklist

- [ ] `assets/icons/*` committed or documented if git-LFS.
- [ ] README “Packaging” section references signing requirements.
