# Echoray Monorepo Migration Plan

## Overview
This document outlines the complete migration strategy from the current single-repository structure (`echoray-web`) to a modern monorepo architecture (`echoray-mono`). The new structure will enable better code sharing, independent deployments, and scalable microapp development.

---

## Current State

**Repository:** `https://github.com/Ethereumistic/echoray-web`
**Old backup path:** `C:/Users/badja/Documents/Projects_Developement/Websites/echoray`
**NEW CLEAN Local Path:** `C:/Users/badja/Documents/Projects_Developement/echoray-mono`  
**Stack:** Next.js 14+ (App Router) + Convex + Cloudflare Workers  
**Deployment:** Cloudflare Workers

# Phase 1 of plan is already done, the current branch is feat/monorepo-migration, proceed with next phases and steps.
---

## Target State

**Repository:** `https://github.com/Ethereumistic/echoray-web` (same repo, new structure)  
**Local Path:** `C:/echoray-mono`  
**Structure:**
```
echoray-mono/
├── apps/
│   ├── web/                    # Main Next.js application
│   └── microapps/              # Independent microapplications
│       ├── webscan/
│       ├── lead-ai/
│       └── [future-apps]/
├── packages/                   # Shared packages
│   ├── ui/                     # Shared UI components (shadcn)
│   ├── database/               # Convex schema & utilities
│   ├── config/                 # Shared configs (TS, ESLint, etc.)
│   └── utils/                  # Shared utilities & validations
├── package.json                # Root workspace config
├── pnpm-workspace.yaml         # PNPM workspace definition
└── turbo.json                  # Turborepo configuration (optional)
```

---

## Migration Steps

### Phase 1: Repository Setup & Cloning (ALREADY DONE)

#### Step 1.1: Clone to New Location (ALREADY DONE)
```bash
# Navigate to C drive
cd /c

# Clone the repository with new name
git clone https://github.com/Ethereumistic/echoray-web echoray-mono

# Navigate into new repo
cd echoray-mono
```

#### Step 1.2: Create New Branch (ALREADY DONE)
```bash
# Create and checkout migration branch
git checkout -b feat/monorepo-migration

# This keeps main branch untouched during migration
```

---

### Phase 2: Monorepo Structure Creation

#### Step 2.1: Create Core Directories
```bash
# Create main structure
mkdir -p apps/web
mkdir -p apps/microapps
mkdir -p packages/ui
mkdir -p packages/database
mkdir -p packages/config
mkdir -p packages/utils
```

#### Step 2.2: Move Existing Application to apps/web

**Move all current files to apps/web:**
```bash
# Create a temporary directory for organization
mkdir temp_move

# Move everything except .git to temp
mv !(temp_move|.git) temp_move/ 2>/dev/null || true

# Move from temp to apps/web
mv temp_move/* apps/web/

# Clean up
rmdir temp_move
```

**Files to move to `apps/web/`:**
- `.dev.vars`
- `.gitignore` (will be modified later)
- `.npmrc`
- `.open-next/`
- `.vscode/`
- `ai/`
- `cloudflare-env.d.ts`
- `components.json`
- `convex/`
- `docs/`
- `eslint.config.mjs`
- `next-env.d.ts`
- `open-next.config.ts`
- `package.json`
- `package-lock.json`
- `pnpm-lock.yaml`
- `postcss.config.mjs`
- `public/`
- `README.md` (keep a copy at root)
- `scripts/`
- `src/`
- `telemetry-id`
- `tsconfig.json`
- `tsconfig.tsbuildinfo`
- `wrangler.jsonc`

---

### Phase 3: Shared Packages Extraction

#### Step 3.1: Extract UI Components Package

**Create `packages/ui/package.json`:**
```json
{
  "name": "@echoray/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./components/*": "./src/components/*.tsx",
    "./lib/*": "./src/lib/*.ts"
  },
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.2",
    "@radix-ui/react-alert-dialog": "^1.1.4",
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-checkbox": "^1.1.3",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-hover-card": "^1.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-menubar": "^1.1.4",
    "@radix-ui/react-navigation-menu": "^1.2.3",
    "@radix-ui/react-popover": "^1.1.4",
    "@radix-ui/react-scroll-area": "^1.2.2",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-separator": "^1.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-tooltip": "^1.1.6",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "tailwind-merge": "^2.7.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "typescript": "^5.7.3"
  },
  "peerDependencies": {
    "react": "^18.3.1"
  }
}
```

