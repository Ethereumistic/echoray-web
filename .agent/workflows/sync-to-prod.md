---
description: Sync development database to production (Convex)
---

# Sync Dev Database to Production

This workflow pushes your development database (schema + data) to production.

## Quick Steps

1. **Export dev data** (already done if you ran the script before):
   ```powershell
   pnpm dlx convex export --path ./convex-backup
   ```

2. **Clear production data** (REQUIRED - no way around this):
   - Go to https://dashboard.convex.dev
   - Select your **PROD** deployment (`fleet-puma-654`)
   - Go to **Settings** → **Danger Zone** → **Clear all data**
   - OR go to **Data** tab and manually delete all tables

3. **Deploy schema to production**:
   // turbo
   ```powershell
   pnpm dlx convex deploy --yes
   ```

4. **Import dev data to production**:
   // turbo
   ```powershell
   pnpm dlx convex import --prod --format zip --yes ./convex-backup
   ```

## One-Command Script

After clearing production data manually, run:
```powershell
.\scripts\sync-dev-to-prod.ps1 -SkipExport
```

Or for a full export + deploy + import:
```powershell
.\scripts\sync-dev-to-prod.ps1
```

## Why Manual Clear is Required

Convex validates that existing production data matches the schema before deploying. If your schema changed and production has old data, the deploy will fail. The only solution is to clear the production data first, then deploy the new schema, then import new data.

## Flags

- `-SkipExport`: Skip exporting dev data (use existing backup)
- `-DeployOnly`: Only deploy schema, don't import data
