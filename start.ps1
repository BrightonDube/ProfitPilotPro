#!/usr/bin/env pwsh
# Start BizPilot Monorepo

Write-Host "🚀 Starting BizPilot Monorepo..." -ForegroundColor Cyan

# Check if pnpm is installed
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    pnpm install
}

# Start both services
Write-Host "✅ Starting Backend (port 5000) and Web (port 3000)..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host "" 

# Run both services in parallel
pnpm run dev:all
