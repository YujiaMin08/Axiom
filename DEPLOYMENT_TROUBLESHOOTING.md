# 🚨 部署问题排查指南

## 错误：FAILED TO FETCH

这个错误通常表示前端无法连接到后端。按以下步骤排查：

---

## 🔍 问题诊断

### 步骤 1: 检查后端是否运行

**在 Railway 中：**
1. 打开你的 Railway 项目
2. 点击 "Deployments" 标签
3. 查看最新的部署状态：
   - ✅ **Success** = 后端正常运行
   - ❌ **Failed** = 后端启动失败

**如果部署失败：**
- 点击部署 → 查看 "Logs"
- 常见错误：
  - `GEMINI_API_KEY environment variable is required` → 缺少 API 密钥
  - `Port already in use` → 端口冲突
  - `Cannot find module` → 依赖问题

---

### 步骤 2: 检查环境变量

#### Railway（后端）必须有的环境变量：

```
✅ GEMINI_API_KEY=你的密钥
✅ JUXIN_API_KEY=你的密钥
✅ PORT=3001
✅ FRONTEND_URL=https://你的前端URL.vercel.app
```

**检查方法：**
1. Railway 项目 → "Variables" 标签
2. 确认所有变量都已设置
3. ⚠️ **特别注意**：`FRONTEND_URL` 必须与 Vercel 给你的 URL **完全一致**（包括 `https://`）

#### Vercel（前端）必须有的环境变量：

```
✅ VITE_API_BASE=https://你的后端URL.railway.app/api
```

**检查方法：**
1. Vercel 项目 → "Settings" → "Environment Variables"
2. 确认 `VITE_API_BASE` 已设置
3. ⚠️ **特别注意**：URL 必须以 `/api` 结尾

---

### 步骤 3: 测试后端 API

**在浏览器中直接访问：**

```
https://你的后端URL.railway.app/api/canvases
```

**预期结果：**
- ✅ 返回 `[]`（空数组）→ 后端正常
- ❌ 返回错误或无法访问 → 后端有问题

**常见错误：**
- `404 Not Found` → 路由配置问题
- `500 Internal Server Error` → 后端代码错误
- `CORS error` → CORS 配置问题
- `Connection refused` → 后端未启动

---

### 步骤 4: 检查浏览器控制台

**打开浏览器开发者工具（F12）：**

1. **Console 标签** - 查看 JavaScript 错误
2. **Network 标签** - 查看 API 请求

**查看失败的请求：**
- 点击红色请求
- 查看 "Headers" → "Request URL"
- 确认 URL 是否正确

**常见问题：**
- URL 是 `http://localhost:3001` → 环境变量未设置
- URL 是 `undefined` → 环境变量格式错误
- CORS 错误 → 后端 FRONTEND_URL 不匹配

---

## 🔧 快速修复方案

### 修复 1: 后端环境变量缺失

**症状：** Railway 部署失败，日志显示 "GEMINI_API_KEY required"

**解决：**
1. Railway → Variables
2. 添加：
   ```
   GEMINI_API_KEY=你的新密钥
   JUXIN_API_KEY=你的新密钥
   ```
3. Railway 会自动重新部署

---

### 修复 2: CORS 错误

**症状：** 浏览器控制台显示 CORS 错误

**解决：**
1. **获取你的前端 URL**（Vercel 给的）
   ```
   例如：https://axiom-learning.vercel.app
   ```

2. **在 Railway 添加环境变量：**
   ```
   FRONTEND_URL=https://axiom-learning.vercel.app
   ```
   ⚠️ 必须完全匹配，包括 `https://`

3. **等待 Railway 重新部署**（1-2 分钟）

4. **刷新前端页面**

---

### 修复 3: 前端无法找到后端

**症状：** Network 标签显示请求到 `localhost:3001`

**解决：**
1. **获取你的后端 URL**（Railway 给的）
   ```
   例如：https://axiom-backend.up.railway.app
   ```

2. **在 Vercel 添加环境变量：**
   ```
   VITE_API_BASE=https://axiom-backend.up.railway.app/api
   ```
   ⚠️ 必须以 `/api` 结尾

3. **重新部署 Vercel：**
   - 方法 A：推送代码触发自动部署
   - 方法 B：Vercel Dashboard → Deployments → Redeploy

4. **等待部署完成**（1-2 分钟）

5. **硬刷新浏览器**（Cmd+Shift+R）

