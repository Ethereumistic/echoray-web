# WebScan Microservice - Master Blueprint

## Overview

WebScan is a standalone microservice for running Google Lighthouse audits on URLs submitted by the main EchoRay application. It bypasses Cloudflare Workers' limitations by running as a separate Dockerized service with full headless browser capabilities.

**Tech Stack:**
- Runtime: Bun 1.1+
- Framework: ElysiaJS 1.0+
- Core Engine: Lighthouse 12+ & Puppeteer
- Queue: BullMQ with Redis
- Database: Shared Convex package (`@echoray/database`)
- Deployment: Docker (VPS/Fly.io)

**IMPORTANT:** There are 5 instances where we mention Fly.io, we will deploy on a VPS instead, it is hardened user is called deploy,
we just need to open needed ports using ufw, and choose where to make the folder at ~. 

**VPS:** deploy@echoray-openclaw:~$
**VPS IP:** 72.62.157.125
**UFW CURRENT STATUS:**
To                         Action      From
--                         ------      ----
2222/tcp                   ALLOW       Anywhere                   # SSH
80/tcp                     ALLOW       Anywhere                   # HTTP
443/tcp                    ALLOW       Anywhere                   # HTTPS
18789/tcp                  ALLOW       Anywhere                   # OpenClaw UI
2222/tcp (v6)              ALLOW       Anywhere (v6)              # SSH
80/tcp (v6)                ALLOW       Anywhere (v6)              # HTTP
443/tcp (v6)               ALLOW       Anywhere (v6)              # HTTPS
18789/tcp (v6)             ALLOW       Anywhere (v6)              # OpenClaw UI
---

## Directory Structure

```
apps/microapps/webscan/
├── src/
│   ├── index.ts              # Elysia server entry point
│   ├── scanner.ts            # Lighthouse execution logic
│   ├── queue.ts              # BullMQ worker setup
│   ├── middleware/
│   │   └── auth.ts           # API key validation
│   ├── routes/
│   │   ├── scan.ts           # POST /scan endpoint
│   │   └── health.ts         # GET /health endpoint
│   ├── utils/
│   │   └── convex-client.ts  # Convex integration
│   └── types/
│       └── scan.ts           # TypeScript interfaces
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── package.json
├── tsconfig.json
├── bunfig.toml
└── .env.example
```

---

## Implementation Steps

### Step 1: Initialize Bun Project

```bash
cd apps/microapps/webscan
bun init -y
```

### Step 2: Install Dependencies

```bash
# Core dependencies
bun add elysia @elysiajs/cors @elysiajs/bearer
bun add lighthouse chrome-launcher puppeteer
bun add bullmq ioredis
bun add convex

# Development dependencies
bun add -d @types/node
bun add -d bun-types
```

### Step 3: Configure TypeScript

Edit `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "types": ["bun-types"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "paths": {
      "@/*": ["./src/*"],
      "@echoray/database": ["../../packages/database/src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## Code Scaffolds

### 1. `package.json`

```json
{
  "name": "@echoray/webscan",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "start": "bun src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun",
    "docker:build": "docker build -t echoray-webscan .",
    "docker:run": "docker run -p 3001:3001 --env-file .env echoray-webscan"
  },
  "dependencies": {
    "elysia": "^1.0.0",
    "@elysiajs/cors": "^1.0.0",
    "@elysiajs/bearer": "^1.0.0",
    "lighthouse": "^12.0.0",
    "chrome-launcher": "^1.1.0",
    "puppeteer": "^22.0.0",
    "bullmq": "^5.0.0",
    "ioredis": "^5.3.0",
    "convex": "^1.16.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "bun-types": "latest"
  },
  "workspaces": [
    "../../packages/*"
  ]
}
```

### 2. `.env.example`

```env
# Server
PORT=3001
NODE_ENV=production

# Security
API_SECRET_KEY=your-super-secret-key-change-in-production

# Redis (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Convex
CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key