**Move UI components:**
```bash
# Copy shadcn/ui components
cp -r apps/web/src/components/ui packages/ui/src/components/

# Copy utility functions
mkdir -p packages/ui/src/lib
cp apps/web/src/lib/utils.ts packages/ui/src/lib/
```

**Create `packages/ui/tsconfig.json`:**
```json
{
  "extends": "../config/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

#### Step 3.2: Extract Database Package

**Create `packages/database/package.json`:**
```json
{
  "name": "@echoray/database",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./convex": "./convex/index.ts",
    "./convex/*": "./convex/*.ts"
  },
  "scripts": {
    "dev": "convex dev",
    "deploy": "convex deploy"
  },
  "dependencies": {
    "@auth/core": "^0.37.4",
    "@convex-dev/auth": "^0.0.76",
    "convex": "^1.18.3",
    "resend": "^4.0.3"
  },
  "devDependencies": {
    "typescript": "^5.7.3"
  }
}
```

**Move Convex files:**
```bash
# Move entire convex directory
cp -r apps/web/convex packages/database/

# Create convex.json for the package
cat > packages/database/convex.json << 'EOF'
{
  "functions": "convex/"
}
EOF
```

#### Step 3.3: Extract Shared Config Package

**Create `packages/config/package.json`:**
```json
{
  "name": "@echoray/config",
  "version": "0.0.0",
  "private": true,
  "files": [
    "eslint",
    "tsconfig"
  ]
}
```

**Create TypeScript configs:**

`packages/config/tsconfig/base.json`:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "composite": false,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "inlineSources": false,
    "isolatedModules": true,
    "moduleResolution": "Bundler",
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "preserveWatchOutput": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true
  },
  "exclude": ["node_modules"]
}
```

