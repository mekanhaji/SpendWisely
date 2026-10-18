# Development

Technical setup for running, building, and deploying Spend Wisely locally.

## Prerequisites

- Node.js (LTS recommended)

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

To access the dev server from another device on your network (e.g. to test on your phone):

```bash
npm run dev:host
```

## Scripts

| Script             | Description                                     |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Start the Vite dev server                       |
| `npm run dev:host` | Start the dev server, exposed on your LAN       |
| `npm run build`    | Type-check (`tsc -b`) and build for production  |
| `npm run lint`     | Run ESLint                                      |
| `npm run preview`  | Preview the production build locally            |
| `npm run cf:dev`   | Run the build via Wrangler (Cloudflare Workers) |
| `npm run deploy`   | Deploy to Cloudflare Workers                    |

The `makefile` wraps the most common of these: `make main` (dev), `make h` (dev:host), `make b` (build), `make d` (build + deploy).

## Seeding sample data

`scripts/seed-screenshot-data.js` fills `localStorage` with the sample expenses used in `public/screenshots/narrow-1.jpg`. Open the app, paste the file's contents into the devtools console, then reload.

## Project structure

```
src/
├── store/        # Zustand stores: expenses, user settings, PWA install state
├── layout/        # App shell: header, route-driven tab navigation
├── pages/         # Home, Analytics, and Settings screens and their components
├── components/ui/ # Shared shadcn/ui (Radix-based) components
└── lib/           # Small shared utilities
```

## Deployment

The app is a static SPA served via Cloudflare Workers (no server code — see `wrangler.jsonc`).

```bash
npm run build
npm run deploy
```

Use `npm run cf:dev` to preview the Workers deployment locally before shipping.