# Lighthouse Options
LIGHTHOUSE_THROTTLING=true
LIGHTHOUSE_TIMEOUT=60000
```

### 3. `src/index.ts`

```typescript
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { bearer } from '@elysiajs/bearer';
import { scanRoute } from './routes/scan';
import { healthRoute } from './routes/health';
import { authMiddleware } from './middleware/auth';
import { initializeQueue } from './queue';

const PORT = process.env.PORT || 3001;

// Initialize BullMQ worker
await initializeQueue();

const app = new Elysia()
  .use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  }))
  .use(bearer())
  .use(authMiddleware)
  .use(healthRoute)
  .use(scanRoute)
  .onError(({ code, error, set }) => {
    console.error(`[ERROR] ${code}:`, error);
    
    if (code === 'VALIDATION') {
      set.status = 400;
      return { error: 'Validation failed', details: error.message };
    }
    
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'Route not found' };
    }
    
    set.status = 500;
    return { error: 'Internal server error' };
  })
  .listen(PORT);

console.log(`🚀 WebScan microservice running at http://localhost:${PORT}`);
```

### 4. `src/types/scan.ts`

```typescript
export interface ScanRequest {
  url: string;
  userId: string;
  scanId: string;
  options?: {
    categories?: ('performance' | 'accessibility' | 'best-practices' | 'seo' | 'pwa')[];
    device?: 'mobile' | 'desktop';
  };
}

export interface ScanResult {
  scanId: string;
  url: string;
  timestamp: number;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa?: number;
  };
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
  };
  aiReadiness?: {
    structuredData: boolean;
    semanticHtml: boolean;
    imageAltTags: number;
    headingStructure: boolean;
  };
}

export interface QueueJob {
  id: string;
  data: ScanRequest;
  timestamp: number;
}
```

### 5. `src/middleware/auth.ts`

```typescript
import { Elysia } from 'elysia';

export const authMiddleware = new Elysia()
  .derive(({ bearer, set, request }) => {
    // Skip auth for health check
    if (request.url.endsWith('/health')) {
      return {};
    }

    const apiKey = bearer || request.headers.get('x-api-key');
    const expectedKey = process.env.API_SECRET_KEY;

    if (!apiKey || apiKey !== expectedKey) {
      set.status = 401;
      throw new Error('Unauthorized: Invalid or missing API key');
    }

    return { authenticated: true };
  });
```

### 6. `src/routes/health.ts`

```typescript
import { Elysia } from 'elysia';

export const healthRoute = new Elysia()
  .get('/health', () => ({
    status: 'healthy',
    service: 'webscan',
    timestamp: Date.now(),
    uptime: process.uptime(),
  }));
```

### 7. `src/routes/scan.ts`

```typescript
import { Elysia, t } from 'elysia';
import { addScanToQueue } from '../queue';
import type { ScanRequest } from '../types/scan';

export const scanRoute = new Elysia()
  .post('/scan', async ({ body, set }) => {
    const { url, userId, scanId, options } = body as ScanRequest;

    // Validate URL
    try {
      new URL(url);
    } catch {
      set.status = 400;
      return { error: 'Invalid URL format' };
    }

    // Add to queue
    const job = await addScanToQueue({
      url,
      userId,
      scanId,
      options: options || { categories: ['performance', 'seo'], device: 'mobile' },
    });

    return {
      message: 'Scan queued successfully',
      jobId: job.id,
      scanId,
      estimatedWait: '30-60 seconds',
    };
  }, {
    body: t.Object({
      url: t.String(),
      userId: t.String(),
      scanId: t.String(),
      options: t.Optional(t.Object({
        categories: t.Optional(t.Array(t.String())),
        device: t.Optional(t.Union([t.Literal('mobile'), t.Literal('desktop')])),
      })),
    }),
  });
```

### 8. `src/scanner.ts`

```typescript
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import type { ScanRequest, ScanResult } from './types/scan';

