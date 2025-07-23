# see-me Windows PowerShell Installer
# Usage: iwr -useb https://raw.githubusercontent.com/KenKaiii/ken-you-see/main/install.ps1 | iex

$RepoUrl = "https://raw.githubusercontent.com/KenKaiii/ken-you-see/main"

# Determine install location - prefer user's local bin for safety
$IsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if ($IsAdmin) {
    # Running as admin - install system-wide
    $InstallDir = "C:\Program Files\see-me"
    $BinDir = $InstallDir
} else {
    # Running as user - install to user's local directory
    $InstallDir = "$env:USERPROFILE\.local\bin"
    $BinDir = $InstallDir
}

Write-Host "👀 Installing see-me globally..." -ForegroundColor Green
Write-Host "📦 Install location: $InstallDir" -ForegroundColor Blue

# Create install directory if it doesn't exist
if (!(Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    Write-Host "📁 Created $InstallDir" -ForegroundColor Blue
}

# Download see-me script
Write-Host "⬇️  Downloading see-me..." -ForegroundColor Blue
try {
    Invoke-WebRequest -Uri "$RepoUrl/see-me" -OutFile "$InstallDir\see-me" -UseBasicParsing
} catch {
    Write-Host "❌ Download failed: $_" -ForegroundColor Red
    exit 1
}

# Create Windows batch wrapper
$BatchContent = @"
@echo off
bash "%~dp0see-me" %*
"@

$BatchContent | Out-File -FilePath "$InstallDir\see-me.bat" -Encoding ASCII

# Add to PATH if not already there
$CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($CurrentPath -notlike "*$InstallDir*") {
    Write-Host "🔧 Adding $InstallDir to user PATH..." -ForegroundColor Blue
    $NewPath = "$InstallDir;$CurrentPath"
    [Environment]::SetEnvironmentVariable("PATH", $NewPath, "User")
    
    # Update current session PATH
    $env:PATH = "$InstallDir;$env:PATH"
    Write-Host "✅ Updated PATH - restart terminal or PowerShell for global access" -ForegroundColor Green
}

Write-Host "✅ see-me installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Quick start (from any directory):" -ForegroundColor Yellow
Write-Host "   npm run dev"
Write-Host "   see-me"
Write-Host "   # Visit http://localhost:3334"
Write-Host ""
Write-Host "📚 More commands:" -ForegroundColor Yellow
Write-Host "   see-me logs    # View captured logs"
Write-Host "   see-me status  # Check services"
Write-Host "   see-me stop    # Stop services"
Write-Host ""
Write-Host "💡 Note: Requires Git Bash, WSL, or similar Unix environment on Windows" -ForegroundColor Cyan
Write-Host "💡 Restart your terminal for global 'see-me' command access" -ForegroundColor Cyan