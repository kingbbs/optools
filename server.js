const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Domain check API endpoint
app.post('/api/domain-check', async (req, res) => {
    try {
        console.log('Domain check request received:', {
            body: req.body,
            headers: req.headers,
            timestamp: new Date().toISOString()
        });

        const { domain, manualIp, ports = [80] } = req.body;

        console.log('Parsed request data:', {
            domain: domain,
            manualIp: manualIp,
            ports: ports,
            domainType: typeof domain,
            portsType: typeof ports
        });

        if (!domain || typeof domain !== 'string') {
            console.log('Invalid domain error:', { domain, type: typeof domain });
            return res.status(400).json({ error: '請提供域名' });
        }

        const cleanDomain = domain.trim();
        
        // Validate domain format
        const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!domainPattern.test(cleanDomain)) {
            console.log('Invalid domain format error:', { cleanDomain, pattern: domainPattern });
            return res.status(400).json({ error: '無效的域名格式' });
        }

        // Get IPs - use manual IP if provided, otherwise resolve via DNS
        let ips;
        if (manualIp && manualIp.trim()) {
            // Validate manual IP format
            const ipPattern = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
            if (!ipPattern.test(manualIp.trim())) {
                return res.status(400).json({ error: '無效的 IP 地址格式' });
            }
            ips = [manualIp.trim()];
        } else {
            // Get IPs using dig command
            const digCommand = `dig ${cleanDomain} +short`;
            
            ips = await new Promise((resolve, reject) => {
                exec(digCommand, { timeout: 10000 }, (error, stdout, stderr) => {
                    if (error) {
                        reject(new Error(`DNS 查詢失敗: ${stderr || error.message}`));
                        return;
                    }

                    // Extract IP addresses
                    const ipPattern = /([0-9]{1,3}\.){3}[0-9]{1,3}/g;
                    const foundIps = stdout.match(ipPattern) || [];
                    
                    resolve(foundIps);
                });
            });
        }

        if (ips.length === 0) {
            return res.json({
                domain: cleanDomain,
                ips: [],
                results: [],
                error: `沒有找到域名 ${cleanDomain} 的 IP 地址`
            });
        }

        // Check each IP with each port
        const checkPromises = [];
        for (const ip of ips) {
            for (const port of ports) {
                checkPromises.push(checkConnection(cleanDomain, ip, port));
            }
        }
        
        const results = await Promise.allSettled(checkPromises);

        const finalResults = results.map((result) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return {
                    ip: 'unknown',
                    port: 'unknown',
                    success: false,
                    output: `Error: ${result.reason.message}`
                };
            }
        });

        res.json({
            domain: cleanDomain,
            ips: ips,
            results: finalResults
        });

    } catch (error) {
        console.error('Server error:', error);
        console.error('Error stack:', error.stack);
        console.error('Request details:', {
            url: req.url,
            method: req.method,
            body: req.body,
            headers: req.headers
        });
        res.status(500).json({ error: `伺服器錯誤: ${error.message}` });
    }
});

// Web Vitals API endpoint
app.post('/api/web-vitals', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'Please provide a URL' });
        }

        // Validate URL
        let validUrl;
        try {
            validUrl = new URL(url);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        // Use Lighthouse to measure Core Web Vitals
        const lighthouse = require('lighthouse').default || require('lighthouse');
        const chromeLauncher = require('chrome-launcher');

        // Launch Chrome
        const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });
        const options = {
            logLevel: 'error',
            output: 'json',
            onlyCategories: ['performance'],
            port: chrome.port
        };

        // Run Lighthouse
        const runnerResult = await lighthouse(url, options);

        // Extract metrics
        const metrics = runnerResult.lhr.audits;
        
        // Debug: Log available metrics
        console.log('Available metrics:', Object.keys(metrics).filter(key => key.includes('paint') || key.includes('first')));
        
        const webVitals = {
            // TTFP (Time to First Paint) - use first-meaningful-paint as Lighthouse doesn't provide first-paint
            ttfp: metrics['first-meaningful-paint'] ? Math.round(metrics['first-meaningful-paint'].numericValue) : 
                  (metrics['first-contentful-paint'] ? Math.round(metrics['first-contentful-paint'].numericValue) : null),
            // FCP (First Contentful Paint)
            fcp: metrics['first-contentful-paint'] ? Math.round(metrics['first-contentful-paint'].numericValue) : null,
            // LCP (Largest Contentful Paint)
            lcp: metrics['largest-contentful-paint'] ? Math.round(metrics['largest-contentful-paint'].numericValue) : null,
            // INP (Interaction to Next Paint) - fallback to max-potential-fid or total-blocking-time
            inp: metrics['interaction-to-next-paint'] ? Math.round(metrics['interaction-to-next-paint'].numericValue) : 
                 (metrics['max-potential-fid'] ? Math.round(metrics['max-potential-fid'].numericValue) : 
                 (metrics['total-blocking-time'] ? Math.round(metrics['total-blocking-time'].numericValue) : null)),
            // CLS (Cumulative Layout Shift)
            cls: metrics['cumulative-layout-shift'] ? metrics['cumulative-layout-shift'].numericValue : null
        };

        // Calculate overall performance score
        const performanceScore = runnerResult.lhr.categories.performance.score * 100;

        // Generate recommendations based on metrics
        const recommendations = [];
        
        if (webVitals.lcp > 4000) {
            recommendations.push('Improve server response time and optimize largest content element loading');
        }
        if (webVitals.fcp > 3000) {
            recommendations.push('Optimize critical rendering path and reduce render-blocking resources');
        }
        if (webVitals.cls > 0.25) {
            recommendations.push('Specify size attributes for images and embeds to prevent layout shifts');
        }
        if (webVitals.inp && webVitals.inp > 500) {
            recommendations.push('Optimize JavaScript execution and reduce main thread blocking');
        }

        await chrome.kill();

        res.json({
            url: url,
            metrics: webVitals,
            score: performanceScore,
            recommendations: recommendations
        });

    } catch (error) {
        console.error('Web Vitals error:', error);
        res.status(500).json({ error: `Failed to analyze web vitals: ${error.message}` });
    }
});

