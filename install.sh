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
        
        PATH_UPDATED=false
        
        # Add to multiple shell profiles for compatibility
        for profile in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile"; do
            if [ -f "$profile" ] || [ "$profile" = "$HOME/.profile" ]; then
                # Check if PATH export already exists (look for uncommented lines)
                if ! grep -q "^[[:space:]]*export PATH.*\.local/bin" "$profile" 2>/dev/null; then
                    echo "" >> "$profile"
                    echo "# Added by see-me installer" >> "$profile"
                    echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$profile"
                    echo "✅ Updated $(basename "$profile")"
                    PATH_UPDATED=true
                fi
            fi
        done
        
        # Update current session PATH immediately
        export PATH="$HOME/.local/bin:$PATH"
        
        if [ "$PATH_UPDATED" = true ]; then
            echo ""
            echo "🔄 Reloading shell configuration..."
            # Try to reload the current shell's config
            if [ -n "$ZSH_VERSION" ]; then
                # Running in zsh
                if [ -f "$HOME/.zshrc" ]; then
                    source "$HOME/.zshrc" 2>/dev/null || true
                fi
            elif [ -n "$BASH_VERSION" ]; then
                # Running in bash
                if [ -f "$HOME/.bashrc" ]; then
                    source "$HOME/.bashrc" 2>/dev/null || true
                elif [ -f "$HOME/.bash_profile" ]; then
                    source "$HOME/.bash_profile" 2>/dev/null || true
                fi
            fi
        fi
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

# Test if see-me command is immediately available
if command -v see-me >/dev/null 2>&1; then
    echo "🎉 see-me command is ready to use!"
else
    echo "⚠️  Command not immediately available - may need shell restart"
    echo ""
    echo "🔧 Quick fix options:"
    echo "   Option 1: export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo "   Option 2: source ~/.\$(basename \"\$SHELL\")rc"
    echo "   Option 3: restart your terminal"
fi
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
echo "🔍 Test installation:"
echo "   see-me --help"