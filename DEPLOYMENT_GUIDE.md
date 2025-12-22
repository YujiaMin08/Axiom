# Axiom 部署指南

完整的生产环境部署教程，让你的 Axiom 上线供所有人体验。

---

## 🎯 目标

部署后，任何人都可以访问：
- **你的域名** (如 `axiom.yourdomain.com`)
- 或 **免费子域名** (如 `axiom-learning.vercel.app`)

---

## 🚀 推荐方案：Vercel + Railway

### 为什么选择这个组合？

| 服务 | 用途 | 优势 |
|------|------|------|
| **Vercel** | 托管前端 | 免费、快速、全球 CDN、自动 HTTPS |
| **Railway** | 托管后端 | 免费额度、支持 SQLite、环境变量管理 |

**成本：** 
- 免费额度：每月 $5（Railway）+ 无限（Vercel）
- 足够支持数百个用户测试

---

## 📝 部署步骤

### 第一步：部署后端到 Railway

#### 1.1 注册 Railway

访问 [railway.app](https://railway.app) 并用 GitHub 登录。

#### 1.2 创建新项目

1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择你的 `Axiom` 仓库
4. Railway 会自动检测到 Node.js 项目

#### 1.3 配置根目录

1. 在项目设置中，点击 "Settings"
2. 找到 "Root Directory"
3. 设置为：`server`
4. 保存

#### 1.4 添加环境变量

在 "Variables" 标签页添加：

```
GEMINI_API_KEY=你的_Gemini_API_密钥
JUXIN_API_KEY=你的_Juxin_API_密钥
PORT=3001
NODE_ENV=production
```

#### 1.5 部署

1. Railway 会自动开始部署
2. 等待 2-3 分钟
3. 部署成功后，会生成一个 URL，如：
   ```
   https://axiom-backend-production.up.railway.app
   ```
4. **复制这个 URL**，后面会用到

#### 1.6 测试后端

访问你的后端 URL：
```
https://your-backend-url.railway.app/api/canvases
```

应该返回：`[]` (空数组)

---

### 第二步：部署前端到 Vercel

#### 2.1 注册 Vercel

访问 [vercel.com](https://vercel.com) 并用 GitHub 登录。

#### 2.2 导入项目

1. 点击 "Add New..." → "Project"
2. 选择你的 `Axiom` 仓库
3. Vercel 会自动检测到 Vite 项目

#### 2.3 配置构建设置

**Framework Preset:** Vite  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

#### 2.4 添加环境变量

在 "Environment Variables" 添加：

```
VITE_API_BASE=https://your-backend-url.railway.app/api
```

⚠️ **重要**：将上面的 URL 替换为你第一步中 Railway 生成的后端 URL！

#### 2.5 部署

1. 点击 "Deploy"
2. 等待 1-2 分钟
3. 部署成功！Vercel 会给你一个 URL，如：
   ```
   https://axiom-learning.vercel.app
   ```

#### 2.6 访问你的应用

打开 Vercel 提供的 URL，你应该能看到 Axiom 主页！

---

### 第三步：配置 CORS（重要！）

#### 3.1 更新后端 CORS 设置

在 Railway 项目的环境变量中添加：

```
FRONTEND_URL=https://your-frontend-url.vercel.app
```

#### 3.2 修改 server/index.ts

确保 CORS 配置正确：

```typescript
import cors from 'cors';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173'],
  credentials: true
}));
```

#### 3.3 提交更改并重新部署

```bash
git add server/index.ts
git commit -m "chore: 配置生产环境 CORS"
git push origin main
```

Railway 会自动重新部署。

---

## 🔐 API 密钥安全

### ⚠️ 重要提醒

你的 API 密钥现在存储在 Railway 的环境变量中，这是安全的。但请注意：

1. **限制使用**：在 Google Cloud Console 设置 API 配额
2. **监控使用量**：定期检查 API 调用次数
3. **设置预算警报**：避免意外高额费用

### 建议的 API 限制

在 Google Cloud Console → API & Services → Quotas：

```
Gemini API 请求限制：
- 每天: 1,000 次请求
- 每分钟: 60 次请求
- 每用户每分钟: 10 次请求
```

---

## 🌐 自定义域名（可选）

### Vercel 自定义域名

1. 在 Vercel 项目设置中，点击 "Domains"
2. 添加你的域名，如 `axiom.yourdomain.com`
3. 按照指示配置 DNS 记录
4. 等待生效（几分钟到几小时）

### Railway 自定义域名

1. 在 Railway 项目设置中，找到 "Networking"
2. 添加自定义域名，如 `api.yourdomain.com`
3. 配置 DNS CNAME 记录
4. 更新 Vercel 的 `VITE_API_BASE` 环境变量

---

## 💰 成本估算

### 免费额度（测试阶段）

**Vercel（前端）：**
- ✅ 完全免费
- ✅ 100GB 带宽/月
- ✅ 无限部署

**Railway（后端）：**
- ✅ $5 免费额度/月
- ✅ ~500 小时运行时间
- ✅ 8GB 内存
- ⚠️ 超出后按使用付费（~$0.000231/GB-s）

**API 费用（Gemini）：**
- Gemini 2.5 Flash: 免费（有限额）
- 或按使用付费（~$0.075/1M tokens）

**估算：**
- 50-100 个用户体验：完全免费
- 500+ 用户：可能需要 $10-20/月

---

## 🔧 生产环境优化

### 1. 添加加载状态

确保用户知道内容正在生成，改善体验。

### 2. 错误处理

添加更友好的错误提示：
```typescript
try {
  await createCanvas(...)
} catch (error) {
  if (error.message.includes('quota')) {
    alert('系统当前使用量较高，请稍后重试')
  } else {
    alert('生成失败，请重试')
  }
}
```

### 3. 速率限制（推荐）

在后端添加简单的速率限制：

```bash
cd server
npm install express-rate-limit
```

```typescript
// server/index.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 50, // 限制每个 IP 50 次请求
  message: '请求过于频繁，请稍后重试'
});

app.use('/api/', limiter);
```

### 4. 数据库备份

Railway 提供自动备份，但建议定期下载数据库：

```bash
# 从 Railway 下载数据库
railway run sqlite3 axiom.db .dump > backup.sql
```

---

## 📊 监控与分析

### Railway 监控

在 Railway 仪表板查看：
- CPU 使用率
- 内存使用
- 请求延迟
- 错误日志

### Vercel 分析

在 Vercel 仪表板查看：
- 页面访问量
- 地理分布
- 加载速度
- 构建状态

### Google Cloud Console

监控 Gemini API 使用：
- 每日请求数
- Token 消耗
- 错误率
- 配额状态

---

## 🎉 部署完成清单

完成后，你应该有：

- [ ] ✅ 后端在 Railway 运行
- [ ] ✅ 前端在 Vercel 运行
- [ ] ✅ 环境变量正确配置
- [ ] ✅ CORS 配置正确
- [ ] ✅ 可以通过公开 URL 访问
- [ ] ✅ 创建 Canvas 功能正常
- [ ] ✅ 所有模块类型正常渲染
- [ ] ✅ Library 和设置功能正常
- [ ] ✅ API 密钥安全存储
- [ ] ✅ 设置了使用限制

---

## 🚨 上线前检查

### 必做项

1. **测试完整流程**
   - 创建 Canvas
   - 编辑模块
   - 删除模块
   - 查看 Library
   - 更改设置

2. **检查移动端**
   - 响应式设计
   - 触摸交互
   - 输入框体验

3. **性能测试**
   - 页面加载速度
   - API 响应时间
   - 大型 Canvas 渲染

4. **设置监控**
   - Railway 日志
   - Vercel 分析
   - API 配额监控

### 可选项

- [ ] 添加 Google Analytics
- [ ] 设置错误追踪（Sentry）
- [ ] 添加用户反馈入口
- [ ] 创建状态页面

---

## 📣 推广建议

### 分享你的作品

1. **社交媒体**
   - 在 Twitter/X 分享链接
   - 在 LinkedIn 展示项目
   - 在小红书/微信分享

2. **开发者社区**
   - Product Hunt 发布
   - Hacker News 分享
   - Reddit r/webdev, r/reactjs
   - V2EX 分享

3. **教育社区**
   - 在教育论坛介绍
   - 向老师和学生推荐
   - 写使用教程

### 收集反馈

创建简单的反馈表单：
- Google Forms
- Typeform
- 或直接用 GitHub Issues

---

## 🔄 持续部署

### 自动部署流程

现在每次你推送代码到 GitHub：

1. **Vercel** 自动检测更改
2. 自动构建前端
3. 自动部署到生产环境

4. **Railway** 自动检测更改
5. 自动构建后端
6. 自动部署到生产环境

### 回滚机制

如果新版本有问题：

**Vercel:**
1. 进入项目 → Deployments
2. 找到上一个稳定版本
3. 点击 "Promote to Production"

**Railway:**
1. 进入项目 → Deployments
2. 选择上一个版本
3. 点击 "Redeploy"

---

## 🎓 部署后的第一件事

### 创建演示 Canvas

为访客预先创建一些示例 Canvas：

```bash
# 使用你的生产 API
curl -X POST https://your-backend.railway.app/api/canvases \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "apple",
    "domain": "LANGUAGE",
    "language": "en"
  }'

curl -X POST https://your-backend.railway.app/api/canvases \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Newton first law",
    "domain": "SCIENCE",
    "language": "en"
  }'
```

这样访客打开 Library 时就能看到示例内容！

---

## 📞 获取帮助

**部署遇到问题？**

1. 检查 Railway 日志（Deployments → Logs）
2. 检查 Vercel 构建日志
3. 查看浏览器控制台错误
4. 提交 GitHub Issue 寻求帮助

**常见问题：**

**Q: Vercel 构建失败？**  
A: 检查 `package.json` 中的依赖版本，确保兼容。

**Q: Railway 无法启动？**  
A: 确认 `server/package.json` 中有 `"start": "tsx index.ts"`。

**Q: CORS 错误？**  
A: 检查后端的 FRONTEND_URL 环境变量是否正确。

**Q: API 请求失败？**  
A: 确认前端的 `VITE_API_BASE` 指向正确的后端 URL。

---

## 🎉 部署成功！

恭喜！现在你的 Axiom 已经上线了。

**分享链接：**
- 前端: `https://your-app.vercel.app`
- 后端: `https://your-backend.railway.app`

**接下来：**
1. 分享给朋友试用
2. 收集反馈
3. 持续改进
4. 添加新功能

---

## 🚀 进阶部署选项

### 方案 2：使用自己的服务器

如果你有 VPS (如阿里云、腾讯云)：

#### 使用 Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY server/package*.json ./server/

# 安装依赖
RUN npm install --production
RUN cd server && npm install --production

# 复制代码
COPY . .

# 构建前端
RUN npm run build

# 暴露端口
EXPOSE 3001 5173

# 启动脚本
CMD ["sh", "-c", "cd server && npm start & npx serve -s dist -l 5173"]
```

```bash
# 构建镜像
docker build -t axiom .

# 运行容器
docker run -d \
  -p 80:5173 \
  -p 3001:3001 \
  -e GEMINI_API_KEY=your_key \
  -e JUXIN_API_KEY=your_key \
  --name axiom \
  axiom
```

---

### 方案 3：Netlify + Railway

类似 Vercel + Railway，Netlify 也提供免费托管。

### 方案 4：全部署在 Railway

Railway 也可以托管静态文件：

```bash
# 构建前端
npm run build

# 在 server/index.ts 中添加静态文件服务
app.use(express.static('../dist'));
```

---

## 📈 扩展建议

### 当用户增长时

**性能优化：**
1. 添加 Redis 缓存
2. 使用 CDN 加速媒体
3. 数据库从 SQLite 迁移到 PostgreSQL
4. 实现负载均衡

**功能增强：**
1. 用户认证系统
2. 使用统计和分析
3. 内容推荐算法
4. 协作功能

---

## 🎯 快速部署命令

复制这些命令快速完成部署准备：

```bash
# 1. 创建环境变量示例文件（已完成）
# .env.example 和 server/.env.example

# 2. 提交配置文件
git add .
git commit -m "chore: 添加部署配置"
git push origin main

# 3. 前往部署平台
# Vercel: https://vercel.com
# Railway: https://railway.app

# 4. 按照上述步骤操作
```

---

好运！🚀 如果遇到任何问题，随时寻求帮助！

