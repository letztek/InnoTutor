#!/bin/bash

echo "🚀 設置問AI 2.0開發環境..."

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

# 檢查Docker是否可用
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安裝，請先安裝Docker Desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安裝，請先安裝Docker Compose"
    exit 1
fi

# 檢查Docker daemon是否運行
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon未運行"
    echo "請啟動 Docker Desktop，然後重新執行此腳本"
    echo ""
    echo "MacOS: 打開應用程式 > Docker Desktop"
    echo "等待 Docker Desktop 完全啟動後再試一次"
    exit 1
fi

echo "✅ Docker環境檢查通過"

# 啟動Docker服務
echo "🐳 啟動Docker服務..."
docker-compose up -d postgres redis

echo "⏳ 等待服務啟動..."
sleep 10

# 檢查服務狀態
if docker-compose ps | grep -q "postgres.*Up"; then
    echo "✅ PostgreSQL已啟動"
else
    echo "❌ PostgreSQL啟動失敗"
fi

if docker-compose ps | grep -q "redis.*Up"; then
    echo "✅ Redis已啟動"
else
    echo "❌ Redis啟動失敗"
fi

echo ""
echo "🎉 開發環境設置完成！"
echo ""
echo "下一步："
echo "1. 編輯 backend/.env 文件，填入您的API Keys"
echo "2. 安裝依賴: cd backend && npm install"
echo "3. 安裝前端依賴: cd frontend && npm install"
echo "4. 啟動後端: cd backend && npm run dev"
echo "5. 啟動前端: cd frontend && npm start"
echo ""
echo "訪問應用: http://localhost:3000"
echo "API端點: http://localhost:3001"