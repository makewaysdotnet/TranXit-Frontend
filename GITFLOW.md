# TranXIT Frontend GitFlow

## Branches
- `main`: production-ready release branch.
- `development`: integration branch for reviewed work.
- `feature/<name>`: active implementation branches created from `development`.
- `hotfix/<name>`: urgent fixes created from `main`, then merged back into `main` and `development`.

## Working Flow
1. Fetch latest remote branches before starting work.
2. Create feature branches from `origin/development`.
3. Keep commits small and scoped by intent.
4. Run `npm run lint`, `npm run build`, and `npm audit` before pushing.
5. Push feature branches to origin and open review back into `development`.
6. Promote `development` to `main` only for release-ready builds.

Current MVP branch: `feature/web-first-mvp`.
