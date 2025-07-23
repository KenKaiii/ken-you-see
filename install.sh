#!/bin/bash

# see-me installer
# Usage: curl -fsSL https://raw.githubusercontent.com/KenKaiii/ken-you-see/main/install.sh | bash

set -e

REPO_URL="https://raw.githubusercontent.com/KenKaiii/ken-you-see/main"
INSTALL_DIR="$(pwd)"

echo "👀 Installing see-me..."

# Platform detection
OS=""
case "$(uname -s)" in
    Darwin*)    OS="macos" ;;
    Linux*)     OS="linux" ;;
    MINGW*)     OS="windows" ;;
    CYGWIN*)    OS="windows" ;;
    *)          OS="unknown" ;;
esac

echo "📦 Detected platform: $OS"

# Download files
echo "⬇️  Downloading see-me..."
if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$REPO_URL/see-me" -o see-me
elif command -v wget >/dev/null 2>&1; then
    wget -q "$REPO_URL/see-me" -O see-me
else
    echo "❌ Neither curl nor wget found. Please install one of them."
    exit 1
fi

# Make executable
chmod +x see-me

echo "✅ see-me installed successfully!"
echo ""
echo "🎯 Quick start:"
echo "   npm run dev & see-me"
echo "   # Visit http://localhost:3334"
echo ""
echo "📚 More commands:"
echo "   see-me logs    # View captured logs"
echo "   see-me status  # Check services"
echo "   see-me stop    # Stop services"