`packages/config/tsconfig/nextjs.json`:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Next.js",
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "jsx": "preserve",
    "module": "esnext",
    "noEmit": true,
    "incremental": true,
    "resolveJsonModule": true
  }
}
```

#### Step 3.4: Extract Utils Package

**Create `packages/utils/package.json`:**
```json
{
  "name": "@echoray/utils",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./validations": "./src/validations.ts",
    "./lead-scoring": "./src/lead-scoring.ts",
    "./file-upload": "./src/file-upload.ts"
  },
  "dependencies": {
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "typescript": "^5.7.3"
  }
}
```

**Move utility files:**
```bash
mkdir -p packages/utils/src
cp apps/web/src/lib/validations.ts packages/utils/src/
cp apps/web/src/lib/lead-scoring.ts packages/utils/src/
cp apps/web/src/lib/file-upload.ts packages/utils/src/
```

---

### Phase 4: Root Workspace Configuration

#### Step 4.1: Create Root package.json

**`package.json` (root):**
```json
{
  "name": "echoray-mono",
  "version": "0.0.0",
  "private": true,
  "description": "Echoray monorepo - Main web app and microapplications",
  "scripts": {
    "dev": "pnpm --filter @echoray/web dev",
    "dev:web": "pnpm --filter @echoray/web dev",
    "build": "pnpm --filter @echoray/web build",
    "build:web": "pnpm --filter @echoray/web build",
    "lint": "pnpm -r lint",
    "type-check": "pnpm -r type-check",
    "clean": "pnpm -r clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@types/node": "^22.10.6",
    "prettier": "^3.4.2",
    "typescript": "^5.7.3"
  },
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

#### Step 4.2: Create PNPM Workspace Configuration

**`pnpm-workspace.yaml`:**
```yaml
packages:
  - 'apps/*'
  - 'apps/microapps/*'
  - 'packages/*'
```

#### Step 4.3: Update Root .gitignore

**`.gitignore` (root):**
```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
.next/
.open-next/
out/
dist/
build/

# Environment variables
.env
.env*.local
.dev.vars

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# OS
.DS_Store
*.pem
Thumbs.db

# IDE
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
*.swp
*.swo
*~

# Testing
coverage/
.nyc_output/

# Misc
*.tsbuildinfo
.turbo/
telemetry-id
```

---

### Phase 5: Update Web App Configuration

#### Step 5.1: Update apps/web/package.json

**Modify `apps/web/package.json`:**
```json
{
  "name": "@echoray/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "cf:deploy": "wrangler pages deploy .vercel/output/static --project-name=echoray"
  },
  "dependencies": {
    "@echoray/database": "workspace:*",
    "@echoray/ui": "workspace:*",
    "@echoray/utils": "workspace:*",
    "next": "^15.1.6",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "convex": "^1.18.3",
    "@auth/core": "^0.37.4",
    "@convex-dev/auth": "^0.0.76",
    "zod": "^3.24.1",
    "zustand": "^5.0.3",
    "sonner": "^1.7.3",
    "date-fns": "^4.1.0",
    "framer-motion": "^11.15.0"
  },
  "devDependencies": {
    "@echoray/config": "workspace:*",
    "@types/node": "^22.10.6",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "typescript": "^5.7.3",
    "eslint": "^8.57.1",
    "eslint-config-next": "^15.1.6",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  }
}
```

#### Step 5.2: Update apps/web/tsconfig.json

**Modify to extend from shared config:**
```json
{
  "extends": "@echoray/config/tsconfig/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@echoray/ui": ["../../packages/ui/src"],
      "@echoray/database": ["../../packages/database"],
      "@echoray/utils": ["../../packages/utils/src"]
    },
    "plugins": [{ "name": "next" }],
    "incremental": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

#### Step 5.3: Update Import Statements in apps/web

**Update imports throughout the web app:**

Before:
```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { emailSchema } from "@/lib/validations"
```

After:
```typescript
import { Button } from "@echoray/ui/components/button"
import { cn } from "@echoray/ui/lib/utils"
import { emailSchema } from "@echoray/utils/validations"
```

**Note:** This is a large refactoring task. Consider doing this incrementally or using a codemod.

#### Step 5.4: Update Convex Configuration

**Update `apps/web/convex.json`:**
```json
{
  "functions": "../../packages/database/convex"
}
```

**Or keep convex locally and sync changes:**
Keep convex in `apps/web/convex/` and reference it as usual. The shared database package can be for type definitions only.

---

### Phase 6: Cloudflare Deployment Configuration

#### Step 6.1: Update wrangler.jsonc

**`apps/web/wrangler.jsonc`:**
```jsonc
{
  "name": "echoray-web",
  "compatibility_date": "2024-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": ".vercel/output/static",
  "node_compat": true
}
```

#### Step 6.2: Update Deployment Scripts

**Update `package.json` scripts for deployment:**
```json
{
  "scripts": {
    "deploy": "pnpm build:web && pnpm --filter @echoray/web cf:deploy"
  }
}
```

#### Step 6.3: Test Cloudflare Deployment

```bash
# From root
pnpm install
pnpm build:web

# Deploy to Cloudflare
cd apps/web
pnpm cf:deploy

# Or from root
pnpm deploy
```

---

### Phase 7: Microapps Structure Setup

#### Step 7.1: Create Webscan Microapp

**`apps/microapps/webscan/package.json`:**
```json
{
  "name": "@echoray/webscan",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@echoray/ui": "workspace:*",
    "@echoray/utils": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@echoray/config": "workspace:*",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.3",
    "vite": "^6.0.7"
  }
}
```

**`apps/microapps/webscan/vite.config.ts`:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### Step 7.2: Create Lead-AI Microapp

**`apps/microapps/lead-ai/package.json`:**
```json
{
  "name": "@echoray/lead-ai",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001"
  },
  "dependencies": {
    "@echoray/database": "workspace:*",
    "@echoray/ui": "workspace:*",
    "@echoray/utils": "workspace:*",
    "next": "^15.1.6",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@echoray/config": "workspace:*",
    "typescript": "^5.7.3"
  }
}
```

---

### Phase 8: Verification & Testing

#### Step 8.1: Install All Dependencies

```bash
# From root of echoray-mono
pnpm install
```

#### Step 8.2: Type Checking

```bash
# Check all packages
pnpm type-check
```

#### Step 8.3: Local Development Test

```bash
# Test web app
pnpm dev:web

