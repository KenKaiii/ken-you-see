# DevLogger - Universal Debug Logging for Agents

DevLogger automatically captures ALL console logs (browser + CLI) so coding agents can debug without manual copy/paste.

## 🚀 Quick Start (5 minutes)

### Step 1: Copy Files to Your Project
```bash
# Copy these 2 files to your project root:
cp debug-init your-project/
cp debug-logger your-project/
cd your-project/
chmod +x debug-init debug-logger
```

### Step 2: Initialize (One-time Setup)
```bash
# Creates .debug/ folder and sets up logging
./debug-init

# Auto-detects your project type and installs hooks
./debug-logger --auto-detect
```

### Step 3: Start Development Session
```bash
# 1. Start your normal dev server first
npm start                 # React/Next.js (port 3000)
# OR python manage.py runserver  # Django (port 8000)  
# OR php -S localhost:8080       # PHP (port 8080)
# OR any web server

# 2. In a new terminal, find your server
./debug-logger --detect-servers

# 3. Start DevLogger proxy (replace 3000 with your port)
node .debug/log-server.js &
./debug-logger --proxy 3000

# 4. Visit PROXY URL instead of normal URL
# http://localhost:3334 instead of http://localhost:3000
```

**That's it!** All logs are now captured automatically.

## 📂 What Gets Created

```
your-project/
├── .debug/
│   ├── cli.log           ← All terminal commands & output
│   ├── browser.log       ← All console.log/error/warn from browser  
│   ├── console-wrapper.js ← Browser logging script
│   ├── log-server.js     ← Collects browser logs
│   └── universal-hooks.sh ← Captures CLI commands
├── debug-init            ← Setup script
└── debug-logger          ← Main control script
```

## 🔍 How Agents Use the Logs

Agents can read these files to understand what's happening:

### CLI Logs (Every Terminal Command)
```bash
cat .debug/cli.log
```
Shows:
- Every command you run (`npm install`, `git commit`, `python script.py`)
- Command output and error messages  
- Exit codes and timing
- Works with ANY command (not just npm/python)

### Browser Logs (Every Console Message)
```bash
cat .debug/browser.log  
```
Shows:
- All `console.log()`, `console.error()`, `console.warn()` from your app
- JavaScript errors and stack traces
- Network failures, API responses  
- React/Vue component errors
- Timestamps and automatic deduplication

## 🛠️ Commands Reference

### Setup Commands
```bash
./debug-init                    # Initial setup (run once)
./debug-logger --auto-detect    # Install automation (run once)  
```

### Daily Development
```bash
./debug-logger --detect-servers # Find running dev servers
./debug-logger --proxy 3000     # Proxy server on port 3000
./debug-logger --status         # Check what's instrumented
node .debug/log-server.js &     # Start log collection server
```

### Maintenance  
```bash
./debug-logger --remove         # Clean uninstall
./debug-logger --help           # Show all options
```

## ✅ Supported Frameworks

### Browser Logging (Automatic)
- **React, Vue, Angular** - Any JavaScript framework
- **Next.js, Nuxt, SvelteKit** - Meta-frameworks  
- **Django, Flask, Rails** - Backend with HTML templates
- **PHP, WordPress, Laravel** - PHP applications
- **Static HTML** - Plain HTML/CSS/JS sites
- **Any web server** - Works universally via proxy

### CLI Logging (Automatic)  
- **All Commands** - git, npm, python, docker, curl, etc.
- **All Languages** - Node.js, Python, Go, Rust, PHP, Java
- **All Tools** - Package managers, build tools, databases

## 🔧 How It Works

### CLI Logging
- Installs shell hooks that capture every command
- No more copy/pasting terminal output to agents
- Works in bash/zsh across all projects

### Browser Logging  
- Proxy server intercepts your dev server's HTML
- Automatically injects console capture script
- All browser logs sent to `.debug/browser.log`
- Works with any framework - no code changes needed

## 📋 Troubleshooting

### "Port already in use"
```bash
# Kill existing processes
pkill -f "log-server.js"
pkill -f "debug-logger"
```

### "No servers detected"  
```bash
# Start your dev server first, then:
./debug-logger --detect-servers
```

### "Proxy not working"
```bash
# Check if target server is running
curl http://localhost:3000

# Check if proxy is running  
curl http://localhost:3334
```

### "Logs not appearing"
```bash
# Check log server is running
ps aux | grep log-server

# Check proxy is injecting script
curl http://localhost:3334 | grep "DevLogger"
```

### "Shell functions not working"
```bash
# Restart terminal or manually source:
source .debug/universal-hooks.sh
```

## 🗂️ Real Examples

### React Development
```bash
# Setup (once)
./debug-init
./debug-logger --auto-detect

# Daily workflow
npm start                        # React dev server on 3000
node .debug/log-server.js &     # Start log collection  
./debug-logger --proxy 3000    # Proxy with auto-injection
# Visit http://localhost:3334

# Logs captured automatically
tail -f .debug/browser.log      # React component errors, state changes
tail -f .debug/cli.log          # npm commands, build output
```

### Django Development  
```bash
# Setup (once)
./debug-init  
./debug-logger --auto-detect

# Daily workflow
python manage.py runserver      # Django on port 8000
node .debug/log-server.js &    # Start log collection
./debug-logger --proxy 8000   # Proxy Django server
# Visit http://localhost:3334

# Logs captured automatically  
tail -f .debug/browser.log     # JavaScript errors, AJAX failures
tail -f .debug/cli.log         # Django commands, database queries
```

## 🤖 For Coding Agents

When debugging, agents should check:

```bash
# Recent browser errors
grep "ERROR" .debug/browser.log | tail -10

# Recent CLI failures  
grep "EXIT: [^0]" .debug/cli.log | tail -10

# Specific timeframes
grep "2025-07-23T15:" .debug/browser.log

# Command that failed
grep -A 5 -B 5 "npm install" .debug/cli.log
```

## 🔒 Security Notes

- **Development only** - Don't use in production
- **Local files only** - Logs stay on your machine  
- **No network data** - Only captures console output
- **Easy removal** - `./debug-logger --remove` cleans everything

## 📞 Support

- Check `./debug-logger --help` for all options
- Use `./debug-logger --status` to diagnose issues
- Logs are in `.debug/cli.log` and `.debug/browser.log`

---

**Result**: Agents get complete visibility into your development environment without manual copy/paste. Every command, every console message, automatically captured.