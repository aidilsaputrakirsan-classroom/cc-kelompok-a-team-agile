# Market Pulse Admin

Admin dashboard for managing market data, commodity prices, and supporting master data.

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS
- shadcn/ui + Radix UI
- Vitest + Testing Library
- Playwright

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+ (recommended)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open in browser:

```text
http://localhost:5173
```

## Available Scripts

- Start dev server:

```bash
npm run dev
```

- Build for production:

```bash
npm run build
```

- Build in development mode:

```bash
npm run build:dev
```

- Preview production build locally:

```bash
npm run preview
```

- Run lint:

```bash
npm run lint
```

- Run tests once:

```bash
npm run test
```

- Run tests in watch mode:

```bash
npm run test:watch
```

## Project Structure

```text
src/
	components/      Reusable UI and layout components
	contexts/        App-level context providers (auth, data, theme)
	hooks/           Custom React hooks
	lib/             Utility helpers
	pages/           Route-level pages
	test/            Test setup and test files
	types/           Shared TypeScript types
```

## Notes

- The dev server has been verified to start successfully on this project.
- If you see a Browserslist warning, update it with:

```bash
npx update-browserslist-db@latest
```

- `npm audit` may report vulnerabilities from transitive dependencies. Review and fix carefully:

```bash
npm audit
npm audit fix
```
