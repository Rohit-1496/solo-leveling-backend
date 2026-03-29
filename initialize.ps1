# 🗡️ Solo Leveling System: Ignition Script
# This script installs local dependencies and seeds the production database.

Write-Host "--- [ SYSTEM IGNITION SEQUENCE STARTING ] ---" -ForegroundColor Cyan

# 1. Install missing dependencies
Write-Host "📦 Stage 1: Installing Mana Drivers (asyncpg)..." -ForegroundColor Yellow
pip install -r requirements.txt

# 2. Seed the Production Database
Write-Host "💎 Stage 2: Seeding the Shadow Monarch (Neon DB)..." -ForegroundColor Yellow
python scripts/seed_database.py

Write-Host "--- [ IGNITION COMPLETE: THE SYSTEM IS AWAKENED ] ---" -ForegroundColor Green
Write-Host "Visit your live dashboard to confirm: https://solo-leveling-system-v2-frontend.netlify.app/" -ForegroundColor White
