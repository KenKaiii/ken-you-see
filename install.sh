#!/bin/bash

# see-me installer
# Usage: curl -fsSL https://raw.githubusercontent.com/KenKaiii/ken-you-see/main/install.sh | bash

set -e

REPO_URL="https://raw.githubusercontent.com/KenKaiii/ken-you-see/main"

# Determine global install location
if [[ "$EUID" -eq 0 ]]; then
    # Running as root - install system-wide
    INSTALL_DIR="/usr/local/bin"
else
    # Running as user - install to user's local bin
    INSTALL_DIR="$HOME/.local/bin"
    
    # Create ~/.local/bin if it doesn't exist
    if [ ! -d "$INSTALL_DIR" ]; then
        mkdir -p "$INSTALL_DIR"
        echo "📁 Created $INSTALL_DIR"
    fi
    
    # Add to PATH if not already there
    if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
        echo "🔧 Adding $INSTALL_DIR to PATH..."
        
        # Add to multiple shell profiles for compatibility
        for profile in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile"; do
            if [ -f "$profile" ] || [ "$profile" = "$HOME/.profile" ]; then
                # Check if PATH export already exists
                if ! grep -q "export PATH.*$INSTALL_DIR" "$profile" 2>/dev/null; then
                    echo "" >> "$profile"
                    echo "# Added by see-me installer" >> "$profile"
                    echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$profile"
                    echo "✅ Updated $(basename "$profile")"
                fi
            fi
        done
        
        # Update current session PATH
        export PATH="$HOME/.local/bin:$PATH"
    fi
fi

echo "👀 Installing see-me globally..."
echo "📦 Install location: $INSTALL_DIR"

# Download see-me script
echo "⬇️  Downloading see-me..."
if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$REPO_URL/see-me" -o "$INSTALL_DIR/see-me"
elif command -v wget >/dev/null 2>&1; then
    wget -q "$REPO_URL/see-me" -O "$INSTALL_DIR/see-me"
else
    echo "❌ Neither curl nor wget found. Please install one of them."
    exit 1
fi

# Make executable
chmod +x "$INSTALL_DIR/see-me"

echo "✅ see-me installed successfully!"
echo ""
echo "🎯 Quick start (from any directory):"
echo "   npm run dev & see-me"
echo "   # Visit http://localhost:3334"
echo ""
echo "📚 More commands:"
echo "   see-me logs    # View captured logs"
echo "   see-me status  # Check services"
echo "   see-me stop    # Stop services"
echo ""
if [[ "$EUID" -ne 0 ]] && [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo "💡 Restart your terminal or run: source ~/.$(basename "$SHELL")rc"
fi