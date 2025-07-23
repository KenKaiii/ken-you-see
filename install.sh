#!/bin/bash

# DevLogger Universal Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/KenKaiii/ken-you-see/main/install.sh | bash

set -e

REPO_URL="https://raw.githubusercontent.com/KenKaiii/ken-you-see/main"
INSTALL_DIR="$(pwd)"

echo "🚀 Installing DevLogger..."

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
echo "⬇️  Downloading debug-init..."
if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$REPO_URL/debug-init" -o debug-init
    curl -fsSL "$REPO_URL/debug-logger" -o debug-logger
elif command -v wget >/dev/null 2>&1; then
    wget -q "$REPO_URL/debug-init" -O debug-init
    wget -q "$REPO_URL/debug-logger" -O debug-logger
else
    echo "❌ Neither curl nor wget found. Please install one of them."
    exit 1
fi

# Make executable
chmod +x debug-init debug-logger

echo "✅ DevLogger installed successfully!"
echo ""
echo "🎯 Quick start:"
echo "   ./debug-init"
echo "   ./debug-logger --auto-detect"
echo ""
echo "📚 Full documentation:"
echo "   ./debug-logger --help"