// IP Lookup API endpoint
app.post('/api/ip-lookup', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Use a simple IP geolocation service (mock implementation)
        // In production, you'd use a real service like ipapi.co or ipinfo.io
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        let ip = query;
        
        if (!ipPattern.test(query)) {
            // If it's a domain, resolve to IP first
            const dns = require('dns');
            ip = await new Promise((resolve, reject) => {
                dns.lookup(query, (err, address) => {
                    if (err) reject(err);
                    else resolve(address);
                });
            });
        }

        // Mock IP information (in production, use a real IP geolocation API)
        const mockData = {
            ip: ip,
            country: 'United States',
            region: 'California',
            city: 'Mountain View',
            isp: 'Google LLC',
            org: 'Google Cloud',
            timezone: 'America/Los_Angeles'
        };

        res.json(mockData);
    } catch (error) {
        console.error('IP Lookup error:', error);
        res.status(500).json({ error: `Failed to lookup IP: ${error.message}` });
    }
});

// WHOIS Lookup API endpoint
app.post('/api/whois-lookup', async (req, res) => {
    try {
        const { domain } = req.body;
        if (!domain) {
            return res.status(400).json({ error: 'Domain parameter is required' });
        }

        const whois = require('whois');
        
        const whoisData = await new Promise((resolve, reject) => {
            whois.lookup(domain, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        res.json({ whoisData });
    } catch (error) {
        console.error('WHOIS Lookup error:', error);
        res.status(500).json({ error: `Failed to perform WHOIS lookup: ${error.message}` });
    }
});

// DNS Lookup API endpoint
app.post('/api/dns-lookup', async (req, res) => {
    try {
        const { domain, types } = req.body;
        if (!domain || !types) {
            return res.status(400).json({ error: 'Domain and types parameters are required' });
        }

        const dns = require('dns');
        const records = {};

        for (const type of types) {
            try {
                switch (type) {
                    case 'A':
                        records[type] = await new Promise((resolve, reject) => {
                            dns.resolve4(domain, (err, addresses) => {
                                if (err) resolve([]);
                                else resolve(addresses);
                            });
                        });
                        break;
                    case 'AAAA':
                        records[type] = await new Promise((resolve, reject) => {
                            dns.resolve6(domain, (err, addresses) => {
                                if (err) resolve([]);
                                else resolve(addresses);
                            });
                        });
                        break;
                    case 'MX':
                        records[type] = await new Promise((resolve, reject) => {
                            dns.resolveMx(domain, (err, addresses) => {
                                if (err) resolve([]);
                                else resolve(addresses.map(mx => `${mx.priority} ${mx.exchange}`));
                            });
                        });
                        break;
                    case 'NS':
                        records[type] = await new Promise((resolve, reject) => {
                            dns.resolveNs(domain, (err, addresses) => {
                                if (err) resolve([]);
                                else resolve(addresses);
                            });
                        });
                        break;
                    case 'TXT':
                        records[type] = await new Promise((resolve, reject) => {
                            dns.resolveTxt(domain, (err, addresses) => {
                                if (err) resolve([]);
                                else resolve(addresses.map(txt => txt.join(' ')));
                            });
                        });
                        break;
                    case 'CNAME':
                        records[type] = await new Promise((resolve, reject) => {
                            dns.resolveCname(domain, (err, addresses) => {
                                if (err) resolve([]);
                                else resolve(addresses);
                            });
                        });
                        break;
                }
            } catch (error) {
                records[type] = [];
            }
        }

        res.json({ records });
    } catch (error) {
        console.error('DNS Lookup error:', error);
        res.status(500).json({ error: `Failed to perform DNS lookup: ${error.message}` });
    }
});

// SSL Certificate Check API endpoint
app.post('/api/ssl-check', async (req, res) => {
    try {
        const { domain } = req.body;
        if (!domain) {
            return res.status(400).json({ error: 'Domain parameter is required' });
        }

        const tls = require('tls');
        const url = require('url');
        
        let hostname = domain;
        let port = 443;
        
        // Parse URL if provided
        if (domain.startsWith('http')) {
            const parsed = new URL(domain);
            hostname = parsed.hostname;
            port = parsed.port || (parsed.protocol === 'https:' ? 443 : 80);
        }

        const certInfo = await new Promise((resolve, reject) => {
            const socket = tls.connect(port, hostname, { 
                rejectUnauthorized: false,
                servername: hostname 
            }, () => {
                const cert = socket.getPeerCertificate();
                socket.destroy();
                resolve(cert);
            });
            
            socket.on('error', (error) => {
                reject(error);
            });
            
            setTimeout(() => {
                socket.destroy();
                reject(new Error('Connection timeout'));
            }, 10000);
        });

        const now = new Date();
        const validTo = new Date(certInfo.valid_to);
        const validFrom = new Date(certInfo.valid_from);
        const daysUntilExpiry = Math.ceil((validTo - now) / (1000 * 60 * 60 * 24));

        res.json({
            valid: now >= validFrom && now <= validTo,
            issuer: certInfo.issuer?.O || 'Unknown',
            subject: certInfo.subject?.CN || hostname,
            validFrom: validFrom.toISOString(),
            validTo: validTo.toISOString(),
            daysUntilExpiry: daysUntilExpiry
        });
    } catch (error) {
        console.error('SSL Check error:', error);
        res.status(500).json({ error: `Failed to check SSL certificate: ${error.message}` });
    }
});

// Security Headers Analysis API endpoint
app.post('/api/security-headers', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const response = await fetch(url, { method: 'HEAD' });
        const headers = response.headers;

        const securityHeaders = {
            'Strict-Transport-Security': {
                present: headers.has('strict-transport-security'),
                value: headers.get('strict-transport-security'),
                description: 'Enforces secure HTTPS connections'
            },
            'Content-Security-Policy': {
                present: headers.has('content-security-policy'),
                value: headers.get('content-security-policy'),
                description: 'Prevents XSS and data injection attacks'
            },
            'X-Frame-Options': {
                present: headers.has('x-frame-options'),
                value: headers.get('x-frame-options'),
                description: 'Prevents clickjacking attacks'
            },
            'X-Content-Type-Options': {
                present: headers.has('x-content-type-options'),
                value: headers.get('x-content-type-options'),
                description: 'Prevents MIME type sniffing'
            },
            'Referrer-Policy': {
                present: headers.has('referrer-policy'),
                value: headers.get('referrer-policy'),
                description: 'Controls referrer information'
            },
            'Permissions-Policy': {
                present: headers.has('permissions-policy'),
                value: headers.get('permissions-policy'),
                description: 'Controls browser features and APIs'
            }
        };

        const presentCount = Object.values(securityHeaders).filter(h => h.present).length;
        const totalCount = Object.keys(securityHeaders).length;
        const score = Math.round((presentCount / totalCount) * 100);

        res.json({
            score,
            headers: securityHeaders
        });
    } catch (error) {
        console.error('Security Headers error:', error);
        res.status(500).json({ error: `Failed to analyze security headers: ${error.message}` });
    }
});

// Function to check connection for a specific IP and port
function checkConnection(domain, ip, port) {
    return new Promise((resolve, reject) => {
        const protocol = port === 443 ? 'https' : 'http';
        const curlCommand = `curl -I ${protocol}://${domain}:${port} --resolve ${domain}:${port}:${ip} --connect-timeout 5 --max-time 10`;
        
        exec(curlCommand, { timeout: 15000 }, (error, stdout, stderr) => {
            let output = `Command: ${curlCommand}\n`;
            output += `Exit code: ${error ? error.code || 1 : 0}\n`;
            output += `STDOUT:\n${stdout}\n`;
            if (stderr) {
                output += `STDERR:\n${stderr}\n`;
            }

            resolve({
                ip: ip,
                port: port,
                success: !error,
                output: output
            });
        });
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: '內部伺服器錯誤' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 IT 運維工具服務器啟動成功！`);
    console.log(`📱 訪問 http://localhost:${PORT} 來使用工具`);
    console.log(`🔧 按 Ctrl+C 停止服務器`);
});