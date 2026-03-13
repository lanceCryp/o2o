# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Next.js application deployed on Cloudflare Workers using `@opennextjs/cloudflare`.

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Type check (runs build + tsc)
pnpm check

# Lint
pnpm lint

# Deploy to Cloudflare
pnpm deploy

# Preview production build locally
pnpm preview

# Generate Cloudflare types
pnpm cf-typegen
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Deployment**: Cloudflare Workers via `@opennextjs/cloudflare`
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/postcss`)
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm
- **ORM**: Drizzle ORM

### Project Structure
- `src/app/` - Next.js App Router pages and layouts
- `src/app/layout.tsx` - Root layout with Geist fonts and Tailwind
- `src/app/page.tsx` - Home page
- `src/app/globals.css` - Global styles with Tailwind imports
- `open-next.config.ts` - OpenNext Cloudflare configuration
- `wrangler.jsonc` - Cloudflare Workers configuration
- `env.d.ts` - TypeScript types for Cloudflare environment (generated)
- `next.config.ts` - Next.js config with OpenNext dev initialization
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `eslint.config.mjs` - ESLint configuration extending Next.js defaults

### Path Aliases
- `@/*` maps to `./src/*`

### Important Notes
- The `@opennextjs/cloudflare` package enables `getCloudflareContext()` in development via `initOpenNextCloudflareForDev()` in `next.config.ts`
- R2 incremental cache is available but commented out in `open-next.config.ts`
- Compatibility flags: `nodejs_compat`, `global_fetch_strictly_public`
- Assets are bound via `ASSETS` binding in Wrangler config
- Cloudflare types are generated to `env.d.ts` and `worker-configuration.d.ts`
