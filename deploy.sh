#!/bin/bash

# OpTools 一鍵部署腳本 - Ubuntu 22.04
# 使用方法: curl -sSL https://raw.githubusercontent.com/kingbbs/optools/main/deploy.sh | bash

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 顯示帶顏色的訊息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_message $BLUE "🚀 開始部署 OpTools 到 Ubuntu 22.04..."

# 檢查是否為 Ubuntu 22.04
if ! grep -q "Ubuntu 22.04" /etc/os-release; then
    print_message $YELLOW "⚠️  警告：此腳本專為 Ubuntu 22.04 設計，在其他版本上可能無法正常工作"
fi

# 檢查是否為 root 用戶
if [[ $EUID -eq 0 ]]; then
    print_message $RED "❌ 請不要使用 root 用戶運行此腳本，建議創建普通用戶"
    exit 1
fi

# 更新系統
print_message $BLUE "📦 更新系統套件..."
sudo apt update && sudo apt upgrade -y

# 安裝基本工具
print_message $BLUE "🔧 安裝基本工具..."
sudo apt install -y curl wget git vim ufw fail2ban dnsutils whois net-tools

# 安裝 Node.js 18.x
print_message $BLUE "📦 安裝 Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 驗證 Node.js 安裝
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_message $GREEN "✅ Node.js 安裝完成：$NODE_VERSION"
print_message $GREEN "✅ npm 版本：$NPM_VERSION"

# 安裝 PM2
print_message $BLUE "📦 安裝 PM2 進程管理器..."
sudo npm install -g pm2

# 安裝 Chrome (用於 Lighthouse)
print_message $BLUE "📦 安裝 Google Chrome..."
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install -y google-chrome-stable

# 設置部署目錄
DEPLOY_DIR="$HOME/optools"
print_message $BLUE "📁 設置部署目錄：$DEPLOY_DIR"

# 如果目錄已存在，詢問是否備份
if [ -d "$DEPLOY_DIR" ]; then
    print_message $YELLOW "⚠️  目錄 $DEPLOY_DIR 已存在"
    read -p "是否備份現有目錄？(y/N): " backup_choice
    if [[ $backup_choice =~ ^[Yy]$ ]]; then
        BACKUP_NAME="${DEPLOY_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
        mv "$DEPLOY_DIR" "$BACKUP_NAME"
        print_message $GREEN "✅ 已備份到：$BACKUP_NAME"
    else
        rm -rf "$DEPLOY_DIR"
    fi
fi

# 克隆專案
print_message $BLUE "📥 克隆 OpTools 專案..."
git clone https://github.com/kingbbs/optools.git "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

# 安裝依賴
print_message $BLUE "📦 安裝應用依賴..."
npm install

# 創建環境配置
print_message $BLUE "⚙️  創建環境配置..."
cat > .env << EOF
NODE_ENV=production
PORT=3080
HOST=0.0.0.0
EOF

# 創建 PM2 配置
print_message $BLUE "⚙️  創建 PM2 配置..."
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

# 創建日誌目錄
mkdir -p logs

# 測試應用
print_message $BLUE "🧪 測試應用..."
timeout 10s node server.js || print_message $GREEN "✅ 應用測試完成"

# 啟動應用
print_message $BLUE "🚀 啟動應用..."
pm2 start ecosystem.config.js --env production

# 設置開機自啟
print_message $BLUE "⚙️  配置開機自啟..."
pm2 startup | grep "sudo" | bash
pm2 save

# 詢問是否安裝 Nginx
read -p "是否安裝和配置 Nginx 反向代理？(y/N): " nginx_choice
if [[ $nginx_choice =~ ^[Yy]$ ]]; then
    print_message $BLUE "📦 安裝 Nginx..."
    sudo apt install -y nginx
    
    read -p "請輸入您的域名（或留空使用 IP）: " domain_name
    if [ -z "$domain_name" ]; then
        domain_name="_"
    fi
    
    # 創建 Nginx 配置
    sudo tee /etc/nginx/sites-available/optools << EOF
server {
    listen 80;
    server_name $domain_name;

    access_log /var/log/nginx/optools.access.log;
    error_log /var/log/nginx/optools.error.log;

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

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/optools /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    print_message $GREEN "✅ Nginx 配置完成"
fi

# 配置防火牆
print_message $BLUE "🔒 配置防火牆..."
sudo ufw --force enable
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS

if [[ ! $nginx_choice =~ ^[Yy]$ ]]; then
    sudo ufw allow 3080/tcp  # 應用直接端口
fi

# 創建基本監控腳本
print_message $BLUE "📊 創建監控腳本..."
cat > monitor.sh << 'EOF'
#!/bin/bash
LOG_FILE="./logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

if ! pm2 list | grep -q "optools.*online"; then
    echo "[$DATE] OpTools 服務離線，正在重啟..." >> $LOG_FILE
    pm2 restart optools
fi

DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "[$DATE] 警告：磁盤使用率超過 85%：$DISK_USAGE%" >> $LOG_FILE
fi
EOF

chmod +x monitor.sh

# 設置定時監控
(crontab -l 2>/dev/null; echo "*/5 * * * * cd $DEPLOY_DIR && ./monitor.sh") | crontab -

# 顯示部署結果
print_message $GREEN "🎉 OpTools 部署完成！"
echo ""
print_message $BLUE "📋 部署信息："
print_message $GREEN "   應用目錄：$DEPLOY_DIR"
print_message $GREEN "   應用端口：3080"

if [[ $nginx_choice =~ ^[Yy]$ ]]; then
    if [ "$domain_name" != "_" ]; then
        print_message $GREEN "   訪問地址：http://$domain_name"
    else
        SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
        print_message $GREEN "   訪問地址：http://$SERVER_IP"
    fi
else
    SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
    print_message $GREEN "   訪問地址：http://$SERVER_IP:3080"
fi

echo ""
print_message $BLUE "🔧 常用命令："
print_message $YELLOW "   pm2 status          # 查看應用狀態"
print_message $YELLOW "   pm2 logs optools     # 查看日誌"
print_message $YELLOW "   pm2 restart optools  # 重啟應用"
print_message $YELLOW "   pm2 monit           # 監控界面"

echo ""
print_message $BLUE "📚 更多信息請查看：$DEPLOY_DIR/DEPLOYMENT.md"

# 詢問是否立即打開應用
read -p "是否立即測試應用？(y/N): " test_choice
if [[ $test_choice =~ ^[Yy]$ ]]; then
    print_message $BLUE "🧪 測試應用連接..."
    if curl -s http://localhost:3080 > /dev/null; then
        print_message $GREEN "✅ 應用運行正常！"
    else
        print_message $RED "❌ 應用可能未正常啟動，請檢查："
        print_message $YELLOW "   pm2 logs optools"
    fi
fi

print_message $GREEN "🚀 部署完成！享受使用 OpTools！"