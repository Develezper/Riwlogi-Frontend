# Riwlogi Frontend

Riwlogi Frontend is a single-page application (SPA) for staged algorithmic challenges. It is a lightweight, modular frontend built with modern tooling and intended to run with Bun.

## Key technologies

- Runtime: bun (do not use npm)
- Bundler / dev server: Vite with vanilla JavaScript (ES modules)
- UI: Tailwind CSS v4
- Editor: CodeMirror 6

## Project overview

This repository implements the client-side application and includes a local problem catalog and multiple provider modes for the API so the frontend can run with or without a remote backend.

Important files and folders:
- `index.html` — app entry HTML
- `src/` — application source code
- `src/app` — app bootstrap and router
- `src/features/auth` — login/register UI and logic
- `src/features/problems` — listing, solver, editor components and editor tracking
- `src/features/leaderboard` — leaderboard view
- `src/features/profile` — profile view
- `src/shared/ui` — shared UI components (e.g. navbar)
- `src/shared/state` — global session state
- `src/shared/services/api` — API contract, remote provider, local provider and provider selector
- `src/shared/services/problem-repository.js` — local problems catalog
- `src/shared/utils` — UI and markdown utilities
- `src/shared/styles` — global styles

## Backend contract

The backend API specification used by this frontend is in:
- `docs/api-contract.md`

Review that file before connecting the app to a remote backend.

## Environment and API modes

Configuration is provided via environment variables (see `.env.example`):

- `VITE_API_MODE`:
  - `local` — use only the local provider (no backend calls)
  - `hybrid` — attempt to reach the backend on startup; if it does not respond, fall back to the local provider
  - `remote` — require a responsive remote backend; if unreachable, the app will not start
- `VITE_API_BASE` — base URL for the backend (default: `/api`)
- `VITE_DEV_API_TARGET` — proxy target for the `/api` path when running `bun run dev` (for example: `http://localhost:8000`)

When running inside Docker with an Nginx reverse proxy, the container configuration expects `/api/*` to be proxied to the backend at `http://backend:8000/api/*`.

## Security considerations

- Markdown content is sanitized before rendering.
- Unsafe URL schemes such as `javascript:` are blocked.
- Sessions include expiration and strict validation of token and user associations.

## Accessibility

The app includes several accessibility features:
- Skip link to main content
- Proper `aria-*` attributes in the mobile navbar, tabs and filters
- Live regions for toasts and result announcements
- Consistent `focus-visible` handling
- Respect for `prefers-reduced-motion`

## Development — prerequisites

- Install Bun: https://bun.sh
- Recommended editor with support for plain JS, Tailwind and CodeMirror configuration

## Local development

Install dependencies and start the dev server with Bun:

```bash
bun install
bun run dev
```

Set `VITE_API_MODE` in your environment or `.env` before running if you need `local`/`hybrid`/`remote` behavior. When developing against a backend running on localhost, set `VITE_DEV_API_TARGET` to the backend address.

## Available scripts

Run these commands via Bun:

```bash
bun run dev        # start development server (Vite)
bun run build      # build production assets
bun run lint       # run linter
bun run test       # run unit tests
bun run test:e2e   # run end-to-end tests
```

Check `package.json` for the exact script definitions.

## Docker and production

A Dockerfile and `nginx.conf` are included for building and serving the static frontend behind Nginx. The recommended production setup is to build the site and serve the generated assets from Nginx, ensuring `/api` is routed to the backend service.

## Testing and CI

- End-to-end tests are configured with Playwright (`playwright.config.js`).
- The repository includes a CI pipeline (`.github/workflows/ci.yml`) that runs Bun, linter, unit tests, e2e tests and the production build.

## Code quality and hooks

- ESLint configuration at `eslint.config.js`
- Prettier configuration at `.prettierrc.json`
- Husky is configured for local Git hooks

## Contributing

- Open issues for bugs or feature requests.
- Create pull requests against the default branch.
- Follow existing coding conventions: Bun + Vite + plain JS modules, Tailwind for styles, and linting rules in the repo.

## Where to look next

- API contract: `docs/api-contract.md`
- Local problem catalog: `src/shared/services/problem-repository.js`
- Tests: `tests/` and Playwright config in `playwright.config.js`

---

If you want, I can:
- Create a branch and open a pull request that replaces README.md with this version, or
- Apply any phrasing or structure changes you prefer (shorter intro, more examples for running in Docker, or adding badges). Tell me which option you prefer and the branch target for the PR.