export async function runLighthouseScan(request: ScanRequest): Promise<ScanResult> {
  const { url, scanId, options } = request;
  
  console.log(`[SCAN] Starting Lighthouse scan for ${url}`);

  // Launch Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  try {
    // Run Lighthouse
    const runnerResult = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      onlyCategories: options?.categories || ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: options?.device || 'mobile',
      throttling: process.env.LIGHTHOUSE_THROTTLING === 'true' ? {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4,
      } : undefined,
      screenEmulation: {
        mobile: options?.device === 'mobile',
        width: options?.device === 'mobile' ? 375 : 1920,
        height: options?.device === 'mobile' ? 667 : 1080,
        deviceScaleFactor: options?.device === 'mobile' ? 2 : 1,
      },
    });

    if (!runnerResult) {
      throw new Error('Lighthouse returned no results');
    }

    const { lhr } = runnerResult;

    // Extract scores
    const scores: ScanResult['scores'] = {
      performance: lhr.categories.performance?.score || 0,
      accessibility: lhr.categories.accessibility?.score || 0,
      bestPractices: lhr.categories['best-practices']?.score || 0,
      seo: lhr.categories.seo?.score || 0,
    };

    // Extract metrics
    const metrics: ScanResult['metrics'] = {
      firstContentfulPaint: lhr.audits['first-contentful-paint']?.numericValue || 0,
      largestContentfulPaint: lhr.audits['largest-contentful-paint']?.numericValue || 0,
      totalBlockingTime: lhr.audits['total-blocking-time']?.numericValue || 0,
      cumulativeLayoutShift: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
      speedIndex: lhr.audits['speed-index']?.numericValue || 0,
    };

    // AI Readiness Analysis
    const aiReadiness = {
      structuredData: lhr.audits['structured-data']?.score === 1,
      semanticHtml: lhr.audits['heading-order']?.score === 1,
      imageAltTags: lhr.audits['image-alt']?.score || 0,
      headingStructure: lhr.audits['heading-order']?.score === 1,
    };

    console.log(`[SCAN] Completed for ${url}. Performance: ${scores.performance * 100}/100`);

    return {
      scanId,
      url,
      timestamp: Date.now(),
      scores,
      metrics,
      aiReadiness,
    };
  } finally {
    await chrome.kill();
  }
}
```

### 9. `src/queue.ts`

```typescript
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { runLighthouseScan } from './scanner';
import { saveResultToConvex } from './utils/convex-client';
import type { ScanRequest } from './types/scan';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

export const scanQueue = new Queue('webscan', { connection });

export async function addScanToQueue(request: ScanRequest) {
  return await scanQueue.add('lighthouse-scan', request, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  });
}

export async function initializeQueue() {
  const worker = new Worker(
    'webscan',
    async (job) => {
      console.log(`[WORKER] Processing job ${job.id}`);
      
      const scanRequest = job.data as ScanRequest;
      
      // Run Lighthouse scan
      const result = await runLighthouseScan(scanRequest);
      
      // Save to Convex
      await saveResultToConvex(result, scanRequest.userId);
      
      console.log(`[WORKER] Job ${job.id} completed successfully`);
      
      return result;
    },
    {
      connection,
      concurrency: 2, // Process 2 scans concurrently
      limiter: {
        max: 10,
        duration: 60000, // Max 10 jobs per minute
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`[QUEUE] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[QUEUE] Job ${job?.id} failed:`, err);
  });

  console.log('✅ BullMQ worker initialized');
}
```

### 10. `src/utils/convex-client.ts`

```typescript
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@echoray/database/convex/_generated/api';
import type { ScanResult } from '../types/scan';

const convex = new ConvexHttpClient(process.env.CONVEX_URL!);
convex.setAuth(process.env.CONVEX_DEPLOY_KEY!);

export async function saveResultToConvex(result: ScanResult, userId: string) {
  try {
    await convex.mutation(api.scans.saveScanResult, {
      scanId: result.scanId,
      userId,
      url: result.url,
      timestamp: result.timestamp,
      scores: result.scores,
      metrics: result.metrics,
      aiReadiness: result.aiReadiness,
    });
    
    console.log(`[CONVEX] Saved scan result ${result.scanId}`);
  } catch (error) {
    console.error('[CONVEX] Failed to save result:', error);
    throw error;
  }
}
```

### 11. `Dockerfile`

```dockerfile
FROM oven/bun:1.1-alpine

