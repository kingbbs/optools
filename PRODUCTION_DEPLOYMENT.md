# OpTools 生產環境部署指南 - optools.saycoo.com

本指南專門用於在 Ubuntu 22.04 服務器上部署 OpTools 到 `optools.saycoo.com` 域名。

## 🎯 部署目標

- **域名**: optools.saycoo.com
- **服務器**: Ubuntu 22.04 LTS
- **服務端口**: 3080 (內部)
- **公網訪問**: 80/443 (通過 Nginx)

## 🚀 快速部署

### 方法一：一鍵部署（推薦）

```bash
# 在服務器上執行
curl -sSL https://raw.githubusercontent.com/kingbbs/optools/main/deploy.sh | bash
```

部署腳本會自動：
- 安裝所有依賴 (Node.js, Chrome, PM2)
- 下載並配置應用
- 設置 PM2 進程管理
- 配置 Nginx 反向代理
- 設置防火牆規則

### 方法二：手動部署

#### 步驟 1: 服務器準備

```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝基本工具
sudo apt install -y curl wget git vim ufw fail2ban

# 創建應用用戶
sudo adduser optools
sudo usermod -aG sudo optools
su - optools
```

#### 步驟 2: 安裝 Node.js 和依賴

```bash
# 安裝 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安裝 PM2
sudo npm install -g pm2

# 安裝 Chrome
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install -y google-chrome-stable

# 安裝網路工具
sudo apt install -y dnsutils whois net-tools
```

#### 步驟 3: 部署應用

```bash
# 切換到應用目錄
cd /home/optools

# 克隆專案
git clone https://github.com/kingbbs/optools.git
cd optools

# 安裝依賴
npm install

# 創建生產環境配置
cat > .env << EOF
NODE_ENV=production
PORT=3080
HOST=0.0.0.0
EOF

# 創建日誌目錄
mkdir -p logs

# 啟動應用
pm2 start ecosystem.config.js --env production

# 設置開機自啟
pm2 startup
pm2 save
```

#### 步驟 4: 配置 Nginx

```bash
# 安裝 Nginx
sudo apt install -y nginx

# 創建 Nginx 配置
sudo tee /etc/nginx/sites-available/optools << EOF
server {
    listen 80;
    server_name optools.saycoo.com;

    # 重定向到 HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name optools.saycoo.com;

    # SSL 配置 (Let's Encrypt 會自動填入)
    ssl_certificate /etc/letsencrypt/live/optools.saycoo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/optools.saycoo.com/privkey.pem;

    # 日誌配置
    access_log /var/log/nginx/optools.access.log;
    error_log /var/log/nginx/optools.error.log;

    # Gzip 壓縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

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
        
        # 處理大文件上傳
        client_max_body_size 10M;
    }

    # 靜態資源快取
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        proxy_pass http://localhost:3080;
        proxy_set_header Host \$host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全設置
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 隱藏 Nginx 版本
    server_tokens off;

    # API 速率限制
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 在 nginx.conf 中添加速率限制配置
sudo sed -i '/http {/a\\tlimit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;' /etc/nginx/nginx.conf

# 啟用站點
sudo ln -s /etc/nginx/sites-available/optools /etc/nginx/sites-enabled/

# 移除默認站點
sudo rm -f /etc/nginx/sites-enabled/default

# 測試配置
sudo nginx -t

# 重啟 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### 步驟 5: 配置 SSL 證書

```bash
# 安裝 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 獲取 SSL 證書
sudo certbot --nginx -d optools.saycoo.com

# 設置自動續期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

#### 步驟 6: 配置防火牆

```bash
# 配置 UFW 防火牆
sudo ufw --force enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# 檢查狀態
sudo ufw status
```

## 📊 生產環境監控

### PM2 監控

```bash
# 查看應用狀態
pm2 status

# 查看詳細信息
pm2 show optools

# 查看日誌
pm2 logs optools

# 重啟應用
pm2 restart optools

# 監控界面
pm2 monit
```

### 系統監控腳本

```bash
# 運行健康檢查
./scripts/monitor.sh check

# 生成系統報告
./scripts/monitor.sh report

# 設置自動監控 (每 5 分鐘)
crontab -e
# 添加：*/5 * * * * /home/optools/optools/scripts/monitor.sh check
```

## 🔧 生產環境維護

### 應用更新

```bash
# 拉取最新代碼
cd /home/optools/optools
git pull origin main

# 安裝新依賴 (如果有)
npm install

# 重啟應用
pm2 restart optools

# 檢查狀態
pm2 status
```

### 備份管理

```bash
# 完整備份
./scripts/backup.sh full

# 僅備份配置
./scripts/backup.sh config

# 查看備份列表
./scripts/backup.sh list

# 設置每日自動備份
crontab -e
# 添加：0 2 * * * /home/optools/optools/scripts/backup.sh full
```

### 日誌管理

```bash
# 查看應用日誌
pm2 logs optools --lines 100

# 查看 Nginx 日誌
sudo tail -f /var/log/nginx/optools.access.log
sudo tail -f /var/log/nginx/optools.error.log

# 清理舊日誌
./scripts/monitor.sh cleanup
```

## 🔒 安全配置

### Fail2Ban 配置

```bash
# 安裝 Fail2Ban
sudo apt install -y fail2ban

# 創建自定義配置
sudo tee /etc/fail2ban/jail.d/nginx-optools.conf << EOF
[nginx-optools]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/optools.error.log
maxretry = 5
bantime = 3600
findtime = 600
EOF

# 重啟 Fail2Ban
sudo systemctl restart fail2ban
```

### 系統加固

```bash
# 禁用 root SSH 登錄
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 設置自動安全更新
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 🌐 域名和 DNS 配置

確保 `optools.saycoo.com` 的 DNS 記錄指向您的服務器：

```
類型: A
名稱: optools
值: 您的服務器 IP 地址
TTL: 300
```

## 📈 性能優化

### Nginx 優化

```bash
# 編輯 Nginx 主配置
sudo vim /etc/nginx/nginx.conf

# 在 http 區塊中添加：
# worker_processes auto;
# worker_connections 1024;
# keepalive_timeout 65;
# client_max_body_size 10M;
```

### Node.js 優化

```bash
# 在 .env 中添加生產環境優化
echo "NODE_OPTIONS=--max-old-space-size=1024" >> .env

# 重啟應用
pm2 restart optools
```

## 🐛 故障排除

### 常見問題

1. **應用無法啟動**
```bash
pm2 logs optools
systemctl status nginx
```

2. **SSL 證書問題**
```bash
sudo certbot certificates
sudo nginx -t
```

3. **域名無法訪問**
```bash
# 檢查 DNS
nslookup optools.saycoo.com

# 檢查防火牆
sudo ufw status

# 檢查 Nginx 配置
sudo nginx -t
```

4. **性能問題**
```bash
# 檢查系統資源
htop
df -h
free -h

# 檢查應用狀態
pm2 monit
```

## 📞 支援聯繫

- **GitHub Issues**: https://github.com/kingbbs/optools/issues
- **文檔**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

**部署完成後，應用將在 https://optools.saycoo.com 提供服務** 🚀