# Test individual microapp
pnpm --filter @echoray/webscan dev
```

#### Step 8.4: Build Test

```bash
# Build web app
pnpm build:web

# Build all
pnpm -r build
```

#### Step 8.5: Cloudflare Deployment Test

```bash
# Full deployment test
pnpm deploy

# Verify deployment at your Cloudflare Workers domain
```

---

### Phase 9: Git & GitHub Updates

#### Step 9.1: Commit Migration Changes

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: migrate to monorepo structure

- Move web app to apps/web
- Extract shared packages (ui, database, config, utils)
- Setup PNPM workspace
- Configure Cloudflare Workers deployment
- Create microapps structure"
```

#### Step 9.2: Update README

**Update root `README.md`:**
```markdown
# Echoray Monorepo

Modern monorepo for Echoray web platform and microapplications.

## Structure

- `apps/web` - Main Next.js application (Cloudflare Workers)
- `apps/microapps` - Independent microapplications
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
pnpm deploy
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
```

#### Step 9.3: Push to GitHub

```bash
# Push migration branch
git push -u origin feat/monorepo-migration

# Create PR on GitHub
# Review changes
# Merge to main
```

---

## Post-Migration Tasks

### Immediate Tasks

1. **Update CI/CD pipelines** - Adjust GitHub Actions or deployment scripts
2. **Update environment variables** - Ensure all apps have necessary env vars
3. **Update documentation** - Update all references to old structure
4. **Team notification** - Inform team members about new structure

### Future Enhancements

1. **Add Turborepo** - For better build caching and task orchestration
   ```bash
   pnpm add -Dw turbo
   ```

2. **Add Changesets** - For version management
   ```bash
   pnpm add -Dw @changesets/cli
   ```

3. **Setup Shared ESLint Config** - Standardize linting across all apps

4. **Add Testing Infrastructure** - Shared testing utilities and configs

5. **Setup Shared Tailwind Config** - DRY principle for styling

---

## Troubleshooting

### Issue: Module Resolution Errors

**Solution:** Ensure `tsconfig.json` paths are correctly mapped:
```json
{
  "compilerOptions": {
    "paths": {
      "@echoray/ui": ["../../packages/ui/src"],
      "@echoray/database": ["../../packages/database"],
      "@echoray/utils": ["../../packages/utils/src"]
    }
  }
}
```

### Issue: Cloudflare Deployment Fails

**Solution:** Check `wrangler.jsonc` configuration and build output directory:
```bash
# Verify build output exists
ls -la apps/web/.vercel/output/static

# Check wrangler config
cat apps/web/wrangler.jsonc
```

### Issue: Convex not connecting

**Solution:** Ensure Convex is configured correctly:
```bash
# In apps/web
npx convex dev

# Check convex.json points to correct location
```

### Issue: PNPM workspace not resolving packages

**Solution:** 
1. Delete all node_modules: `pnpm clean`
2. Delete pnpm-lock.yaml
3. Reinstall: `pnpm install`

---

## Migration Checklist

- [ ] Clone repo to C:/echoray-mono
- [ ] Create monorepo structure (apps/, packages/)
- [ ] Move web app to apps/web
- [ ] Extract UI components to packages/ui
- [ ] Extract database to packages/database
- [ ] Extract config to packages/config
- [ ] Extract utils to packages/utils
- [ ] Create root package.json
- [ ] Create pnpm-workspace.yaml
- [ ] Update apps/web/package.json with workspace deps
- [ ] Update apps/web/tsconfig.json
- [ ] Update import statements
- [ ] Install all dependencies
- [ ] Test local development
- [ ] Test build process
- [ ] Test Cloudflare deployment
- [ ] Create microapps structure
- [ ] Update README
- [ ] Commit and push changes
- [ ] Create and merge PR
- [ ] Update CI/CD
- [ ] Notify team

---

## Resources

- [PNPM Workspaces](https://pnpm.io/workspaces)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Next.js Monorepo](https://vercel.com/blog/monorepos-are-changing-how-teams-build-software)

---

## Notes

- Keep the original `echoray-web` repo/folder untouched until migration is fully verified
- Consider using feature flags to gradually roll out changes
- Document any custom scripts or tooling decisions
- Keep dependencies up to date across all packages