param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $projectRoot
$demoUrl = 'http://127.0.0.1:3000'
$apiUrl = 'http://127.0.0.1:8000/api/health'
$logDirectory = Join-Path $projectRoot '.runtime'

function Test-DemoService([string]$Kind) {
    try {
        if ($Kind -eq 'api') {
            $health = Invoke-RestMethod -Uri $apiUrl -TimeoutSec 2
            return ($health.status -eq 'ok' -and $health.dataset_version -and $health.ai_provider)
        }
        $page = Invoke-WebRequest -Uri $demoUrl -UseBasicParsing -TimeoutSec 3
        return ($page.StatusCode -eq 200 -and $page.Content -match 'Concierge-Career')
    } catch { return $false }
}

function Assert-FreePort([int]$Port) {
    $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        throw "Port $Port is occupied but is not serving a healthy Concierge-Career service. Close the conflicting service and retry; this launcher will not stop unrelated processes."
    }
}

function Wait-DemoService([string]$Kind, [System.Diagnostics.Process]$Process) {
    $deadline = (Get-Date).AddSeconds(60)
    do {
        if (Test-DemoService $Kind) { return }
        if ($Process.HasExited) {
            throw "$Kind stopped during startup. See $logDirectory\$Kind.stderr.log."
        }
        Start-Sleep -Milliseconds 500
    } while ((Get-Date) -lt $deadline)
    throw "$Kind did not become ready within 60 seconds. See logs in $logDirectory."
}

try {
    $apiReady = Test-DemoService 'api'
    $webReady = Test-DemoService 'web'
    if (-not $apiReady) { Assert-FreePort 8000 }
    if (-not $webReady) { Assert-FreePort 3000 }

    $pythonPath = Join-Path $projectRoot '.venv\Scripts\python.exe'
    $nextPath = Join-Path $projectRoot 'node_modules\next\dist\bin\next'
    if (-not $apiReady -and -not (Test-Path -LiteralPath $pythonPath)) {
        throw 'The Python environment is missing. Run scripts/setup.ps1 first; see README.md.'
    }
    if (-not $webReady) {
        $nodePath = (Get-Command node -ErrorAction Stop).Source
        if (-not (Test-Path -LiteralPath $nextPath)) {
            throw 'Frontend dependencies are missing. Run pnpm install --frozen-lockfile first.'
        }
        # Build before a cold start: this also replaces any stale development output.
        Write-Host 'Preparing the production demo...'
        & pnpm build
        if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed. The demo was not started.' }
    }

    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
    if (-not $apiReady) {
        Write-Host 'Starting the career API...'
        $apiProcess = Start-Process -FilePath $pythonPath -ArgumentList @('-m','uvicorn','backend.app.main:app','--host','127.0.0.1','--port','8000') -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logDirectory 'api.stdout.log') -RedirectStandardError (Join-Path $logDirectory 'api.stderr.log')
        Wait-DemoService 'api' $apiProcess
    }
    if (-not $webReady) {
        Write-Host 'Starting the website...'
        $webProcess = Start-Process -FilePath $nodePath -ArgumentList @(('"' + $nextPath + '"'),'start','frontend','--hostname','127.0.0.1','--port','3000') -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logDirectory 'web.stdout.log') -RedirectStandardError (Join-Path $logDirectory 'web.stderr.log')
        Wait-DemoService 'web' $webProcess
    }
    Write-Host "Demo ready: $demoUrl"
    Write-Host 'Both services run in the background. After a restart, run Start Demo.cmd again.'
    if (-not $NoBrowser) { Start-Process $demoUrl }
    exit 0
} catch {
    Write-Host "Unable to start the demo: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
