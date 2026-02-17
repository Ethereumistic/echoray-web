# =============================================================================
# DEV -> PROD Database Sync Script for Convex
# =============================================================================
# This script syncs your development database (schema + data) to production.
# 
# IMPORTANT: This requires manual steps in the Convex Dashboard first!
# =============================================================================

param(
    [switch]$SkipExport,
    [switch]$DeployOnly
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEV -> PROD Database Sync" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backup exists or export new one
$backupPath = "./convex-backup"

if (-not $SkipExport) {
    Write-Host "[1/3] Exporting development data..." -ForegroundColor Yellow
    
    # Remove old backup if exists
    if (Test-Path $backupPath) {
        Remove-Item -Force $backupPath
    }
    
    pnpm dlx convex export --path $backupPath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to export dev data" -ForegroundColor Red
        exit 1
    }
    Write-Host "SUCCESS: Dev data exported" -ForegroundColor Green
} else {
    Write-Host "[1/3] Using existing backup..." -ForegroundColor Yellow
    if (-not (Test-Path $backupPath)) {
        Write-Host "ERROR: No backup found at $backupPath" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  MANUAL STEP REQUIRED" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Before continuing, you MUST clear the production database:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Open: https://dashboard.convex.dev" -ForegroundColor Cyan
Write-Host "  2. Select your PROD deployment" -ForegroundColor Cyan
Write-Host "  3. Go to SETTINGS -> 'Reset deployment' or" -ForegroundColor Cyan
Write-Host "     Go to DATA tab and delete all table data" -ForegroundColor Cyan
Write-Host ""
Write-Host "Have you cleared the production data? (Y/N): " -ForegroundColor Yellow -NoNewline
$confirm = Read-Host

if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Aborted. Please clear production data first." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "[2/3] Deploying schema to production..." -ForegroundColor Yellow
pnpm dlx convex deploy --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Schema deployment failed" -ForegroundColor Red
    Write-Host "Make sure you cleared ALL data from production" -ForegroundColor Yellow
    exit 1
}
Write-Host "SUCCESS: Schema deployed" -ForegroundColor Green

if ($DeployOnly) {
    Write-Host ""
    Write-Host "Deploy-only mode. Skipping data import." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "[3/3] Importing data to production..." -ForegroundColor Yellow
pnpm dlx convex import --prod --format zip --yes $backupPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Data import failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SYNC COMPLETE!" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your production database now matches development." -ForegroundColor White
Write-Host ""
