$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if (-not (Test-Path '.venv/Scripts/python.exe')) { python -m venv .venv; if ($LASTEXITCODE) { throw 'Python environment creation failed.' } }
& '.venv/Scripts/python.exe' -m pip install -r backend/requirements.txt
if ($LASTEXITCODE) { throw 'Backend dependency installation failed.' }
pnpm install --frozen-lockfile
if ($LASTEXITCODE) { throw 'Frontend dependency installation failed.' }
& '.venv/Scripts/python.exe' -m alembic upgrade head
if ($LASTEXITCODE) { throw 'Migration failed.' }
& '.venv/Scripts/python.exe' -m database.seed
if ($LASTEXITCODE) { throw 'Seeding failed.' }
Write-Host 'Ready. Run scripts/start-backend.ps1 and scripts/start-frontend.ps1 in separate terminals.'
