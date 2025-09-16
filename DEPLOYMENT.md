# OpTools Ubuntu 22.04 服務器部署指南

本指南將協助您在 Ubuntu 22.04 服務器上部署 OpTools 應用程式。

## 系統要求

### 最低配置
- **OS**: Ubuntu 22.04 LTS
- **CPU**: 1 core
- **RAM**: 1GB
- **存儲**: 10GB
- **網路**: 公網 IP 地址

### 推薦配置
- **OS**: Ubuntu 22.04 LTS
- **CPU**: 2 cores
- **RAM**: 2GB
- **存儲**: 20GB
- **網路**: 公網 IP 地址 + 域名

## 步驟 1: 服務器基礎配置

### 1.1 更新系統
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 安裝必要的系統工具
```bash
sudo apt install -y curl wget git vim ufw fail2ban
```

### 1.3 創建非 root 用戶（如果尚未創建）
```bash
sudo adduser optools
sudo usermod -aG sudo optools
su - optools
```

## 步驟 2: 安裝 Node.js

### 2.1 安裝 Node.js 18.x (推薦版本)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.2 驗證安裝
```bash
node --version  # 應該顯示 v18.x.x
npm --version   # 應該顯示 npm 版本
```

### 2.3 安裝 PM2 進程管理器
```bash
sudo npm install -g pm2
```

## 步驟 3: 安裝依賴工具

### 3.1 安裝 Chrome (用於 Lighthouse)
```bash
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install -y google-chrome-stable
```

### 3.2 安裝網路工具
```bash
sudo apt install -y dnsutils curl whois net-tools
```

## 步驟 4: 部署應用程式

### 4.1 克隆專案
```bash
cd /home/optools
git clone https://github.com/kingbbs/optools.git
cd optools
```

### 4.2 安裝依賴
```bash
npm install
```

### 4.3 設置環境變數
```bash
# 創建環境配置文件
cp .env.example .env 2>/dev/null || touch .env

# 編輯環境變數
cat > .env << EOF
NODE_ENV=production
PORT=3080
HOST=0.0.0.0
EOF
```

### 4.4 測試應用程式
```bash
# 測試應用是否能正常啟動
node server.js
# 按 Ctrl+C 停止測試
```

## 步驟 5: 配置 PM2 進程管理

### 5.1 創建 PM2 配置文件
```bash
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'optools',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3080
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3080,
      HOST: '0.0.0.0'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF
```

### 5.2 創建日誌目錄
```bash
mkdir -p logs
```

### 5.3 啟動應用程式
```bash
# 啟動應用
pm2 start ecosystem.config.js --env production

# 設置 PM2 開機自啟
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u optools --hp /home/optools

# 保存 PM2 配置
pm2 save
```

### 5.4 PM2 常用命令
```bash
pm2 status          # 查看應用狀態
pm2 logs optools     # 查看日誌
pm2 restart optools  # 重啟應用
pm2 stop optools     # 停止應用
pm2 delete optools   # 刪除應用
pm2 monit           # 監控界面
```

## 步驟 6: 配置 Nginx 反向代理（推薦）

### 6.1 安裝 Nginx
```bash
sudo apt install -y nginx
```

### 6.2 創建 Nginx 配置
```bash
sudo tee /etc/nginx/sites-available/optools << EOF
server {
    listen 80;
    server_name your-domain.com;  # 替換為您的域名或服務器 IP

    # 日誌配置
    access_log /var/log/nginx/optools.access.log;
    error_log /var/log/nginx/optools.error.log;

    # 反向代理配置
    location / {
        proxy_pass http://localhost:3080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # 安全設置
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF
```

### 6.3 啟用配置並重啟 Nginx
```bash
sudo ln -s /etc/nginx/sites-available/optools /etc/nginx/sites-enabled/
sudo nginx -t  # 測試配置
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 步驟 7: 配置防火牆

### 7.1 配置 UFW 防火牆
```bash
# 啟用 UFW
sudo ufw enable

