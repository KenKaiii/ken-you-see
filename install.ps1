# DevLogger Windows PowerShell Installer
# Usage: iwr -useb https://raw.githubusercontent.com/KenKaiii/ken-you-see/main/install.ps1 | iex

$RepoUrl = "https://raw.githubusercontent.com/KenKaiii/ken-you-see/main"
$InstallDir = Get-Location

Write-Host "🚀 Installing DevLogger..." -ForegroundColor Green

# Download files
Write-Host "⬇️  Downloading debug-init..." -ForegroundColor Blue
try {
    Invoke-WebRequest -Uri "$RepoUrl/debug-init" -OutFile "debug-init" -UseBasicParsing
    Invoke-WebRequest -Uri "$RepoUrl/debug-logger" -OutFile "debug-logger" -UseBasicParsing
} catch {
    Write-Host "❌ Download failed: $_" -ForegroundColor Red
    exit 1
}

# Create wrapper batch files for Windows
@"
@echo off
bash "%~dp0debug-init" %*
"@ | Out-File -FilePath "debug-init.bat" -Encoding ASCII

@"
@echo off
bash "%~dp0debug-logger" %*
"@ | Out-File -FilePath "debug-logger.bat" -Encoding ASCII

Write-Host "✅ DevLogger installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Quick start:" -ForegroundColor Yellow
Write-Host "   .\debug-init.bat"
Write-Host "   .\debug-logger.bat --auto-detect"
Write-Host ""
Write-Host "📚 Or use bash directly:" -ForegroundColor Yellow  
Write-Host "   bash debug-init"
Write-Host "   bash debug-logger --auto-detect"