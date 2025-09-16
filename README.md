# OpTools - 運維工具網頁平台

一站式運維工具平台，提供網路診斷、編碼解碼、密碼生成等常用工具。

## 功能特點

### 階段一（已實現）
- **網路診斷工具**
  - Ping 測試
  - Port 檢查
  - DNS 查詢
  - Traceroute
  - SSL/TLS 憑證檢查
  - WHOIS 查詢

- **編碼/解碼工具**
  - Base64 編碼/解碼
  - URL 編碼/解碼
  - JWT 解析
  - JSON 格式化/壓縮
  - YAML 驗證
  - Crontab 解析

- **生成器**
  - 密碼生成器（可自訂規則）
  - UUID 生成器
  - .gitignore 生成器
  - SSH Key 生成指南

- **介面特性**
  - 響應式設計
  - 深色模式支援
  - 模組化架構

## 技術架構

### 前端
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router
- Zustand (狀態管理)
- TanStack Query (API 請求)

### 後端
- Node.js + Express
- TypeScript
- Socket.io (實時通訊)
- JWT (身份驗證)

## 快速開始

### 安裝依賴
```bash
npm run install:all
```

### 開發模式
```bash
npm run dev
```
前端運行在 http://localhost:5173
後端運行在 http://localhost:3001

### 生產構建
```bash
npm run build
npm start
```

## 專案結構
```
optools/
├── client/              # 前端應用
│   ├── src/
│   │   ├── components/  # UI 組件
│   │   ├── pages/      # 頁面組件
│   │   ├── hooks/      # 自定義 Hooks
│   │   └── lib/        # 工具函數
├── server/              # 後端服務
│   ├── src/
│   │   ├── routes/     # API 路由
│   │   └── index.ts    # 服務入口
└── shared/              # 共享類型定義
```

## 後續規劃

### 階段二
- 用戶認證系統
- 權限管理
- 操作日誌
- 團隊協作功能

### 階段三
- 監控儀表板
- 自動化腳本管理
- 知識庫系統
- API 整合

## License

MIT