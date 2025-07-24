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
          // Session started silently
      }).catch(() => {
          currentSessionId = Date.now(); // Fallback
      });
    
    function addLog(level, args) {
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                if (arg === null) return 'null';
                if (arg instanceof Error) {
                    return `${arg.name}: ${arg.message}${arg.stack ? '\n' + arg.stack : ''}`;
                }
                try {
                    const jsonStr = JSON.stringify(arg, null, 2);
                    // If JSON.stringify returns {}, try to extract properties manually
                    if (jsonStr === '{}' && arg.constructor && arg.constructor.name) {
                        const props = [];
                        for (let key in arg) {
                            try {
                                props.push(`${key}: ${arg[key]}`);
                            } catch (e) {}
                        }
                        // Also try common Error properties
                        if (arg.name) props.push(`name: "${arg.name}"`);
                        if (arg.message) props.push(`message: "${arg.message}"`);
                        if (props.length > 0) {
                            return `{${props.join(', ')}}`;
                        }
                        return `[${arg.constructor.name} object]`;
                    }
                    return jsonStr;
                } catch (e) {
                    return `[Object: ${Object.prototype.toString.call(arg)}]`;
                }
            }
            return String(arg);
        }).join(' ');
        
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
    
    // Poll for one-time crawl triggers from agent
    let lastCrawlCheck = 0;
    setInterval(() => {
        fetch('http://localhost:3333/session')
            .then(response => response.text())
            .then(sessionId => {
                // If session changed, it means crawl was triggered
                if (sessionId !== currentSessionId && sessionId > lastCrawlCheck) {
                    lastCrawlCheck = Date.now();
                    originalConsole.log('🕷️ One-time crawl triggered by agent');
                    setTimeout(() => {
                        startAutoCrawler();
                    }, 1000); // Brief delay for page stability
                }
            })
            .catch(() => {}); // Ignore network errors
    }, 2000); // Check every 2 seconds
    
    function startAutoCrawler() {
        const visitedElements = new Set();
        const visitedUrls = new Set([window.location.href]);
        
        function findInteractiveElements() {
            const selectors = [
                'a[href]:not([href^="mailto:"]):not([href^="tel:"]):not([href^="#"])',
                'button:not([type="submit"])',
                '[onclick]',
                '[role="button"]',
                '.btn:not(form .btn)',
                '.button:not(form .button)',
                '[tabindex="0"]:not(input):not(textarea)'
            ];
            
            const elements = [];
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    // Skip if inside form or has dangerous text
                    const text = el.textContent.toLowerCase();
                    const dangerousWords = ['delete', 'remove', 'logout', 'sign out', 'clear all'];
                    if (el.closest('form') || dangerousWords.some(word => text.includes(word))) {
                        return;
                    }
                    
                    const elementId = el.tagName + (el.href || el.onclick || el.textContent.slice(0, 20));
                    if (!visitedElements.has(elementId)) {
                        elements.push({ element: el, id: elementId });
                    }
                });
            });
            return elements;
        }
        
        function crawlInteractiveElements() {
            const elements = findInteractiveElements();
            if (elements.length === 0) return;
            
            originalConsole.log(\`🔍 Auto-crawler found \${elements.length} interactive elements\`);
            
            elements.forEach(({ element, id }, index) => {
                setTimeout(() => {
                    visitedElements.add(id);
                    
                    try {
                        if (element.tagName === 'A' && element.href) {
                            // For links, check if same origin
                            const url = new URL(element.href, window.location.origin);
                            if (url.origin === window.location.origin && !visitedUrls.has(url.href)) {
                                visitedUrls.add(url.href);
                                originalConsole.log(\`🔗 Auto-crawl: Navigating to \${url.pathname}\`);
                                window.location.href = url.href;
                                return;
                            }
                        } else {
                            // For buttons and other interactive elements
                            originalConsole.log(\`🖱️ Auto-crawl: Clicking \${element.tagName} - "\${element.textContent.slice(0, 30)}"\`);
                            element.click();
                        }
                    } catch (error) {
                        addLog('error', [\`Auto-crawler error on \${element.tagName}:\`, error]);
                    }
                }, index * 500); // Stagger interactions
            });
        }
        
        crawlInteractiveElements();
    }
    
    // Silent activation - no noise in logs
})();
