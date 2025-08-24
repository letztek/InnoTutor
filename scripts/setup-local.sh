#!/bin/bash

echo "🚀 設置問AI 2.0本地開發環境 (不使用Docker)..."

# 創建必要的目錄
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p frontend/build

# 複製環境變數範本
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ 已創建backend/.env文件，請填入您的API Keys"
else
    echo "ℹ️  backend/.env已存在"
fi

# 檢查Node.js是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安裝，請先安裝Node.js 18+"
    exit 1
fi

# 檢查npm是否安裝
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安裝，請先安裝npm"
    exit 1
fi

echo "✅ Node.js環境檢查通過"
echo "Node.js版本: $(node --version)"
echo "npm版本: $(npm --version)"

echo ""
echo "🎉 本地開發環境設置完成！"
echo ""
echo "⚠️  注意：您需要自行安裝和配置以下服務："
echo "1. PostgreSQL 數據庫 (端口: 5432)"
echo "2. Redis 緩存服務 (端口: 6379)"
echo ""
echo "或者您可以："
echo "1. 啟動Docker Desktop"
echo "2. 執行 ./scripts/setup.sh 使用Docker版本"
echo ""
echo "下一步："
echo "1. 編輯 backend/.env 文件，填入您的API Keys和數據庫連接"
echo "2. 安裝後端依賴: cd backend && npm install"
echo "3. 安裝前端依賴: cd frontend && npm install"
echo "4. 啟動後端: cd backend && npm run dev"
echo "5. 啟動前端: cd frontend && npm start"
echo ""
echo "訪問應用: http://localhost:3000"
echo "API端點: http://localhost:3001"