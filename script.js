class OpTools {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.bindEvents();
        this.initNavigation();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });

        // Quick action buttons
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Tool cards
        document.querySelectorAll('.tool-card[data-tool]').forEach(card => {
            const toolBtn = card.querySelector('.tool-btn');
            if (toolBtn) {
                toolBtn.addEventListener('click', () => {
                    this.openTool(card.dataset.tool);
                });
            }
        });

        // Modal close events
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.tool-modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        });

        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Settings button
        const settingsBtn = document.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSection('settings');
            });
        }

        // Domain resolver specific events
        this.bindDomainResolverEvents();
        
        // Web Vitals analyzer specific events
        this.bindWebVitalsEvents();
        
        // Base64 encoder/decoder events
        this.bindBase64Events();
        
        // Password generator events
        this.bindPasswordGeneratorEvents();
        
        // Settings events
        this.bindSettingsEvents();
        
        // Additional encoder/decoder events
        this.bindUrlEncoderEvents();
        this.bindHtmlEncoderEvents();
        this.bindJwtDecoderEvents();
        
        // Generator events
        this.bindUuidGeneratorEvents();
        this.bindHashGeneratorEvents();
        this.bindLoremIpsumEvents();
        
        // Security tools events
        this.bindIpLookupEvents();
        this.bindWhoisLookupEvents();
        this.bindDnsLookupEvents();
        this.bindSslCheckerEvents();
        this.bindSecurityHeadersEvents();
        this.bindPasswordStrengthEvents();
    }

    initNavigation() {
        // Show initial section based on hash or default to dashboard
        const hash = window.location.hash.substring(1);
        if (hash) {
            this.showSection(hash);
        } else {
            this.showSection('dashboard');
        }
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;

            // Update nav item active state
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${sectionId}`) {
                    item.classList.add('active');
                }
            });

            // Update URL hash
            window.location.hash = sectionId;
        }
    }

    handleQuickAction(action) {
        switch(action) {
            case 'ping-test':
                this.openTool('ping-test');
                break;
            case 'base64-encode':
                this.openTool('base64-encoder');
                break;
            case 'generate-password':
                this.openTool('password-generator');
                break;
            case 'domain-lookup':
                this.openTool('domain-resolver');
                break;
            default:
                console.log(`Quick action: ${action}`);
        }
    }

    bindDomainResolverEvents() {
        const checkBtn = document.getElementById('check-domain-btn');
        const domainInput = document.getElementById('domain-input');

        if (checkBtn) {
            checkBtn.addEventListener('click', () => {
                this.checkDomain();
            });
        }

        if (domainInput) {
            domainInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkDomain();
                }
            });
        }
    }

    openTool(toolName) {
        const modalMap = {
            'domain-resolver': 'domain-resolver-modal',
            'web-vitals': 'web-vitals-modal',
            'base64': 'base64-modal',
            'password-generator': 'password-generator-modal',
            'url-encoder': 'url-encoder-modal',
            'html-encoder': 'html-encoder-modal',
            'jwt-decoder': 'jwt-decoder-modal',
            'uuid-generator': 'uuid-generator-modal',
            'hash-generator': 'hash-generator-modal',
            'lorem-ipsum': 'lorem-ipsum-modal',
            'ip-lookup': 'ip-lookup-modal',
            'whois-lookup': 'whois-lookup-modal',
            'dns-lookup': 'dns-lookup-modal',
            'ssl-checker': 'ssl-checker-modal',
            'security-headers': 'security-headers-modal',
            'password-strength': 'password-strength-modal'
        };
        
        const modalId = modalMap[toolName];
        if (modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('hidden');
            }
        } else {
            // For other tools, show a placeholder message
            this.showNotification(`Tool '${toolName}' coming soon!`, 'info');
        }
    }

    closeModal() {
        document.querySelectorAll('.tool-modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    async checkDomain() {
        const domainInput = document.getElementById('domain-input');
        const manualIpInput = document.getElementById('manual-ip');
        const loading = document.getElementById('loading');
        const results = document.getElementById('results');
        const checkBtn = document.getElementById('check-domain-btn');

        let domain = domainInput.value.trim();
        if (!domain) {
            this.showNotification('Please enter a domain', 'error');
            return;
        }

        // Clean domain - remove protocol and path
        domain = domain.replace(/^https?:\/\//, ''); // Remove http:// or https://
        domain = domain.replace(/\/.*$/, ''); // Remove path
        domain = domain.replace(/:\d+$/, ''); // Remove port
        domain = domain.trim();

        if (!domain) {
            this.showNotification('Please enter a valid domain', 'error');
            return;
        }

        // Get selected ports
        const selectedPorts = [];
        document.querySelectorAll('.port-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
            selectedPorts.push(parseInt(checkbox.value));
        });

        // If no ports selected, default to port 80
        if (selectedPorts.length === 0) {
            selectedPorts.push(80);
        }

        // Show loading
        loading.classList.remove('hidden');
        results.innerHTML = '';
        checkBtn.disabled = true;

        try {
            const requestBody = {
                domain: domain,
                ports: selectedPorts
            };

            // Add manual IP if provided
            const manualIp = manualIpInput.value.trim();
            if (manualIp) {
                requestBody.manualIp = manualIp;
            }

            // Debug logging
            console.log('Domain check request:', {
                domain: domain,
                ports: selectedPorts,
                manualIp: manualIp || 'none',
                requestBody: requestBody
            });

            const response = await fetch('/api/domain-check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                // Try to get error details from response
                let errorDetails = '';
                try {
                    const errorData = await response.json();
                    errorDetails = errorData.error || 'Unknown error';
                    console.log('Error response body:', errorData);
                } catch (e) {
                    const errorText = await response.text();
                    errorDetails = errorText || 'No error details';
                    console.log('Error response text:', errorText);
                }
                throw new Error(`HTTP ${response.status}: ${errorDetails}`);
            }

            const data = await response.json();
            console.log('Success response:', data);
            this.displayResults(data);
        } catch (error) {
            console.error('Domain check error:', error);
            console.error('Error stack:', error.stack);
            results.innerHTML = `
                <div class="result-item">
                    <h4>Error</h4>
                    <p style="color: red;">An error occurred while checking: ${error.message}</p>
                    <p style="color: #666; font-size: 14px;">Check browser console for more details</p>
                </div>
            `;
        } finally {
            loading.classList.add('hidden');
            checkBtn.disabled = false;
        }
    }

    displayResults(data) {
        const results = document.getElementById('results');
        
        if (data.error) {
            results.innerHTML = `
                <div class="result-item">
                    <h4>Error</h4>
                    <p style="color: red;">${data.error}</p>
                </div>
            `;
            return;
        }

        if (!data.ips || data.ips.length === 0) {
            results.innerHTML = `
                <div class="result-item">
                    <h4>No IP addresses found</h4>
                    <p>Domain ${data.domain} did not return any IP addresses</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="result-item">
                <h4>Domain: ${data.domain}</h4>
                <p>Testing ${data.ips.length} IP address(es)</p>
            </div>
        `;

        // Group results by IP
        const groupedResults = {};
        data.results.forEach(result => {
            if (!groupedResults[result.ip]) {
                groupedResults[result.ip] = [];
            }
            groupedResults[result.ip].push(result);
        });

        // Display results grouped by IP
        for (const ip in groupedResults) {
            const ipResults = groupedResults[ip];
            html += `
                <div class="result-item">
                    <h4>IP: ${ip}</h4>
            `;
            
            ipResults.forEach((result, index) => {
                const status = result.success ? 'Success' : 'Failed';
                const statusColor = result.success ? 'green' : 'red';
                const portLabel = result.port === 443 ? 'HTTPS' : result.port === 80 ? 'HTTP' : '';
                const outputId = `output-${ip.replace(/\./g, '-')}-${result.port}`;
                
                html += `
                    <div style="margin: 10px 0; padding: 10px; background: rgba(0,0,0,0.05); border-radius: 4px;">
                        <h5 style="margin-bottom: 8px;">
                            Port ${result.port} ${portLabel} - <span style="color: ${statusColor}">${status}</span>
                            <button onclick="toggleOutput('${outputId}')" style="margin-left: 10px; padding: 2px 8px; font-size: 12px; background: #667eea; color: white; border: none; border-radius: 3px; cursor: pointer;">
                                顯示詳細
                            </button>
                        </h5>
                        <pre id="${outputId}" class="terminal-output" style="display: none;">${result.output}</pre>
                    </div>
                `;
            });
            
            html += `</div>`;
        }

        results.innerHTML = html;
    }

    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme toggle button
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Initialize theme on load
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    bindWebVitalsEvents() {
        const analyzeBtn = document.getElementById('analyze-url-btn');
        const urlInput = document.getElementById('url-input');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.analyzeWebVitals();
            });
        }

        if (urlInput) {
            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.analyzeWebVitals();
                }
            });
        }
    }

    async analyzeWebVitals() {
        const urlInput = document.getElementById('url-input');
        const loading = document.getElementById('vitals-loading');
        const results = document.getElementById('vitals-results');
        const analyzeBtn = document.getElementById('analyze-url-btn');

        const url = urlInput.value.trim();
        if (!url) {
            this.showNotification('Please enter a URL', 'error');
            return;
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            this.showNotification('Please enter a valid URL (e.g., https://example.com)', 'error');
            return;
        }

        // Show loading
        loading.classList.remove('hidden');
        results.classList.add('hidden');
        analyzeBtn.disabled = true;

        try {
            const response = await fetch('/api/web-vitals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.displayWebVitalsResults(data);
        } catch (error) {
            console.error('Error:', error);
            results.classList.remove('hidden');
            results.innerHTML = `
                <div class="result-item">
                    <h4>Error</h4>
                    <p style="color: red;">An error occurred while analyzing: ${error.message}</p>
                    <p style="color: #666; font-size: 14px;">Please ensure the backend service is running</p>
                </div>
            `;
        } finally {
            loading.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    }

    displayWebVitalsResults(data) {
        const results = document.getElementById('vitals-results');
        
        if (data.error) {
            results.innerHTML = `
                <div class="result-item">
                    <h4>Error</h4>
                    <p style="color: red;">${data.error}</p>
                </div>
            `;
            results.classList.remove('hidden');
            return;
        }

        // Update metric values
        const metrics = ['ttfp', 'fcp', 'lcp', 'inp', 'cls'];
        metrics.forEach(metric => {
            const valueEl = document.getElementById(`${metric}-value`);
            const statusEl = document.getElementById(`${metric}-status`);
            
            if (valueEl && data.metrics) {
                const value = data.metrics[metric];
                let displayValue = '';
                let status = '';
                
                if (value === null || value === undefined) {
                    displayValue = 'N/A';
                    status = '';
                } else if (metric === 'cls') {
                    displayValue = value.toFixed(3);
                    status = value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
                } else {
                    displayValue = `${value}ms`;
                    
                    // Determine status based on thresholds
                    if (metric === 'lcp') {
                        status = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
                    } else if (metric === 'fcp' || metric === 'ttfp') {
                        status = value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
                    } else if (metric === 'inp') {
                        status = value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
                    }
                }
                
                valueEl.textContent = displayValue;
                statusEl.className = `metric-status ${status}`;
                statusEl.textContent = status ? status.replace('-', ' ').toUpperCase() : '';
            }
        });

        // Update performance score
        const scoreEl = document.getElementById('performance-score');
        if (scoreEl && data.score !== undefined) {
            const score = Math.round(data.score);
            let scoreClass = score >= 90 ? 'good' : score >= 50 ? 'needs-improvement' : 'poor';
            scoreEl.innerHTML = `
                <div class="score-display ${scoreClass}">
                    <h2>${score}</h2>
                    <p>Overall Score</p>
                </div>
            `;
        }

        // Update recommendations
        const recommendationsEl = document.getElementById('recommendations');
        if (recommendationsEl && data.recommendations && data.recommendations.length > 0) {
            recommendationsEl.innerHTML = `
                <h4>Recommendations:</h4>
                <ul>
                    ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            `;
        }

        results.classList.remove('hidden');
    }

    bindBase64Events() {
        const tabBtns = document.querySelectorAll('.encoding-tabs .tab-btn');
        const processBtn = document.getElementById('base64-process-btn');
        const clearBtn = document.getElementById('base64-clear-btn');
        const copyBtn = document.getElementById('base64-copy-btn');
        const input = document.getElementById('base64-input');
        const output = document.getElementById('base64-output');
        
        let currentMode = 'encode';
        
        // Tab switching
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                processBtn.textContent = currentMode === 'encode' ? 'Encode' : 'Decode';
                output.value = '';
            });
        });
        
        // Process button
        if (processBtn) {
            processBtn.addEventListener('click', () => {
                const inputText = input.value;
                if (!inputText) {
                    this.showNotification('Please enter text to process', 'error');
                    return;
                }
                
                try {
                    if (currentMode === 'encode') {
                        output.value = btoa(inputText);
                    } else {
                        output.value = atob(inputText);
                    }
                } catch (error) {
                    this.showNotification('Invalid input for ' + currentMode, 'error');
                    output.value = '';
                }
            });
        }
        
        // Clear button
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                output.value = '';
            });
        }
        
        // Copy button
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                if (output.value) {
                    navigator.clipboard.writeText(output.value).then(() => {
                        this.showNotification('Copied to clipboard!', 'success');
                    });
                } else {
                    this.showNotification('Nothing to copy', 'error');
                }
            });
        }
    }

    bindPasswordGeneratorEvents() {
        const lengthSlider = document.getElementById('password-length');
        const lengthDisplay = document.getElementById('length-display');
        const generateBtn = document.getElementById('generate-password-btn');
        const copyBtn = document.getElementById('copy-password-btn');
        const passwordField = document.getElementById('generated-password');
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('strength-text');
        
        // Update length display
        if (lengthSlider) {
            lengthSlider.addEventListener('input', () => {
                lengthDisplay.textContent = lengthSlider.value;
            });
        }
        
        // Generate password
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                const length = parseInt(lengthSlider.value);
                const useUppercase = document.getElementById('include-uppercase').checked;
                const useLowercase = document.getElementById('include-lowercase').checked;
                const useNumbers = document.getElementById('include-numbers').checked;
                const useSymbols = document.getElementById('include-symbols').checked;
                
                let charset = '';
                if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
                if (useNumbers) charset += '0123456789';
                if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
                
                if (!charset) {
                    this.showNotification('Please select at least one character type', 'error');
                    return;
                }
                
                let password = '';
                for (let i = 0; i < length; i++) {
                    password += charset.charAt(Math.floor(Math.random() * charset.length));
                }
                
                passwordField.value = password;
                
                // Calculate strength
                const strength = this.calculatePasswordStrength(password);
                strengthBar.style.width = strength.percent + '%';
                strengthBar.style.backgroundColor = strength.color;
                strengthText.textContent = strength.text;
            });
            
            // Generate initial password
            generateBtn.click();
        }
        
        // Copy password
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                if (passwordField.value) {
                    navigator.clipboard.writeText(passwordField.value).then(() => {
                        this.showNotification('Password copied to clipboard!', 'success');
                    });
                } else {
                    this.showNotification('Generate a password first', 'error');
                }
            });
        }
    }

    calculatePasswordStrength(password) {
        let strength = 0;
        const checks = [
            { regex: /.{8,}/, points: 20 }, // Length 8+
            { regex: /.{12,}/, points: 20 }, // Length 12+
            { regex: /.{16,}/, points: 20 }, // Length 16+
            { regex: /[A-Z]/, points: 10 }, // Uppercase
            { regex: /[a-z]/, points: 10 }, // Lowercase
            { regex: /[0-9]/, points: 10 }, // Numbers
            { regex: /[^A-Za-z0-9]/, points: 10 } // Symbols
        ];
        
        checks.forEach(check => {
            if (check.regex.test(password)) {
                strength += check.points;
            }
        });
        
        if (strength < 40) {
            return { percent: 33, color: '#ef4444', text: 'Weak' };
        } else if (strength < 70) {
            return { percent: 66, color: '#f59e0b', text: 'Medium' };
        } else {
            return { percent: 100, color: '#10b981', text: 'Strong' };
        }
    }

    bindSettingsEvents() {
        const themeSelect = document.getElementById('theme-select');
        const fontSizeSlider = document.getElementById('font-size');
        const fontSizeDisplay = document.getElementById('font-size-display');
        const autoSaveCheckbox = document.getElementById('auto-save');
        const showAnimationsCheckbox = document.getElementById('show-animations');
        const defaultTimeoutInput = document.getElementById('default-timeout');
        const showRawOutputCheckbox = document.getElementById('show-raw-output');
        const exportBtn = document.getElementById('export-settings-btn');
        const importBtn = document.getElementById('import-settings-btn');
        const clearDataBtn = document.getElementById('clear-data-btn');

        // Load saved settings
        this.loadSettings();

        // Theme selection
        if (themeSelect) {
            themeSelect.addEventListener('change', () => {
                const theme = themeSelect.value;
                this.setTheme(theme);
                this.saveSettings();
            });
        }

        // Font size
        if (fontSizeSlider) {
            fontSizeSlider.addEventListener('input', () => {
                const fontSize = fontSizeSlider.value;
                fontSizeDisplay.textContent = fontSize + 'px';
                document.documentElement.style.fontSize = fontSize + 'px';
                this.saveSettings();
            });
        }

        // Auto-save checkbox
        if (autoSaveCheckbox) {
            autoSaveCheckbox.addEventListener('change', () => {
                this.saveSettings();
            });
        }

        // Show animations checkbox
        if (showAnimationsCheckbox) {
            showAnimationsCheckbox.addEventListener('change', () => {
                document.body.style.setProperty('--animation-duration', 
                    showAnimationsCheckbox.checked ? '0.3s' : '0s');
                this.saveSettings();
            });
        }

        // Default timeout
        if (defaultTimeoutInput) {
            defaultTimeoutInput.addEventListener('change', () => {
                this.saveSettings();
            });
        }

        // Show raw output checkbox
        if (showRawOutputCheckbox) {
            showRawOutputCheckbox.addEventListener('change', () => {
                this.saveSettings();
            });
        }

        // Export settings
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSettings();
            });
        }

        // Import settings
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importSettings();
            });
        }

        // Clear all data
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    localStorage.clear();
                    this.showNotification('All data cleared successfully', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            });
        }
    }

    setTheme(theme) {
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.body.setAttribute('data-theme', theme);
        }
        
        // Update theme toggle button
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            const currentTheme = document.body.getAttribute('data-theme');
            themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    saveSettings() {
        const settings = {
            theme: document.getElementById('theme-select')?.value || 'light',
            fontSize: document.getElementById('font-size')?.value || '14',
            autoSave: document.getElementById('auto-save')?.checked || false,
            showAnimations: document.getElementById('show-animations')?.checked || true,
            defaultTimeout: document.getElementById('default-timeout')?.value || '10',
            showRawOutput: document.getElementById('show-raw-output')?.checked || true
        };
        
        localStorage.setItem('optools-settings', JSON.stringify(settings));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('optools-settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                
                // Apply theme
                const themeSelect = document.getElementById('theme-select');
                if (themeSelect && settings.theme) {
                    themeSelect.value = settings.theme;
                    this.setTheme(settings.theme);
                }
                
                // Apply font size
                const fontSizeSlider = document.getElementById('font-size');
                const fontSizeDisplay = document.getElementById('font-size-display');
                if (fontSizeSlider && settings.fontSize) {
                    fontSizeSlider.value = settings.fontSize;
                    fontSizeDisplay.textContent = settings.fontSize + 'px';
                    document.documentElement.style.fontSize = settings.fontSize + 'px';
                }
                
                // Apply checkboxes
                const autoSave = document.getElementById('auto-save');
                if (autoSave && settings.autoSave !== undefined) {
                    autoSave.checked = settings.autoSave;
                }
                
                const showAnimations = document.getElementById('show-animations');
                if (showAnimations && settings.showAnimations !== undefined) {
                    showAnimations.checked = settings.showAnimations;
                    document.body.style.setProperty('--animation-duration', 
                        settings.showAnimations ? '0.3s' : '0s');
                }
                
                const defaultTimeout = document.getElementById('default-timeout');
                if (defaultTimeout && settings.defaultTimeout) {
                    defaultTimeout.value = settings.defaultTimeout;
                }
                
                const showRawOutput = document.getElementById('show-raw-output');
                if (showRawOutput && settings.showRawOutput !== undefined) {
                    showRawOutput.checked = settings.showRawOutput;
                }
                
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
    }

    exportSettings() {
        const settings = localStorage.getItem('optools-settings');
        if (settings) {
            const blob = new Blob([settings], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'optools-settings.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showNotification('Settings exported successfully', 'success');
        } else {
            this.showNotification('No settings to export', 'error');
        }
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const settings = JSON.parse(e.target.result);
                        localStorage.setItem('optools-settings', JSON.stringify(settings));
                        this.showNotification('Settings imported successfully', 'success');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } catch (error) {
                        this.showNotification('Invalid settings file', 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
        input.click();
    }

    bindUrlEncoderEvents() {
        const tabBtns = document.querySelectorAll('#url-encoder-modal .tab-btn');
        const processBtn = document.getElementById('url-process-btn');
        const clearBtn = document.getElementById('url-clear-btn');
        const copyBtn = document.getElementById('url-copy-btn');
        const input = document.getElementById('url-input');
        const output = document.getElementById('url-output');
        
        let currentMode = 'encode';
        
        // Tab switching
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                processBtn.textContent = currentMode === 'encode' ? 'Encode' : 'Decode';
                output.value = '';
            });
        });
        
        // Process button
        if (processBtn) {
            processBtn.addEventListener('click', () => {
                const inputText = input.value;
                if (!inputText) {
                    this.showNotification('Please enter text to process', 'error');
                    return;
                }
                
                try {
                    if (currentMode === 'encode') {
                        output.value = encodeURIComponent(inputText);
                    } else {
                        output.value = decodeURIComponent(inputText);
                    }
                } catch (error) {
                    this.showNotification('Invalid input for ' + currentMode, 'error');
                    output.value = '';
                }
            });
        }
        
        // Clear and copy buttons
        this.bindClearCopyButtons(clearBtn, copyBtn, input, output);
    }

    bindHtmlEncoderEvents() {
        const tabBtns = document.querySelectorAll('#html-encoder-modal .tab-btn');
        const processBtn = document.getElementById('html-process-btn');
        const clearBtn = document.getElementById('html-clear-btn');
        const copyBtn = document.getElementById('html-copy-btn');
        const input = document.getElementById('html-input');
        const output = document.getElementById('html-output');
        
        let currentMode = 'encode';
        
        // Tab switching
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                processBtn.textContent = currentMode === 'encode' ? 'Encode' : 'Decode';
                output.value = '';
            });
        });
        
        // Process button
        if (processBtn) {
            processBtn.addEventListener('click', () => {
                const inputText = input.value;
                if (!inputText) {
                    this.showNotification('Please enter text to process', 'error');
                    return;
                }
                
                if (currentMode === 'encode') {
                    output.value = this.htmlEncode(inputText);
                } else {
                    output.value = this.htmlDecode(inputText);
                }
            });
        }
        
        // Clear and copy buttons
        this.bindClearCopyButtons(clearBtn, copyBtn, input, output);
    }

    bindJwtDecoderEvents() {
        const decodeBtn = document.getElementById('jwt-decode-btn');
        const clearBtn = document.getElementById('jwt-clear-btn');
        const input = document.getElementById('jwt-input');
        const results = document.getElementById('jwt-results');
        
        if (decodeBtn) {
            decodeBtn.addEventListener('click', () => {
                const jwt = input.value.trim();
                if (!jwt) {
                    this.showNotification('Please enter a JWT token', 'error');
                    return;
                }
                
                try {
                    const parts = jwt.split('.');
                    if (parts.length !== 3) {
                        throw new Error('Invalid JWT format');
                    }
                    
                    const header = JSON.parse(atob(parts[0]));
                    const payload = JSON.parse(atob(parts[1]));
                    const signature = parts[2];
                    
                    document.getElementById('jwt-header').textContent = JSON.stringify(header, null, 2);
                    document.getElementById('jwt-payload').textContent = JSON.stringify(payload, null, 2);
                    document.getElementById('jwt-signature').textContent = signature;
                    
                    results.classList.remove('hidden');
                } catch (error) {
                    this.showNotification('Invalid JWT token', 'error');
                    results.classList.add('hidden');
                }
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                results.classList.add('hidden');
            });
        }
    }

    bindUuidGeneratorEvents() {
        const generateBtn = document.getElementById('generate-uuid-btn');
        const clearBtn = document.getElementById('uuid-clear-btn');
        const copyBtn = document.getElementById('uuid-copy-btn');
        const output = document.getElementById('uuid-output');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                const version = document.getElementById('uuid-version').value;
                const count = parseInt(document.getElementById('uuid-count').value);
                
                let uuids = [];
                for (let i = 0; i < count; i++) {
                    if (version === '4') {
                        uuids.push(this.generateUUIDv4());
                    } else {
                        uuids.push(this.generateUUIDv1());
                    }
                }
                
                output.value = uuids.join('\n');
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                output.value = '';
            });
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                if (output.value) {
                    navigator.clipboard.writeText(output.value).then(() => {
                        this.showNotification('UUIDs copied to clipboard!', 'success');
                    });
                }
            });
        }
    }

    bindHashGeneratorEvents() {
        const generateBtn = document.getElementById('generate-hash-btn');
        const clearBtn = document.getElementById('hash-clear-btn');
        const input = document.getElementById('hash-input');
        const results = document.getElementById('hash-results');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                const text = input.value;
                if (!text) {
                    this.showNotification('Please enter text to hash', 'error');
                    return;
                }
                
                const selectedTypes = Array.from(document.querySelectorAll('.hash-types input:checked'))
                    .map(cb => cb.value);
                
                if (selectedTypes.length === 0) {
                    this.showNotification('Please select at least one hash type', 'error');
                    return;
                }
                
                results.innerHTML = '';
                selectedTypes.forEach(type => {
                    const hash = this.generateHash(text, type);
                    const div = document.createElement('div');
                    div.className = 'hash-result';
                    div.innerHTML = `
                        <h4>${type.toUpperCase()}</h4>
                        <div class="hash-value">${hash}</div>
                        <button onclick="navigator.clipboard.writeText('${hash}')">Copy</button>
                    `;
                    results.appendChild(div);
                });
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                results.innerHTML = '';
            });
        }
    }

    bindLoremIpsumEvents() {
        const generateBtn = document.getElementById('generate-lorem-btn');
        const clearBtn = document.getElementById('lorem-clear-btn');
        const copyBtn = document.getElementById('lorem-copy-btn');
        const output = document.getElementById('lorem-output');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                const type = document.getElementById('lorem-type').value;
                const count = parseInt(document.getElementById('lorem-count').value);
                const startWithLorem = document.getElementById('start-with-lorem').checked;
                
                const text = this.generateLoremIpsum(type, count, startWithLorem);
                output.value = text;
            });
        }
        
        this.bindClearCopyButtons(clearBtn, copyBtn, null, output);
    }

    // Helper functions
    bindClearCopyButtons(clearBtn, copyBtn, input, output) {
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (input) input.value = '';
                output.value = '';
            });
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                if (output.value) {
                    navigator.clipboard.writeText(output.value).then(() => {
                        this.showNotification('Copied to clipboard!', 'success');
                    });
                } else {
                    this.showNotification('Nothing to copy', 'error');
                }
            });
        }
    }

    htmlEncode(str) {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };
        return str.replace(/[&<>"'/]/g, s => entities[s]);
    }

    htmlDecode(str) {
        const entities = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&#x2F;': '/'
        };
        return str.replace(/&[#\w]+;/g, entity => entities[entity] || entity);
    }

    generateUUIDv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    generateUUIDv1() {
        // Simplified UUID v1 (timestamp-based)
        const timestamp = Date.now();
        const random = Math.random().toString(16).substr(2, 8);
        return `${timestamp.toString(16)}-${random.substr(0,4)}-1${random.substr(4,3)}-${random.substr(7,4)}-${random}${Math.random().toString(16).substr(2, 4)}`;
    }

    generateHash(text, type) {
        // Note: This is a simplified implementation for demo purposes
        // In production, you'd want to use a proper crypto library
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Convert to hex and pad based on hash type
        const hex = Math.abs(hash).toString(16);
        switch (type) {
            case 'md5':
                return hex.padStart(32, '0').substr(0, 32);
            case 'sha1':
                return hex.padStart(40, '0').substr(0, 40);
            case 'sha256':
                return hex.padStart(64, '0').substr(0, 64);
            case 'sha512':
                return hex.padStart(128, '0').substr(0, 128);
            default:
                return hex;
        }
    }

    generateLoremIpsum(type, count, startWithLorem) {
        const words = [
            'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
            'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
            'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
            'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
            'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
            'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
            'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
            'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
        ];
        
        const getRandomWords = (num) => {
            const result = [];
            for (let i = 0; i < num; i++) {
                result.push(words[Math.floor(Math.random() * words.length)]);
            }
            return result;
        };
        
        const getSentence = () => {
            const wordCount = Math.floor(Math.random() * 10) + 5;
            const sentenceWords = getRandomWords(wordCount);
            return sentenceWords[0].charAt(0).toUpperCase() + sentenceWords[0].slice(1) + 
                   ' ' + sentenceWords.slice(1).join(' ') + '.';
        };
        
        const getParagraph = () => {
            const sentenceCount = Math.floor(Math.random() * 5) + 3;
            const sentences = [];
            for (let i = 0; i < sentenceCount; i++) {
                sentences.push(getSentence());
            }
            return sentences.join(' ');
        };
        
        let result = [];
        
        if (startWithLorem && count > 0) {
            if (type === 'words') {
                result = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet'];
                result = result.concat(getRandomWords(Math.max(0, count - 5)));
            } else if (type === 'sentences') {
                result.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
                for (let i = 1; i < count; i++) {
                    result.push(getSentence());
                }
            } else { // paragraphs
                result.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');
                for (let i = 1; i < count; i++) {
                    result.push(getParagraph());
                }
            }
        } else {
            if (type === 'words') {
                result = getRandomWords(count);
            } else if (type === 'sentences') {
                for (let i = 0; i < count; i++) {
                    result.push(getSentence());
                }
            } else { // paragraphs
                for (let i = 0; i < count; i++) {
                    result.push(getParagraph());
                }
            }
        }
        
        if (type === 'words') {
            return result.join(' ');
        } else if (type === 'sentences') {
            return result.join(' ');
        } else {
            return result.join('\n\n');
        }
    }

    // Security Tools Functions
    bindIpLookupEvents() {
        const lookupBtn = document.getElementById('lookup-ip-btn');
        const clearBtn = document.getElementById('ip-clear-btn');
        const input = document.getElementById('ip-input');
        const loading = document.getElementById('ip-loading');
        const results = document.getElementById('ip-results');

        if (lookupBtn) {
            lookupBtn.addEventListener('click', async () => {
                const query = input.value.trim();
                if (!query) {
                    this.showNotification('Please enter an IP address or domain', 'error');
                    return;
                }

                loading.classList.remove('hidden');
                results.classList.add('hidden');
                lookupBtn.disabled = true;

                try {
                    const response = await fetch('/api/ip-lookup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query })
                    });

                    const data = await response.json();
                    this.displayIpResults(data);
                } catch (error) {
                    this.showNotification('Failed to lookup IP: ' + error.message, 'error');
                } finally {
                    loading.classList.add('hidden');
                    lookupBtn.disabled = false;
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                results.classList.add('hidden');
            });
        }
    }

    bindWhoisLookupEvents() {
        const lookupBtn = document.getElementById('lookup-whois-btn');
        const clearBtn = document.getElementById('whois-clear-btn');
        const input = document.getElementById('whois-input');
        const loading = document.getElementById('whois-loading');
        const results = document.getElementById('whois-results');

        if (lookupBtn) {
            lookupBtn.addEventListener('click', async () => {
                const domain = input.value.trim();
                if (!domain) {
                    this.showNotification('Please enter a domain name', 'error');
                    return;
                }

                loading.classList.remove('hidden');
                results.classList.add('hidden');
                lookupBtn.disabled = true;

                try {
                    const response = await fetch('/api/whois-lookup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ domain })
                    });

                    const data = await response.json();
                    document.getElementById('whois-data').textContent = data.whoisData || 'No WHOIS data available';
                    results.classList.remove('hidden');
                } catch (error) {
                    this.showNotification('Failed to perform WHOIS lookup: ' + error.message, 'error');
                } finally {
                    loading.classList.add('hidden');
                    lookupBtn.disabled = false;
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                results.classList.add('hidden');
            });
        }
    }

    bindDnsLookupEvents() {
        const lookupBtn = document.getElementById('lookup-dns-btn');
        const clearBtn = document.getElementById('dns-clear-btn');
        const input = document.getElementById('dns-input');
        const loading = document.getElementById('dns-loading');
        const results = document.getElementById('dns-results');

        if (lookupBtn) {
            lookupBtn.addEventListener('click', async () => {
                const domain = input.value.trim();
                if (!domain) {
                    this.showNotification('Please enter a domain name', 'error');
                    return;
                }

                const selectedTypes = Array.from(document.querySelectorAll('.dns-types input:checked'))
                    .map(cb => cb.value);

                if (selectedTypes.length === 0) {
                    this.showNotification('Please select at least one record type', 'error');
                    return;
                }

                loading.classList.remove('hidden');
                results.classList.add('hidden');
                lookupBtn.disabled = true;

                try {
                    const response = await fetch('/api/dns-lookup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ domain, types: selectedTypes })
                    });

                    const data = await response.json();
                    this.displayDnsResults(data);
                } catch (error) {
                    this.showNotification('Failed to perform DNS lookup: ' + error.message, 'error');
                } finally {
                    loading.classList.add('hidden');
                    lookupBtn.disabled = false;
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                results.classList.add('hidden');
            });
        }
    }

    bindSslCheckerEvents() {
        const checkBtn = document.getElementById('check-ssl-btn');
        const clearBtn = document.getElementById('ssl-clear-btn');
        const input = document.getElementById('ssl-input');
        const loading = document.getElementById('ssl-loading');
        const results = document.getElementById('ssl-results');

        if (checkBtn) {
            checkBtn.addEventListener('click', async () => {
                const domain = input.value.trim();
                if (!domain) {
                    this.showNotification('Please enter a domain or URL', 'error');
                    return;
                }

                loading.classList.remove('hidden');
                results.classList.add('hidden');
                checkBtn.disabled = true;

                try {
                    const response = await fetch('/api/ssl-check', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ domain })
                    });

                    const data = await response.json();
                    this.displaySslResults(data);
                } catch (error) {
                    this.showNotification('Failed to check SSL certificate: ' + error.message, 'error');
                } finally {
                    loading.classList.add('hidden');
                    checkBtn.disabled = false;
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                results.classList.add('hidden');
            });
        }
    }

    bindSecurityHeadersEvents() {
        const analyzeBtn = document.getElementById('analyze-headers-btn');
        const clearBtn = document.getElementById('headers-clear-btn');
        const input = document.getElementById('headers-input');
        const loading = document.getElementById('headers-loading');
        const results = document.getElementById('headers-results');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', async () => {
                const url = input.value.trim();
                if (!url) {
                    this.showNotification('Please enter a URL', 'error');
                    return;
                }

                loading.classList.remove('hidden');
                results.classList.add('hidden');
                analyzeBtn.disabled = true;

                try {
                    const response = await fetch('/api/security-headers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url })
                    });

                    const data = await response.json();
                    this.displaySecurityHeadersResults(data);
                } catch (error) {
                    this.showNotification('Failed to analyze security headers: ' + error.message, 'error');
                } finally {
                    loading.classList.add('hidden');
                    analyzeBtn.disabled = false;
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                results.classList.add('hidden');
            });
        }
    }

    bindPasswordStrengthEvents() {
        const checkBtn = document.getElementById('check-strength-btn');
        const clearBtn = document.getElementById('password-clear-btn');
        const toggleBtn = document.getElementById('toggle-password');
        const input = document.getElementById('password-input');
        const results = document.getElementById('strength-results');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const type = input.getAttribute('type');
                input.setAttribute('type', type === 'password' ? 'text' : 'password');
                toggleBtn.textContent = type === 'password' ? '🙈' : '👁️';
            });
        }

        if (checkBtn) {
            checkBtn.addEventListener('click', () => {
                const password = input.value;
                if (!password) {
                    this.showNotification('Please enter a password', 'error');
                    return;
                }

                const analysis = this.analyzePasswordStrength(password);
                this.displayPasswordStrengthResults(analysis);
                results.classList.remove('hidden');
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                results.classList.add('hidden');
            });
        }

        // Real-time analysis
        if (input) {
            input.addEventListener('input', () => {
                if (input.value && !results.classList.contains('hidden')) {
                    const analysis = this.analyzePasswordStrength(input.value);
                    this.displayPasswordStrengthResults(analysis);
                }
            });
        }
    }

    // Display functions
    displayIpResults(data) {
        const details = document.getElementById('ip-details');
        if (data.error) {
            details.innerHTML = `<p class="error">${data.error}</p>`;
        } else {
            details.innerHTML = `
                <div class="info-grid">
                    <div class="info-item"><strong>IP:</strong> ${data.ip || 'N/A'}</div>
                    <div class="info-item"><strong>Country:</strong> ${data.country || 'N/A'}</div>
                    <div class="info-item"><strong>Region:</strong> ${data.region || 'N/A'}</div>
                    <div class="info-item"><strong>City:</strong> ${data.city || 'N/A'}</div>
                    <div class="info-item"><strong>ISP:</strong> ${data.isp || 'N/A'}</div>
                    <div class="info-item"><strong>Organization:</strong> ${data.org || 'N/A'}</div>
                    <div class="info-item"><strong>Timezone:</strong> ${data.timezone || 'N/A'}</div>
                </div>
            `;
        }
        document.getElementById('ip-results').classList.remove('hidden');
    }

    displayDnsResults(data) {
        const results = document.getElementById('dns-results');
        if (data.error) {
            results.innerHTML = `<p class="error">${data.error}</p>`;
        } else {
            let html = '';
            Object.keys(data.records).forEach(type => {
                if (data.records[type].length > 0) {
                    html += `
                        <div class="dns-record-type">
                            <h4>${type} Records</h4>
                            <ul>
                                ${data.records[type].map(record => `<li>${record}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                }
            });
            results.innerHTML = html || '<p>No DNS records found</p>';
        }
        results.classList.remove('hidden');
    }

    displaySslResults(data) {
        const results = document.getElementById('ssl-results');
        const status = results.querySelector('.ssl-status');
        const details = results.querySelector('.ssl-details');

        if (data.error) {
            status.innerHTML = `<div class="status-error">❌ SSL Check Failed</div>`;
            details.innerHTML = `<p>${data.error}</p>`;
        } else {
            const isValid = data.valid;
            status.innerHTML = `
                <div class="status-${isValid ? 'success' : 'error'}">
                    ${isValid ? '✅ SSL Certificate Valid' : '❌ SSL Certificate Invalid'}
                </div>
            `;
            
            details.innerHTML = `
                <div class="ssl-info">
                    <div><strong>Issuer:</strong> ${data.issuer || 'N/A'}</div>
                    <div><strong>Subject:</strong> ${data.subject || 'N/A'}</div>
                    <div><strong>Valid From:</strong> ${data.validFrom || 'N/A'}</div>
                    <div><strong>Valid To:</strong> ${data.validTo || 'N/A'}</div>
                    <div><strong>Days Until Expiry:</strong> ${data.daysUntilExpiry || 'N/A'}</div>
                </div>
            `;
        }
        results.classList.remove('hidden');
    }

    displaySecurityHeadersResults(data) {
        const results = document.getElementById('headers-results');
        const scoreDiv = results.querySelector('.security-score');
        const analysisDiv = results.querySelector('.headers-analysis');

        if (data.error) {
            scoreDiv.innerHTML = `<div class="error">${data.error}</div>`;
            analysisDiv.innerHTML = '';
        } else {
            const score = data.score || 0;
            const scoreClass = score >= 80 ? 'good' : score >= 60 ? 'medium' : 'poor';
            
            scoreDiv.innerHTML = `
                <div class="score-display ${scoreClass}">
                    <h3>Security Score: ${score}/100</h3>
                </div>
            `;
            
            let analysisHtml = '<div class="headers-list">';
            Object.keys(data.headers).forEach(header => {
                const info = data.headers[header];
                analysisHtml += `
                    <div class="header-item ${info.present ? 'present' : 'missing'}">
                        <strong>${header}:</strong>
                        <span class="status">${info.present ? '✅ Present' : '❌ Missing'}</span>
                        ${info.value ? `<div class="value">${info.value}</div>` : ''}
                        ${info.description ? `<div class="description">${info.description}</div>` : ''}
                    </div>
                `;
            });
            analysisHtml += '</div>';
            analysisDiv.innerHTML = analysisHtml;
        }
        results.classList.remove('hidden');
    }

    analyzePasswordStrength(password) {
        const checks = {
            length: password.length >= 8,
            lengthGood: password.length >= 12,
            lengthExcellent: password.length >= 16,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /\d/.test(password),
            symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            noRepeats: !/(.)\1{2,}/.test(password),
            noCommon: !this.isCommonPassword(password)
        };

        const score = Object.values(checks).filter(Boolean).length;
        const maxScore = Object.keys(checks).length;
        const percentage = Math.round((score / maxScore) * 100);

        let strength, color;
        if (percentage < 40) {
            strength = 'Very Weak';
            color = '#dc2626';
        } else if (percentage < 60) {
            strength = 'Weak';
            color = '#ea580c';
        } else if (percentage < 80) {
            strength = 'Medium';
            color = '#d97706';
        } else if (percentage < 95) {
            strength = 'Strong';
            color = '#16a34a';
        } else {
            strength = 'Very Strong';
            color = '#15803d';
        }

        return {
            checks,
            score: percentage,
            strength,
            color,
            recommendations: this.getPasswordRecommendations(checks)
        };
    }

    isCommonPassword(password) {
        const common = ['password', '123456', 'password123', 'admin', 'qwerty', 'letmein'];
        return common.some(p => password.toLowerCase().includes(p));
    }

    getPasswordRecommendations(checks) {
        const recommendations = [];
        if (!checks.length) recommendations.push('Use at least 8 characters');
        if (!checks.lengthGood) recommendations.push('Consider using 12+ characters for better security');
        if (!checks.uppercase) recommendations.push('Add uppercase letters (A-Z)');
        if (!checks.lowercase) recommendations.push('Add lowercase letters (a-z)');
        if (!checks.numbers) recommendations.push('Add numbers (0-9)');
        if (!checks.symbols) recommendations.push('Add special characters (!@#$%^&*)');
        if (!checks.noRepeats) recommendations.push('Avoid repeating characters');
        if (!checks.noCommon) recommendations.push('Avoid common passwords and words');
        
        if (recommendations.length === 0) {
            recommendations.push('Excellent password! Consider using a password manager.');
        }
        
        return recommendations;
    }

    displayPasswordStrengthResults(analysis) {
        const strengthBar = document.getElementById('password-strength-bar');
        const strengthText = document.getElementById('password-strength-text');
        const criteriaList = document.getElementById('strength-criteria');
        const recommendationsList = document.getElementById('security-recommendations');

        // Update strength bar
        strengthBar.style.width = analysis.score + '%';
        strengthBar.style.backgroundColor = analysis.color;
        strengthText.textContent = analysis.strength;
        strengthText.style.color = analysis.color;

        // Update criteria
        criteriaList.innerHTML = '';
        Object.keys(analysis.checks).forEach(check => {
            const li = document.createElement('li');
            li.className = analysis.checks[check] ? 'pass' : 'fail';
            li.innerHTML = `${analysis.checks[check] ? '✅' : '❌'} ${this.getCriteriaText(check)}`;
            criteriaList.appendChild(li);
        });

        // Update recommendations
        recommendationsList.innerHTML = '';
        analysis.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recommendationsList.appendChild(li);
        });
    }

    getCriteriaText(check) {
        const texts = {
            length: 'At least 8 characters',
            lengthGood: 'At least 12 characters',
            lengthExcellent: 'At least 16 characters',
            uppercase: 'Contains uppercase letters',
            lowercase: 'Contains lowercase letters',
            numbers: 'Contains numbers',
            symbols: 'Contains special characters',
            noRepeats: 'No repeating characters',
            noCommon: 'Not a common password'
        };
        return texts[check] || check;
    }
}

// Global function for toggling terminal output display
function toggleOutput(outputId) {
    const outputElement = document.getElementById(outputId);
    const button = event.target;
    
    if (outputElement.style.display === 'none') {
        outputElement.style.display = 'block';
        button.textContent = '隱藏詳細';
    } else {
        outputElement.style.display = 'none';
        button.textContent = '顯示詳細';
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    /* Dark theme styles */
    [data-theme="dark"] {
        --bg-color: #1a1a1a;
        --card-bg: #2d2d2d;
        --text-primary: #e5e5e5;
        --text-secondary: #a0a0a0;
        --border-color: #404040;
        --sidebar-bg: #1f1f1f;
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new OpTools();
    app.loadTheme();
});