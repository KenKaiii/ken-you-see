const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
const LOG_FILE = path.join(__dirname, 'browser.log');

let sessionStartTime = Date.now();
let logCache = new Map(); // For deduplication
let logFileLines = []; // Track log file contents for replacement

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
                
                // New session started - update timestamp and clear cache
                if (data.clear === true) {
                    sessionStartTime = Date.now();
                    logCache.clear(); // Reset deduplication for new session
                    logFileLines = []; // Reset file tracking
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
                const logKey = `${log.level}:${log.message}`;
                
                // Server-side deduplication with counts
                if (logCache.has(logKey)) {
                    const existing = logCache.get(logKey);
                    existing.count++;
                    existing.lastSeen = log.timestamp;
                    
                    // Find and update the existing line
                    const lineIndex = logFileLines.findIndex(line => line.includes(log.message) && line.includes(log.level));
                    const newLine = `SESSION:${sessionStartTime}|[${existing.lastSeen}] BROWSER ${log.level}: ${log.message} (seen ${existing.count} times)`;
                    
                    if (lineIndex >= 0) {
                        logFileLines[lineIndex] = newLine;
                    } else {
                        logFileLines.push(newLine);
                    }
                } else {
                    // First time seeing this log
                    logCache.set(logKey, { count: 1, lastSeen: log.timestamp });
                    const newLine = `SESSION:${sessionStartTime}|[${log.timestamp}] BROWSER ${log.level}: ${log.message}`;
                    logFileLines.push(newLine);
                }
                
                // Rewrite entire file with deduplicated lines
                fs.writeFileSync(LOG_FILE, logFileLines.join('\n') + '\n');
                
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
    } else if (req.method === 'POST' && req.url === '/trigger-crawl') {
        // Trigger one-time crawl by broadcasting to all connected browsers
        console.log('🕷️ One-time crawl triggered via API');
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: true, message: 'Crawl triggered'}));
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`🌐 see-me log server running on http://localhost:${PORT}`);
});
