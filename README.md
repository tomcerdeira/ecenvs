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

## Tech

- Electron Forge
- Vite
- TypeScript

## License

MIT. See [LICENSE](./LICENSE).