# Install Chromium and dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build application
RUN bun build src/index.ts --outdir dist --target bun

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD bun fetch http://localhost:3001/health || exit 1

# Run the application
CMD ["bun", "dist/index.js"]
```

### 12. `docker-compose.yml`

```yaml
version: '3.9'

services:
  webscan:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - API_SECRET_KEY=${API_SECRET_KEY}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - CONVEX_URL=${CONVEX_URL}
      - CONVEX_DEPLOY_KEY=${CONVEX_DEPLOY_KEY}
      - LIGHTHOUSE_THROTTLING=true
      - LIGHTHOUSE_TIMEOUT=60000
    depends_on:
      - redis
    restart: unless-stopped
    mem_limit: 2g
    cpus: 1.5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

### 13. `.dockerignore`

```
node_modules
.env
.env.local
dist
*.log
.git
.gitignore
README.md
```

### 14. `bunfig.toml`

```toml
[install]
optional = true
dev = false
peer = true

[install.cache]
dir = ".bun-cache"

[run]
bun = "latest"
```

---

## Integration with Main App (`apps/web`)

### Step 1: Create Convex Action

**File:** `packages/database/convex/scans.ts`

```typescript
import { v } from "convex/values";
import { action, mutation } from "./_generated/server";

// Action to trigger WebScan microservice
export const triggerScan = action({
  args: {
    url: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate scan ID
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Call WebScan microservice
    const response = await fetch(`${process.env.WEBSCAN_API_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBSCAN_API_KEY}`,
      },
      body: JSON.stringify({
        url: args.url,
        userId: args.userId,
        scanId,
        options: {
          categories: ['performance', 'seo', 'accessibility', 'best-practices'],
          device: 'mobile',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`WebScan API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Create initial scan record
    await ctx.runMutation(api.scans.createScanRecord, {
      scanId,
      userId: args.userId,
      url: args.url,
      status: 'pending',
    });

    return { scanId, jobId: result.jobId };
  },
});