# 允許 SSH (根據您的 SSH 端口調整)
sudo ufw allow 22/tcp

# 允許 HTTP 和 HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 查看防火牆狀態
sudo ufw status
```

### 7.2 如果不使用 Nginx，直接開放應用端口
```bash
sudo ufw allow 3080/tcp
```

## 步驟 8: SSL 證書配置（可選但推薦）

### 8.1 安裝 Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 8.2 獲取 SSL 證書
```bash
sudo certbot --nginx -d your-domain.com
```

### 8.3 設置自動續期
```bash
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

## 步驟 9: 監控和維護

### 9.1 創建監控腳本
```bash
cat > monitor.sh << 'EOF'
#!/bin/bash
# OpTools 監控腳本

LOG_FILE="/home/optools/optools/logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# 檢查 PM2 狀態
if ! pm2 list | grep -q "optools.*online"; then
    echo "[$DATE] OpTools 服務離線，正在重啟..." >> $LOG_FILE
    pm2 restart optools
fi

# 檢查磁盤空間
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "[$DATE] 警告：磁盤使用率超過 85%：$DISK_USAGE%" >> $LOG_FILE
fi

# 檢查內存使用
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2 }')
if [ $MEM_USAGE -gt 90 ]; then
    echo "[$DATE] 警告：內存使用率超過 90%：$MEM_USAGE%" >> $LOG_FILE
fi
EOF

chmod +x monitor.sh

# 設置定時監控
crontab -e
# 添加以下行（每 5 分鐘檢查一次）
*/5 * * * * /home/optools/optools/monitor.sh
```

### 9.2 日誌輪轉配置
```bash
sudo tee /etc/logrotate.d/optools << EOF
/home/optools/optools/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 optools optools
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

## 步驟 10: 備份策略

### 10.1 創建備份腳本
```bash
cat > backup.sh << 'EOF'
#!/bin/bash
# OpTools 備份腳本

BACKUP_DIR="/home/optools/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/home/optools/optools"

# 創建備份目錄
mkdir -p $BACKUP_DIR

# 備份應用代碼和配置
tar -czf "$BACKUP_DIR/optools_$DATE.tar.gz" -C /home/optools optools

# 清理 30 天前的備份
find $BACKUP_DIR -name "optools_*.tar.gz" -mtime +30 -delete

echo "備份完成：optools_$DATE.tar.gz"
EOF

chmod +x backup.sh

# 設置每天凌晨 2 點自動備份
crontab -e
# 添加以下行
0 2 * * * /home/optools/optools/backup.sh
```

## 故障排除

### 常見問題

1. **應用無法啟動**
```bash
# 檢查日誌
pm2 logs optools
# 檢查端口是否被佔用
sudo netstat -tlnp | grep 3080
```

2. **Chrome/Lighthouse 問題**
```bash
# 確保 Chrome 正確安裝
google-chrome --version
# 檢查相關進程
ps aux | grep chrome
```

3. **權限問題**
```bash
# 修復權限
sudo chown -R optools:optools /home/optools/optools
chmod +x optools.sh
```

4. **內存不足**
```bash
# 檢查內存使用
free -h
# 重啟應用釋放內存
pm2 restart optools
```

## 訪問應用

部署完成後，您可以通過以下方式訪問 OpTools：

- **使用 Nginx**: `http://your-domain.com` 或 `http://your-server-ip`
- **直接訪問**: `http://your-server-ip:3080`
- **HTTPS (如果配置了 SSL)**: `https://your-domain.com`

## 更新應用

```bash
cd /home/optools/optools
git pull origin main
npm install
pm2 restart optools
```

---

## 快速部署腳本

為了簡化部署過程，您可以使用以下一鍵部署腳本：

```bash
curl -sSL https://raw.githubusercontent.com/kingbbs/optools/main/deploy.sh | bash
```

（注意：請先檢查腳本內容確保安全）