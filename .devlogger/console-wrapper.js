// DevLogger Console Wrapper - Captures browser console output
(function() {
    'use strict';
    
    const originalConsole = { ...console };
    const logs = [];
    const LOG_SERVER_URL = 'http://localhost:3333/save-log';
    const CLEAR_LOG_URL = 'http://localhost:3333/clear-logs';
    
    // Always clear logs on page load (simple approach)
    fetch(CLEAR_LOG_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clear: true })
    }).catch(() => {}); // Ignore errors during clearing
    
    function hashMessage(msg) {
        try {
            return btoa(JSON.stringify(msg)).slice(0, 10);
        } catch (e) {
            return JSON.stringify(msg).slice(0, 10);
        }
    }
    
    function addLog(level, args) {
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        const hash = hashMessage(message);
        const timestamp = new Date().toISOString();
        
        // Check for duplicates in current session only
        const existing = logs.find(log => log.hash === hash);
        if (existing) {
            existing.count++;
            existing.message = `${message} (seen ${existing.count} times)`;
        } else {
            logs.push({ hash, message, level, timestamp, count: 1 });
        }
        
        // Send to server
        const logEntry = existing || logs[logs.length - 1];
        fetch(LOG_SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timestamp: logEntry.timestamp,
                level: level.toUpperCase(),
                message: logEntry.message
            })
        }).catch(() => {
            localStorage.setItem('devlogger-logs', JSON.stringify(logs));
        });
    }
    
    // Override console methods
    ['log', 'error', 'warn', 'info'].forEach(method => {
        console[method] = function(...args) {
            addLog(method, args);
            originalConsole[method].apply(console, arguments);
        };
    });
    
    // Capture uncaught errors
    window.addEventListener('error', (e) => {
        addLog('error', [`Uncaught Error: ${e.message}`, `at ${e.filename}:${e.lineno}`]);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        addLog('error', [`Unhandled Promise Rejection: ${e.reason}`]);
    });
    
    console.log('🔍 see-me active - console output being captured');
})();
