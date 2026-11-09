# see-me 👀

```
    ███████ ███████ ███████       ███    ███ ███████ 
    ██      ██      ██            ████  ████ ██      
    ███████ █████   █████   █████ ██ ████ ██ █████   
         ██ ██      ██            ██  ██  ██ ██      
    ███████ ███████ ███████       ██      ██ ███████ 
    
    Auto-capture browser console logs for coding agents
    No copy/paste needed - agents see everything automatically
```

> [!TIP]
> **Want to build your own apps with AI?** A free 7-day build challenge and 20+ step-by-step projects are in my free community: **[skool.com/raid](https://www.skool.com/raid)**

## 🚀 Super Quick Setup

### Step 1: Install

**macOS/Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/KenKaiii/ken-you-see/main/install.sh | bash
```

**Windows (PowerShell):**
```powershell
iwr -useb https://raw.githubusercontent.com/KenKaiii/ken-you-see/main/install.ps1 | iex
```

**Manual (any platform):**
```bash
# Download see-me script
curl -O https://raw.githubusercontent.com/KenKaiii/ken-you-see/main/see-me
chmod +x see-me
```

### Step 2: Use It
```bash
npm run dev & see-me
# Visit http://localhost:3334 instead of your normal dev server
```

*Global command works from any directory in any shell (bash, zsh, fish, etc.)*

**That's it!** All browser console logs now automatically captured.

## 📱 How It Works

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your Browser  │───▶│   see-me proxy  │───▶│  Your Dev Server│
│  localhost:3334 │    │ (auto-captures) │    │  localhost:3000 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  browser.log    │
                        │ (for agents to  │
                        │     read)       │
                        └─────────────────┘
```

**You use your app normally, logs captured invisibly in background.**

## 🤖 For Coding Agents (Claude Code)

When debugging user issues, just read the log file:

```bash
# See all browser activity
see-me logs

# Find recent errors  
grep "ERROR" .devlogger/browser.log | tail -5

# Search specific issues
grep -i "cannot read property" .devlogger/browser.log

# Live monitoring
tail -f .devlogger/browser.log
```

### Example Agent Debugging:
```
User: "My React app is broken, can you help?"

Agent runs: see-me logs

Agent sees:
[2025-07-23T15:30:45.123Z] BROWSER ERROR: Cannot read property 'map' of undefined at UserList.jsx:23
[2025-07-23T15:30:45.200Z] BROWSER ERROR: Network request failed: 404 /api/users
[2025-07-23T15:30:46.100Z] BROWSER WARN: Component re-rendered 50 times

Agent responds: "I can see the issue - your UserList component is trying to map 
over undefined data because the /api/users endpoint is returning 404. Let me help 
you fix the API endpoint first..."
```

## 🛠️ Commands

```bash
see-me                 # Auto-start logging (detects your project)
see-me logs           # View captured browser logs  
see-me status         # Check if services are running
see-me stop           # Stop logging services
```

## 🎯 What Gets Captured

- ✅ All `console.log()`, `console.error()`, `console.warn()`
- ✅ JavaScript errors with file locations
- ✅ Network failures (if you log them)
- ✅ Performance warnings
- ✅ User interactions (if you log them)
- ✅ Component lifecycle events

## 🔧 Works With Everything

```
    React    Next.js    Vue    Nuxt    Django    Flask
      │        │        │       │        │        │
      └────────┼────────┼───────┼────────┼────────┘
               │        │       │        │
           Auto-detects project type and port
               │        │       │        │
      ┌────────┼────────┼───────┼────────┼────────┐
      │        │        │       │        │        │
   Static   Vite   Angular  Rails    PHP    Rust
```

**No configuration needed - just works.**

## 📋 Quick Examples

### React/Next.js
```bash
npm run dev & see-me
# Visit: http://localhost:3334
```

### Django  
```bash
python manage.py runserver & see-me
# Visit: http://localhost:3334
```

### Any Framework
```bash
# Start your dev server however you normally do
your-dev-command &
see-me
# Visit: http://localhost:3334
```

## 🎪 The Magic

1. **Smart Detection**: Figures out your project (React vs Django vs etc)
2. **Auto Port Finding**: Finds your running dev server automatically  
3. **Invisible Proxy**: Same app experience, but with logging
4. **Agent Ready**: Clean log files that agents can read directly

## 🚨 Troubleshooting

**No server detected?**
```bash
# Start your dev server first, then:
see-me
```

**Services not starting?**  
```bash
see-me stop && see-me
```

**Wrong port detected?**
```bash
# Check what's running:
see-me status
```

---

**🎉 Result: Agents get complete browser debugging context without manual copy/paste!**

```
Before: User manually copies error messages to agent
After:  Agent automatically sees everything that happened
```