const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
const LOG_FILE = path.join(__dirname, 'browser.log');

let currentSession = null;

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.method === 'POST' && req.url === '/clear-logs') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const newSessionId = data.sessionId;
                
                // Only clear if this is a new session (page refresh)
                if (currentSession !== newSessionId) {
                    currentSession = newSessionId;
                    fs.writeFileSync(LOG_FILE, ''); // Clear the log file
                    console.log(`🔄 Page refresh detected - cleared logs (session: ${newSessionId.slice(0, 8)}...)`);
                }
                
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: true, cleared: currentSession === newSessionId}));
            } catch (err) {
                res.writeHead(400);
                res.end('Invalid JSON');
            }
        });
    } else if (req.method === 'POST' && req.url === '/save-log') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const log = JSON.parse(body);
                const logLine = `[${log.timestamp}] BROWSER ${log.level}: ${log.message}\n`;
                fs.appendFileSync(LOG_FILE, logLine);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: true}));
            } catch (err) {
                res.writeHead(400);
                res.end('Invalid JSON');
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`🌐 see-me log server running on http://localhost:${PORT}`);
});
