const http = require('http');
const fs = require('fs');
const path = require('path');

const PROXY_PORT = 3334;
const TARGET_PORT = process.argv[2] || 3000;
const CONSOLE_SCRIPT = fs.readFileSync(path.join(__dirname, 'console-wrapper.js'), 'utf8');

console.log(`🔄 Smart proxy: localhost:${PROXY_PORT} → localhost:${TARGET_PORT}`);

const server = http.createServer((req, res) => {
    const proxyReq = http.request({
        hostname: 'localhost',
        port: TARGET_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers
    }, (proxyRes) => {
        const contentType = proxyRes.headers['content-type'] || '';
        
        if (!contentType.includes('text/html')) {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
            return;
        }
        
        let body = '';
        proxyRes.on('data', chunk => body += chunk);
        proxyRes.on('end', () => {
            if (body.includes('<head>')) {
                const script = `<script>${CONSOLE_SCRIPT}</script>`;
                body = body.replace('<head>', `<head>${script}`);
            }
            
            res.writeHead(proxyRes.statusCode, {
                ...proxyRes.headers,
                'content-length': Buffer.byteLength(body)
            });
            res.end(body);
        });
    });
    
    proxyReq.on('error', () => {
        res.writeHead(502);
        res.end('Target server not available');
    });
    
    req.pipe(proxyReq);
});

server.listen(PROXY_PORT, () => {
    console.log(`🌐 Visit http://localhost:${PROXY_PORT} (instead of localhost:${TARGET_PORT})`);
});
