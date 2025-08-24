# 問AI 2.0 AI教育平台

基於蘇格拉底式教學法的AI教育平台，透過AI引導學生思考而非直接提供答案，培養批判性思維和問題解決能力。

## 功能特色

- **蘇格拉底式對話引擎**: AI將複雜問題分解為步驟，透過問題引導學生思考
- **多模態AI服務**: 支援圖片、語音等多種輸入方式
- **個人化學習路徑**: 根據學生程度提供客製化學習內容
- **即時評估系統**: 自動批改簡答題並提供改進建議
- **教師監控面板**: 追蹤學生學習進度和困難點

## 技術架構

### 前端
- React + TypeScript
- Material-UI
- React Query
- Socket.IO客戶端

### 後端
- Node.js + Express
- PostgreSQL + Redis
- Socket.IO
- 多AI服務整合 (OpenAI, Google Gemini, Claude, Azure)

## 快速開始

### 前置需求
- Docker & Docker Compose
- Node.js 18+

### 環境設定

1. 複製環境變數範本：
```bash
cp backend/.env.example backend/.env
```

2. 編輯 `backend/.env` 檔案，填入您的API Keys：
```env
# AI服務API Keys
OPENAI_API_KEY=your-openai-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key
CLAUDE_API_KEY=your-claude-api-key
AZURE_OPENAI_API_KEY=your-azure-openai-api-key

# Azure服務
AZURE_COMPUTER_VISION_KEY=your-azure-computer-vision-key
AZURE_SPEECH_KEY=your-azure-speech-key

# Pinecone向量資料庫
PINECONE_API_KEY=your-pinecone-api-key
```

### 本地開發

#### 方式一：使用Docker (推薦)

1. 確保 Docker Desktop 已啟動
2. 執行自動設置腳本：
```bash
./scripts/setup.sh
```

3. 安裝依賴並啟動服務：
```bash
# 後端
cd backend && npm install && npm run dev

# 前端 (另開終端)
cd frontend && npm install && npm start
```

#### 方式二：本地安裝 (不使用Docker)

1. 執行本地設置腳本：
```bash
./scripts/setup-local.sh
```

2. 手動安裝 PostgreSQL 和 Redis：
```bash
# macOS (使用Homebrew)
brew install postgresql redis
brew services start postgresql
brew services start redis

# Ubuntu/Debian
sudo apt-get install postgresql redis-server
```

3. 安裝依賴並啟動服務：
```bash
# 後端
cd backend && npm install && npm run dev

# 前端 (另開終端)
cd frontend && npm install && npm start
```

4. 開啟瀏覽器訪問 http://localhost:3000

### 測試

```bash
# 後端測試
cd backend && npm test

# 前端測試
cd frontend && npm test
```

## 專案結構

```
├── backend/                 # 後端API服務
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── services/       # 業務邏輯服務
│   │   ├── models/         # 資料模型
│   │   ├── middleware/     # 中介軟體
│   │   └── types/          # TypeScript類型定義
│   └── database/           # 資料庫設定
├── frontend/               # 前端React應用
│   ├── src/
│   │   ├── components/     # React組件
│   │   ├── pages/          # 頁面組件
│   │   ├── contexts/       # React Context
│   │   ├── services/       # API服務
│   │   └── types/          # TypeScript類型定義
└── shared/                 # 共用代碼
```

## 開發指南

### API文檔
- 健康檢查: GET /health
- 認證相關: /api/auth/*
- AI服務: /api/ai/*
- 對話系統: /api/dialogue/*
- 學習路徑: /api/learning/*

### 測試帳號
- 學生帳號: 任意email (不包含teacher)
- 教師帳號: 包含teacher的email (如: teacher@example.com)

## 部署

### Docker部署
```bash
docker-compose up -d
```

### 手動部署
請參考各服務的Dockerfile進行個別部署。

## 貢獻指南

1. Fork此專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟Pull Request

## 授權

此專案採用MIT授權 - 詳見 [LICENSE](LICENSE) 檔案