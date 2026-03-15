# o2o - Private 1-on-1 Video Calls

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/)

**o2o** is a secure, private 1-on-1 video calling platform built with Next.js and deployed on Cloudflare Workers. No downloads required - just share a link and start talking.

## Features

- **End-to-End Encrypted** - Your conversations are private and secure
- **1-on-1 Focused** - Designed specifically for two-person conversations
- **No Download Needed** - Pure browser-based, works on all devices
- **Flexible Pricing** - Pay-as-you-go from $2.99, no subscription pressure
- **Instant Setup** - Create a room and share the link in seconds
- **Multi-language Support** - English and Chinese

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Deployment**: Cloudflare Workers via @opennextjs/cloudflare
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Authentication**: Clerk
- **Database**: D1 (Cloudflare)
- **ORM**: Drizzle ORM

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Cloudflare account
- Clerk account

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/o2o.git
cd o2o

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Configure your environment variables and run
pnpm dev
```

## Commands

```bash
pnpm install      # Install dependencies
pnpm dev          # Run development server
pnpm build        # Build for production
pnpm check        # Type check
pnpm lint         # Lint
pnpm deploy       # Deploy to Cloudflare
pnpm preview      # Preview production build locally
pnpm cf-typegen   # Generate Cloudflare types
```

## License

MIT License - see [LICENSE](LICENSE) for details.
