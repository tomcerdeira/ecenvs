# ecenvs

![WIP](https://img.shields.io/badge/status-work%20in%20progress-yellow)

`ecenvs` is a desktop app for browsing AWS ECS services and editing plain task definition environment variables on a selected container.

Current status: the repository currently contains the baseline Electron Forge + Vite + TypeScript scaffold. The ECS browsing and editing workflow described above is the intended product direction for the next commits.

## Prerequisites

- Node.js 18+ (LTS 20+ recommended)
- npm
- AWS credentials configured in `~/.aws`

## IAM Permissions

Minimum permissions required:

- `ecs:ListClusters`
- `ecs:ListServices`
- `ecs:DescribeServices`
- `ecs:DescribeTaskDefinition`
- `ecs:RegisterTaskDefinition`
- `ecs:UpdateService`

## Development

```bash
npm install
npm start
```

Additional scripts:

```bash
npm run lint
npm run package
npm run make
```

## Packaging

Local installers are produced with `npm run make`. Artifacts land under `out/make/` (for example `zip` and `dmg` on macOS).

- **Icons**: Source files live in [`assets/icons/`](./assets/icons/) (`icon.png`, `icon.icns`, `icon.ico`). Replace the placeholder artwork with your branding; large binaries can be tracked with [Git LFS](https://git-lfs.com/) if you prefer not to bloat the repo.
- **Publishing to GitHub**: `npm run publish` uploads build artifacts to GitHub Releases. In CI, set `GITHUB_TOKEN` with permission to create releases and upload assets. **Do not commit tokens**; use repository secrets only.
- **Auto-update**: The app uses [`update-electron-app`](https://github.com/electron/update-electron-app) in a packaged build, which checks [Electron’s update service](https://update.electronjs.org) for releases published from this repository. **macOS** auto-updates in production expect a **Developer ID** signed app, **hardened runtime**, and **notarization**; unsigned `.dmg` installs do not get a reliable auto-update experience.
- **Linux**: Electron’s built-in auto-updater does not support Linux; distribute `.deb`/`.rpm` through your own channels.

## Tech

- Electron Forge
- Vite
- TypeScript

## License

MIT. See [LICENSE](./LICENSE).
