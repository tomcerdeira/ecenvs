# Contributing

Thanks for your interest in **ecenvs**. This document describes how to set up the project locally, propose changes, and keep commits consistent with the rest of the repo.

## Development setup

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm ci
   ```

3. Run the app in development:

   ```bash
   npm start
   ```

## Checks before you open a PR

Run these from the repository root:

```bash
npm run lint
npm run typecheck
npm test
```

Fix any ESLint issues (`npm run lint:fix` where appropriate). Formatting is enforced with Prettier (`npm run format`).

## Branching and pull requests

- Open pull requests against **`master`**.
- Keep changes focused: one logical change per PR is easier to review.
- In the PR description, note **what** changed and **why**, and link related issues if any.

### PR checklist

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] User-visible behavior is described or screenshots attached when relevant

## Commit messages

This project follows **[Conventional Commits](https://www.conventionalcommits.org/)** (e.g. `feat:`, `fix:`, `docs:`, `chore:`). Use the imperative mood (“add” not “added”) and keep the subject line around 72 characters or less.

## Code style

- **TypeScript / React**: rules live in [`eslint.config.mjs`](eslint.config.mjs) (ESLint 9 flat config).
- **Formatting**: Prettier; see [`.prettierrc`](./.prettierrc) and [`.prettierignore`](./.prettierignore).

Do not commit AWS credentials, `.env` files with secrets, or GitHub tokens.
