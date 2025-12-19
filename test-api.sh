#!/bin/bash

# Axiom Canvas API 测试脚本

API_BASE="http://localhost:3001/api"

echo "🧪 Axiom Canvas API 测试"
echo "========================"
echo ""

# 1. 健康检查
echo "1️⃣  健康检查..."
curl -s "${API_BASE}/health" | python3 -m json.tool
echo ""
echo ""

# 2. 创建 Canvas
echo "2️⃣  创建新 Canvas (主题: apple, 领域: LANGUAGE)..."
CANVAS_RESPONSE=$(curl -s -X POST "${API_BASE}/canvases" \
  -H "Content-Type: application/json" \
  -d '{"topic": "apple", "domain": "LANGUAGE"}')

echo "$CANVAS_RESPONSE" | python3 -m json.tool
CANVAS_ID=$(echo "$CANVAS_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['canvas']['id'])")
echo ""
echo "✅ Canvas 创建成功，ID: $CANVAS_ID"
echo ""
echo ""

# 3. 获取 Canvas 详情
echo "3️⃣  获取 Canvas 详情..."
curl -s "${API_BASE}/canvases/${CANVAS_ID}" | python3 -m json.tool
echo ""
echo ""

# 4. 获取第一个模块ID并编辑
echo "4️⃣  编辑第一个模块..."
MODULE_ID=$(echo "$CANVAS_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['modules'][0]['module']['id'])")
echo "模块ID: $MODULE_ID"

curl -s -X POST "${API_BASE}/modules/${MODULE_ID}/edit" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "make it more concise"}' | python3 -m json.tool
echo ""
echo "✅ 模块编辑成功"
echo ""
echo ""

# 5. 扩展 Canvas
echo "5️⃣  扩展 Canvas（添加新模块）..."
curl -s -X POST "${API_BASE}/canvases/${CANVAS_ID}/expand" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "add a quiz module"}' | python3 -m json.tool
echo ""
echo "✅ Canvas 扩展成功"
echo ""
echo ""

# 6. 获取所有 Canvas
echo "6️⃣  获取所有 Canvas..."
curl -s "${API_BASE}/canvases" | python3 -m json.tool
echo ""
echo ""

echo "🎉 API 测试完成！"
echo ""
echo "💡 提示："
echo "   - 前端访问: http://localhost:5173"
echo "   - 后端 API: http://localhost:3001/api"
echo "   - 数据库文件: data/axiom.db"

