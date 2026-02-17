param(
  [int]$Port = 3000
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "Checking Node.js..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js not found on this machine."
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "winget detected. Attempting to install Node.js LTS (requires administrator approval)..."
    $wingetArgs = @('install','--id','OpenJS.NodeJS.LTS','-e','--accept-package-agreements','--accept-source-agreements')
    try {
      $proc = Start-Process -FilePath 'winget' -ArgumentList $wingetArgs -Verb RunAs -Wait -PassThru -WindowStyle Normal
      if ($proc.ExitCode -eq 0) {
        Write-Host "winget reported successful install. Waiting briefly for PATH to update..."
        Start-Sleep -Seconds 3
        if (Get-Command node -ErrorAction SilentlyContinue) {
          Write-Host "Node installed successfully: $(node -v)"
        } else {
          Write-Warning "Node was installed but not found in PATH. Please restart your shell and re-run this script."
          Start-Process "https://nodejs.org/en/download/"
          exit 1
        }
      } else {
        Write-Warning "winget exited with code $($proc.ExitCode). Opening Node.js download page for manual install."
        Start-Process "https://nodejs.org/en/download/"
        exit 1
      }
    } catch {
      Write-Warning "Failed to run winget installer: $($_.Exception.Message)"
      Start-Process "https://nodejs.org/en/download/"
      exit 1
    }
  } else {
    Write-Warning "winget not available. Opening Node.js download page — please install Node.js LTS and re-run this script."
    Start-Process "https://nodejs.org/en/download/"
    exit 1
  }
} else {
  Write-Host "Node version: $(node -v)"
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "npm not found. Install Node.js which bundles npm, then re-run."
  exit 1
}

Write-Host "Installing dependencies (npm install)..."
Push-Location $root
npm install
if ($LASTEXITCODE -ne 0) {
  Write-Error "npm install failed. Check errors above.";
  Pop-Location
  exit 1
}

Write-Host "Starting server (npm start) in a new PowerShell window..."
# Build a safe -Command string that changes to the project folder and runs npm start
$cmd = "cd `"$root`"; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd -WorkingDirectory $root

Start-Sleep -Milliseconds 800
$uri = "http://localhost:$Port"
Write-Host "Opening $uri in default browser..."
Start-Process $uri

Write-Host "Helper finished. Server is running in the background window."
