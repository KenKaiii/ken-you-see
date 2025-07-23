// DevLogger Console Wrapper - Captures browser console output
(function() {
    'use strict';
    
    const originalConsole = { ...console };
    const logs = [];
    const LOG_SERVER_URL = 'http://localhost:3333/save-log';
    const CLEAR_LOG_URL = 'http://localhost:3333/clear-logs';
    
    // Start new session - get session timestamp from server
    let currentSessionId = null;
    fetch(CLEAR_LOG_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clear: true })
    }).then(response => response.json())
      .then(data => {
          currentSessionId = data.sessionStart;
          console.log('🔄 New session started:', currentSessionId);
      }).catch(() => {
          currentSessionId = Date.now(); // Fallback
      });
    
    function addLog(level, args) {
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        const timestamp = new Date().toISOString();
        
        // Send directly to server - no client-side deduplication
        fetch(LOG_SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timestamp: timestamp,
                level: level.toUpperCase(),
                message: message
            })
        }).catch(() => {
            // Fallback: store in localStorage if server unavailable
            const fallbackLogs = JSON.parse(localStorage.getItem('devlogger-logs') || '[]');
            fallbackLogs.push({ timestamp, level, message });
            localStorage.setItem('devlogger-logs', JSON.stringify(fallbackLogs));
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