// Mutation to create initial scan record
export const createScanRecord = mutation({
  args: {
    scanId: v.string(),
    userId: v.string(),
    url: v.string(),
    status: v.union(v.literal('pending'), v.literal('completed'), v.literal('failed')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scans", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Mutation to save scan results (called by WebScan)
export const saveScanResult = mutation({
  args: {
    scanId: v.string(),
    userId: v.string(),
    url: v.string(),
    timestamp: v.number(),
    scores: v.object({
      performance: v.number(),
      accessibility: v.number(),
      bestPractices: v.number(),
      seo: v.number(),
    }),
    metrics: v.object({
      firstContentfulPaint: v.number(),
      largestContentfulPaint: v.number(),
      totalBlockingTime: v.number(),
      cumulativeLayoutShift: v.number(),
      speedIndex: v.number(),
    }),
    aiReadiness: v.optional(v.object({
      structuredData: v.boolean(),
      semanticHtml: v.boolean(),
      imageAltTags: v.number(),
      headingStructure: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const existingDoc = await ctx.db
      .query("scans")
      .withIndex("by_scanId", (q) => q.eq("scanId", args.scanId))
      .first();

    if (existingDoc) {
      await ctx.db.patch(existingDoc._id, {
        status: 'completed',
        scores: args.scores,
        metrics: args.metrics,
        aiReadiness: args.aiReadiness,
        completedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("scans", {
        ...args,
        status: 'completed',
        createdAt: args.timestamp,
        completedAt: Date.now(),
      });
    }
  },
});
```

### Step 2: Create Helper Hook in Next.js

**File:** `apps/web/hooks/useWebScan.ts`

```typescript
import { useAction } from "convex/react";
import { api } from "@echoray/database/convex/_generated/api";

export function useWebScan() {
  const triggerScan = useAction(api.scans.triggerScan);

  const startScan = async (url: string) => {
    try {
      const result = await triggerScan({ url, userId: "current-user-id" });
      return result;
    } catch (error) {
      console.error("Failed to start scan:", error);
      throw error;
    }
  };

  return { startScan };
}
```

### Step 3: Use in Next.js Component

```typescript
"use client";

import { useState } from "react";
import { useWebScan } from "@/hooks/useWebScan";

export function ScanForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { startScan } = useWebScan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await startScan(url);
      alert(`Scan started! ID: ${result.scanId}`);
    } catch (error) {
      alert("Failed to start scan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Starting..." : "Scan Website"}
      </button>
    </form>
  );
}
```

---

## Deployment Checklist

### Local Development

```bash
# 1. Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# 2. Copy environment variables
cp .env.example .env

# 3. Run dev server
bun run dev
```

### Docker Deployment

```bash
# 1. Build image
docker build -t echoray-webscan .

# 2. Run with docker-compose
docker-compose up -d

# 3. Check logs
docker-compose logs -f webscan
```

### Fly.io Deployment

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Create app
fly launch --name echoray-webscan --region iad

# 4. Set secrets
fly secrets set API_SECRET_KEY=your-key
fly secrets set CONVEX_URL=your-url
fly secrets set CONVEX_DEPLOY_KEY=your-key

# 5. Deploy
fly deploy

# 6. Scale (optional)
fly scale vm shared-cpu-1x --memory 2048
```

---

## Testing

### Manual Test

```bash
# Health check
curl http://localhost:3001/health

# Trigger scan
curl -X POST http://localhost:3001/scan \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "userId": "test-user",
    "scanId": "test-scan-123"
  }'
```

### Load Testing

```bash
# Install k6
brew install k6

# Create test script
cat > load-test.js << 'EOF'
import http from 'k6/http';

export default function () {
  const url = 'http://localhost:3001/scan';
  const payload = JSON.stringify({
    url: 'https://example.com',
    userId: 'load-test',
    scanId: `scan-${Date.now()}`,
  });

  http.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-api-key',
    },
  });
}
EOF

# Run test (10 users, 30 seconds)
k6 run --vus 10 --duration 30s load-test.js
```

---

## Monitoring & Observability

### Add Logging

Install Pino logger:

```bash
bun add pino pino-pretty
```

Update `src/index.ts`:

```typescript
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// Use throughout app
logger.info('Server started');
logger.error({ err }, 'Scan failed');
```

### Metrics Endpoint

Add to `src/routes/health.ts`:

```typescript
.get('/metrics', async () => {
  const queueMetrics = await scanQueue.getJobCounts();
  
  return {
    queue: queueMetrics,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  };
})
```

---

## Security Hardening

1. **Rate Limiting**: Add Redis-based rate limiting per IP/user
2. **URL Validation**: Whitelist/blacklist domains
3. **Timeout Protection**: Set max scan duration (60s)
4. **Resource Limits**: Cap concurrent scans
5. **HTTPS Only**: Enforce HTTPS in production

---

## Performance Optimization

1. **Chrome Reuse**: Keep Chrome instance alive between scans (advanced)
2. **Caching**: Cache results for identical URLs (24h TTL)
3. **Parallel Scans**: Increase worker concurrency based on resources
4. **Lighthouse Config**: Reduce audit categories for faster scans

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Chrome won't launch | Add `--no-sandbox --disable-setuid-sandbox` flags |
| Out of memory | Increase Docker memory limit to 2GB+ |
| Queue stalled | Check Redis connection, restart worker |
| Slow scans | Disable throttling for dev, reduce audit categories |
| Convex errors | Verify API key and deployment URL |

---

## Next Steps

1. [ ] Initialize project with `bun init`
2. [ ] Copy all code scaffolds
3. [ ] Configure environment variables
4. [ ] Test locally with Redis
5. [ ] Build Docker image
6. [ ] Deploy to Fly.io/VPS
7. [ ] Integrate with main app
8. [ ] Add monitoring dashboard

---

**Total Implementation Time:** 4-6 hours  
**Estimated Cost:** $5-10/month (Fly.io shared-cpu-1x + Redis)