---

### 修复 4: 后端启动失败（API 密钥错误）

**症状：** Railway 日志显示 API 调用失败

**解决：**
1. **验证 API 密钥是否有效：**
   ```bash
   # 测试 Gemini API
   curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=你的密钥 \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}'
   ```

2. **如果密钥无效：**
   - 在 Google Cloud Console 生成新密钥
   - 更新 Railway 环境变量
   - 重新部署

---

## 📋 完整检查清单

### Railway（后端）

- [ ] 部署状态：Success（绿色）
- [ ] 环境变量 `GEMINI_API_KEY` 已设置
- [ ] 环境变量 `JUXIN_API_KEY` 已设置
- [ ] 环境变量 `FRONTEND_URL` 已设置且正确
- [ ] 可以直接访问 `https://你的后端URL/api/canvases` 返回 `[]`

### Vercel（前端）

- [ ] 部署状态：Ready（绿色）
- [ ] 环境变量 `VITE_API_BASE` 已设置
- [ ] `VITE_API_BASE` 格式：`https://你的后端URL/api`
- [ ] 浏览器控制台无 CORS 错误
- [ ] Network 标签显示请求到正确的后端 URL

### 浏览器

- [ ] 硬刷新页面（Cmd+Shift+R）
- [ ] 清除缓存（可选）
- [ ] 检查控制台错误
- [ ] 检查 Network 请求

---

## 🧪 测试步骤

### 1. 测试后端

```bash
# 在终端运行
curl https://你的后端URL.railway.app/api/canvases

# 应该返回：[]
```

### 2. 测试前端连接

1. 打开浏览器开发者工具（F12）
2. 打开 Network 标签
3. 在页面输入 "apple" 并提交
4. 查看请求：
   - **请求 URL** 应该是你的后端 URL
   - **状态码** 应该是 200 或 201
   - **响应** 应该包含 Canvas 数据

### 3. 测试完整流程

1. ✅ 输入主题 → 创建 Canvas
2. ✅ 等待模块生成
3. ✅ 编辑模块
4. ✅ 删除模块
5. ✅ 打开 Library

---

## 🚨 紧急修复（如果还是不行）

### 方案 A: 重新配置环境变量

**Railway：**
1. 删除所有环境变量
2. 重新添加：
   ```
   GEMINI_API_KEY=新密钥
   JUXIN_API_KEY=新密钥
   PORT=3001
   FRONTEND_URL=https://你的前端完整URL
   ```
3. 等待重新部署

**Vercel：**
1. 删除 `VITE_API_BASE`
2. 重新添加：
   ```
   VITE_API_BASE=https://你的后端完整URL/api
   ```
3. 重新部署

### 方案 B: 检查 URL 格式

**常见错误：**
- ❌ `VITE_API_BASE=https://backend.railway.app` （缺少 /api）
- ✅ `VITE_API_BASE=https://backend.railway.app/api`

- ❌ `FRONTEND_URL=axiom.vercel.app` （缺少 https://）
- ✅ `FRONTEND_URL=https://axiom.vercel.app`

### 方案 C: 临时允许所有来源（仅用于测试）

**在 Railway 环境变量添加：**
```
CORS_ALLOW_ALL=true
```

**修改 server/index.ts：**
```typescript
if (process.env.CORS_ALLOW_ALL === 'true') {
  app.use(cors());
} else {
  app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:5173'],
    // ...
  }));
}
```

⚠️ **注意**：这只是临时方案，生产环境应该限制来源。

---

## 📞 获取帮助

如果以上方法都不行：

1. **检查 Railway 日志**
   - Deployments → 最新部署 → Logs
   - 复制错误信息

2. **检查 Vercel 构建日志**
   - Deployments → 最新部署 → Build Logs
   - 查看是否有构建错误

3. **检查浏览器控制台**
   - F12 → Console
   - 复制所有错误信息

4. **提交 GitHub Issue**
   - 包含错误日志
   - 包含环境变量配置（隐藏密钥）
   - 包含部署平台信息

---

## ✅ 成功标志

当一切正常时，你应该看到：

1. ✅ Railway 部署：绿色 Success
2. ✅ Vercel 部署：绿色 Ready
3. ✅ 浏览器：可以创建 Canvas
4. ✅ 控制台：无错误
5. ✅ Network：API 请求成功（200/201）

---

**按照这个指南逐步排查，应该能解决问题！** 🚀


