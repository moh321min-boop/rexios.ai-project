# RexiosAI Frontend

Frontend implementation for the RexiosAI industrial problem-solving marketplace.

## Tech Stack

- React 19 and TypeScript
- Vite 8
- Tailwind CSS v4
- React Router
- Vitest and React Testing Library
- Playwright
- ESLint and Prettier

## Getting Started

**Requirements:** Node.js 24 LTS recommended and npm.

```bash
npm ci
```

Create `.env.development` in the project root:

```dotenv
VITE_AUTH_MODE=mock
```

Start the development server:

```bash
npm run dev
```

Application routes:

- `/signin` — Sign in
- `/signup` — Sign up
- `/community` — Community
- `/problems` — Industrial Problems
- `/profile-setup` — Solver profile

The `/` route is intentionally blank.

## Demo Accounts

All predefined demo accounts use the password `RexiosDemo123!`.

| Role               | Email                    |
| ------------------ | ------------------------ |
| Community member   | `member@rexios.demo`     |
| Eligible solver    | `solver@rexios.demo`     |
| Incomplete solver  | `incomplete@rexios.demo` |
| Industrial company | `company@rexios.demo`    |

Authentication and permission checks are mock frontend behavior, not real security.

## Testing

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
npm run test:browser
```

If Chromium is missing:

```bash
npx playwright install chromium
```

## Production Build

```bash
npm run build
npm run preview
```

Mock login is disabled by default in normal production builds.

For an explicitly public demo build, set the following environment variables **before building**:

```dotenv
VITE_AUTH_MODE=mock
VITE_PUBLIC_DEMO=true
```

Do not put secrets in `VITE_` variables.

## Known Limitations

- No real backend or database.
- No real authentication or secure authorization.
- Mock signup accounts and application changes are temporary.
- File uploads retain local metadata only.
- AI-assisted matching is not implemented.
- Company-side problem management is not implemented.
- Google login and password recovery are unavailable.

## Project Structure

- `src/components` — Shared UI and layout components
- `src/context` — Application state
- `src/data` — Mock data
- `src/features` — Feature-specific components
- `src/lib` — Utilities and mock authentication
- `src/pages` — Routed pages
- `src/styles` — Styles and design tokens
- `public` — Static assets
- `tests/browser` — Playwright tests

For overall project information, see the original root `README.md`.
