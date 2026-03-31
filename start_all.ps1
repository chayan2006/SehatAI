# SehatAI - Start All Services
# Run this script to launch Frontend + ML Server + Lung API in one go

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition
$VENV_PYTHON = "$ROOT\ml_server\venv\Scripts\python.exe"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SehatAI - Starting All Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# 1. Frontend
Write-Host "`n[1/3] Starting Frontend (Vite) on http://localhost:3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ROOT'; npm run dev"

# 2. ML Multi-Model Server (Flask) — port 5001
Write-Host "[2/3] Starting ML Multi-Model Server on http://localhost:5001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ROOT\ml_server'; & '$VENV_PYTHON' server.py"

# 3. Lung CT Scan API (FastAPI) — port 8001
Write-Host "[3/3] Starting Lung CT API on http://localhost:8001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ROOT\ml_lung_model'; & '$VENV_PYTHON' -m uvicorn api:app --host 0.0.0.0 --port 8001"

Write-Host "`n================================================" -ForegroundColor Green
Write-Host "  All services started!" -ForegroundColor Green
Write-Host "  Frontend:        http://localhost:3001" -ForegroundColor Green
Write-Host "  ML Models API:   http://localhost:5001/health" -ForegroundColor Green
Write-Host "  Lung CT API:     http://localhost:8001/health" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
