# see-me Windows PowerShell Installer
# Usage: iwr -useb https://raw.githubusercontent.com/KenKaiii/ken-you-see/main/install.ps1 | iex

$RepoUrl = "https://raw.githubusercontent.com/KenKaiii/ken-you-see/main"
$InstallDir = Get-Location

Write-Host "👀 Installing see-me..." -ForegroundColor Green

# Download see-me script
Write-Host "⬇️  Downloading see-me..." -ForegroundColor Blue
try {
    Invoke-WebRequest -Uri "$RepoUrl/see-me" -OutFile "see-me" -UseBasicParsing
} catch {
    Write-Host "❌ Download failed: $_" -ForegroundColor Red
    exit 1
}

# Create Windows batch wrapper
@"
@echo off
bash "%~dp0see-me" %*
"@ | Out-File -FilePath "see-me.bat" -Encoding ASCII

Write-Host "✅ see-me installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Quick start:" -ForegroundColor Yellow
Write-Host "   npm run dev"
Write-Host "   .\see-me.bat"
Write-Host "   # Visit http://localhost:3334"
Write-Host ""
Write-Host "📚 More commands:" -ForegroundColor Yellow
Write-Host "   .\see-me.bat logs    # View captured logs"
Write-Host "   .\see-me.bat status  # Check services"
Write-Host "   .\see-me.bat stop    # Stop services"
Write-Host ""
Write-Host "💡 Note: Requires Git Bash, WSL, or similar Unix environment on Windows" -ForegroundColor Cyan