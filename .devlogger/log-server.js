const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
const LOG_FILE = path.join(__dirname, 'browser.log');

let sessionStartTime = Date.now();

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
                
                // New session started - update timestamp
                if (data.clear === true) {
                    sessionStartTime = Date.now();
                    console.log('🔄 New session started - timestamp updated');
                }
                
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: true, sessionStart: sessionStartTime}));
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
                const logLine = `SESSION:${sessionStartTime}|[${log.timestamp}] BROWSER ${log.level}: ${log.message}\n`;
                fs.appendFileSync(LOG_FILE, logLine);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: true}));
            } catch (err) {
                res.writeHead(400);
                res.end('Invalid JSON');
            }
        });
    } else if (req.method === 'GET' && req.url === '/session') {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(sessionStartTime.toString());
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`🌐 see-me log server running on http://localhost:${PORT}`);
});
