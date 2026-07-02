# AGENTS.md — HuggingFace Playground

Interactive learning platform for the HuggingFace ecosystem: browse datasets, discover models, experiment with AI APIs.

## Stack

- React + TypeScript + Vite, npm (Node `>=24`, `.nvmrc` pinned); GitHub Spark template heritage (`@github/spark`)
- Radix UI, Tailwind; services layer in `src/services/`
- Cloudflare Pages (`wrangler.toml`, project **`hug`**), output `dist/`; Pages Functions in `functions/`
- Tests: Vitest + Playwright e2e

## Commands

```bash
npm install
npm run dev          # port 5000; `npm run kill` frees it
npm run test         # vitest
npm run test:e2e     # playwright
npm run lint && npm run type-check && npm run format:check
npm run build        # tsc -b --noCheck && vite build
```

## Secrets

- `VITE_HF_TOKEN` is a wrangler Pages secret (`wrangler pages secret put VITE_HF_TOKEN --project-name=hug`). Never hardcode or log it.

## Conventions

- Conventional commits: `type(scope): description`.
- Don't commit or deploy unless explicitly asked.
