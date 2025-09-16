# OpTools - 全方位運維工具平台

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Ubuntu](https://img.shields.io/badge/Ubuntu-22.04-orange.svg)

一站式運維工具平台，提供性能監控、網路診斷、編碼解碼、安全分析等常用工具。

## ✨ 功能特點

### 🚀 Performance Tools (性能工具)
- **Web Vitals 分析器**
  - TTFP (Time to First Paint)
  - FCP (First Contentful Paint)
  - LCP (Largest Contentful Paint)
  - INP (Interaction to Next Paint)
  - CLS (Cumulative Layout Shift)
  - 性能評分和優化建議

### 🔧 Development Tools (開發工具)
- **編碼/解碼工具**
  - Base64 編碼/解碼
  - URL 編碼/解碼
  - HTML Entity 編碼/解碼
  - JWT 解碼器
- **生成器工具**
  - UUID 生成器 (v1 & v4)
  - Hash 生成器 (MD5, SHA-1, SHA-256, SHA-512)
  - Lorem Ipsum 文本生成器
  - 密碼生成器

### 🔒 Security Tools (安全工具)
- **網路安全分析**
  - IP 地理位置查詢
  - WHOIS 域名查詢
  - DNS 記錄查詢 (A, AAAA, MX, NS, TXT, CNAME)
  - SSL 證書檢查器
  - HTTP 安全標頭分析
  - 密碼強度檢測

### 🌐 Network Tools (網路工具)
- **連線診斷**
  - 域名連線測試
  - 多端口檢查
  - IP 解析驗證

### ⚙️ System Features (系統功能)
- 響應式設計
- 深色/淺色模式切換
- 字體大小調整
- 設定導入/導出
- 模組化架構

## 🏗️ 技術架構

### 前端
- 原生 HTML5 + CSS3 + JavaScript ES6+
- 響應式設計 (CSS Grid + Flexbox)
- Web APIs (Fetch, LocalStorage, Crypto)

### 後端
- Node.js + Express.js
- Google Lighthouse (性能分析)
- Chrome Launcher (無頭瀏覽器)
- 系統工具集成 (curl, dig, whois, openssl)

### 依賴套件
- `express` - Web 框架
- `cors` - 跨域資源共享
- `lighthouse` - 性能監控
- `whois` - WHOIS 查詢
- `chrome-launcher` - Chrome 控制

## 🚀 快速開始

### 本地開發
```bash
# 克隆專案
git clone https://github.com/kingbbs/optools.git
cd optools

# 安裝依賴
npm install

# 啟動服務器
./optools.sh start

# 或使用 Node.js 直接啟動
node server.js
```

### 訪問應用
- 本地地址：http://localhost:3080
- 管理腳本：`./optools.sh [start|stop|restart|status]`

## 🐧 Ubuntu 22.04 服務器部署

### 一鍵部署
```bash
curl -sSL https://raw.githubusercontent.com/kingbbs/optools/main/deploy.sh | bash
```

### 手動部署
詳細部署步驟請參考：[DEPLOYMENT.md](DEPLOYMENT.md)

## 📁 專案結構
```
optools/
├── index.html           # 主頁面
├── script.js           # 前端邏輯
├── styles.css          # 樣式文件
├── server.js           # 後端服務器
├── package.json        # 依賴配置
├── optools.sh          # 管理腳本
├── ecosystem.config.js # PM2 配置
├── .env.example        # 環境變數範例
├── nginx.conf.example  # Nginx 配置範例
├── DEPLOYMENT.md       # 部署指南
├── deploy.sh           # 一鍵部署腳本
└── scripts/
    ├── monitor.sh      # 監控腳本
    └── backup.sh       # 備份腳本
```

## 🔧 管理腳本

### optools.sh - 服務管理
```bash
./optools.sh start      # 啟動服務
./optools.sh stop       # 停止服務
./optools.sh restart    # 重啟服務
./optools.sh status     # 查看狀態
./optools.sh logs       # 查看日誌
```

### scripts/monitor.sh - 監控管理
```bash
./scripts/monitor.sh check     # 健康檢查
./scripts/monitor.sh report    # 生成報告
./scripts/monitor.sh cleanup   # 清理日誌
```

### scripts/backup.sh - 備份管理
```bash
./scripts/backup.sh full       # 完整備份
./scripts/backup.sh config     # 配置備份
./scripts/backup.sh restore    # 恢復備份
./scripts/backup.sh list       # 列出備份
```

## 🛠️ 部署需求

### 系統要求
- **操作系統**: Ubuntu 22.04 LTS
- **CPU**: 1+ 核心
- **RAM**: 1GB+
- **存儲**: 10GB+
- **網路**: 公網 IP

### 依賴軟體
- Node.js 18+
- Google Chrome (用於 Lighthouse)
- PM2 (進程管理)
- Nginx (可選，用於反向代理)

## 📊 監控與維護

### PM2 進程管理
```bash
pm2 status              # 查看進程狀態
pm2 logs optools        # 查看應用日誌
pm2 restart optools     # 重啟應用
pm2 monit              # 監控界面
```

### 系統監控
- 自動健康檢查 (每 5 分鐘)
- 磁盤使用率監控
- 內存使用率監控
- 應用響應監控
- 自動重啟故障服務

### 備份策略
- 每日自動備份 (凌晨 2:00)
- 配置文件備份
- 日誌文件輪轉
- 保留 30 天歷史備份

## 🔒 安全配置

### 防火牆設置
```bash
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
```

### SSL 證書 (可選)
```bash
sudo certbot --nginx -d your-domain.com
```

## 🐛 故障排除

### 常見問題
1. **應用無法啟動**: 檢查 `pm2 logs optools`
2. **端口被佔用**: 使用 `netstat -tlnp | grep 3080`
3. **Chrome 問題**: 確認 `google-chrome --version`
4. **權限問題**: 執行 `sudo chown -R $USER:$USER .`

### 支援與回饋
- GitHub Issues: https://github.com/kingbbs/optools/issues
- 部署問題請參考：[DEPLOYMENT.md](DEPLOYMENT.md)

## 📄 License

MIT License - 詳見 [LICENSE](LICENSE) 文件