# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js 14 App Router project. Application code lives under `src/`.

- `src/app/`: routes, layouts, and API handlers (`src/app/api/*`).
- `src/components/`: shared UI, marketing, layout, auth, and dashboard components.
- `src/lib/`: environment parsing, auth helpers, Supabase clients, and utilities.
- `src/repositories/` and `src/services/`: data access and domain-level orchestration.
- `src/types/` and `src/validators/`: TypeScript domain types and Zod schemas.
- `supabase/migrations/`: SQL schema migrations.

There is no dedicated test directory yet. Add new tests close to the feature they validate or introduce a `src/__tests__/` structure if test coverage expands.

## Build, Test, and Development Commands
- `npm run dev`: start the Next.js dev server.
- `npm run build`: create a production build.
- `npm run start`: run the production build locally.
- `npm run typecheck`: run TypeScript without emitting files.
- `npm run lint`: run Next.js ESLint checks.

Use `npm run typecheck` and `npm run build` before opening a PR.

## Coding Style & Naming Conventions
Use TypeScript and functional React components. Prefer 2-space indentation in JSX-heavy files and keep code ASCII unless a file already requires Unicode.

Naming patterns:
- Components and layouts: `PascalCase`
- Functions, variables, hooks: `camelCase`
- Route folders: lowercase, Next.js convention-based
- Files: kebab-case for route files only when framework-driven; otherwise match existing component names

Styling is done with Tailwind CSS. Reuse existing primitives in `src/components/ui/` before adding new variants.

## Testing Guidelines
There is no test runner configured yet. For now, treat `npm run typecheck`, `npm run lint`, and `npm run build` as the minimum validation set. If you add tests, use clear names such as `feature-name.test.ts` and keep them deterministic.

## Commit & Pull Request Guidelines
This repository has no commit history yet, so use short imperative commit messages, for example: `Add provider analytics page`.

PRs should include:
- a concise summary of the change
- affected routes or modules
- setup or migration notes if applicable
- screenshots or short recordings for UI changes
- linked issue or task reference when available

## Security & Configuration Tips
Do not commit real secrets. Keep Supabase credentials in `.env.local` and update `.env.example` when configuration changes. SQL changes belong in `supabase/migrations/`, and API/auth changes should be checked against role-based access rules in `middleware.ts` and `src/lib/auth.ts`.
