# Echoray Monorepo

Modern monorepo for Echoray web platform and microapplications.

## Structure

- `apps/web` - Main Next.js application (Cloudflare Workers)
- `apps/microapps` - Independent microapplications
  - `webscan` - Web scanning microapp (Vite + React)
  - `lead-ai` - Lead AI microapp (Next.js)
- `packages/ui` - Shared UI components (shadcn/ui)
- `packages/database` - Convex database schema & utilities
- `packages/config` - Shared TypeScript/ESLint configs
- `packages/utils` - Shared utility functions

## Quick Start

```bash
# Install dependencies
pnpm install

# Run web app
pnpm dev:web

# Build for production
pnpm build:web

# Deploy to Cloudflare
cd apps/web && pnpm deploy
```

## Development

### Adding a new microapp

1. Create directory: `apps/microapps/[app-name]`
2. Add package.json with workspace dependencies
3. Add to pnpm-workspace.yaml (if not already covered by glob)
4. Run `pnpm install` from root

### Using shared packages

```typescript
// Use shared UI components
import { Button } from '@echoray/ui/components/button'

// Use shared utilities
import { emailSchema } from '@echoray/utils/validations'

// Use database types
import { api } from '@echoray/database/convex'
```

## Requirements

- Node.js >= 20.0.0
- pnpm >= 9.0.0
