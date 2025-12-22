# Axiom 快速部署指南（5分钟上线）

## 🚀 最快部署方案

### 第一步：部署后端（2分钟）

1. 访问 **[Railway.app](https://railway.app)** 并用 GitHub 登录

2. 点击 **"New Project"** → **"Deploy from GitHub repo"**

3. 选择 **Axiom** 仓库

4. 配置项目：
   - **Root Directory**: 输入 `server`
   - **Start Command**: `npm start`

5. 添加环境变量（点击 Variables 标签）：
   ```
   GEMINI_API_KEY=你的密钥
   JUXIN_API_KEY=你的密钥
   PORT=3001
   ```

6. 等待部署完成，**复制生成的 URL**（类似 `https://xxx.railway.app`）

---

### 第二步：部署前端（2分钟）

1. 访问 **[Vercel.com](https://vercel.com)** 并用 GitHub 登录

2. 点击 **"Add New..."** → **"Project"**

3. 选择 **Axiom** 仓库

4. 配置设置：
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. 添加环境变量：
   ```
   VITE_API_BASE=https://你的后端URL.railway.app/api
   ```
   ⚠️ 记得把 Railway 的 URL 粘贴到这里！

6. 点击 **Deploy**，等待 1-2 分钟

---

### 第三步：配置 CORS（1分钟）

1. 回到 **Railway** 项目

2. 在 **Variables** 中添加：
   ```
   FRONTEND_URL=https://你的前端URL.vercel.app
   ```
   ⚠️ 使用 Vercel 给你的 URL！

3. Railway 会自动重新部署

---

## ✅ 完成！

打开 Vercel 给你的 URL，应该能看到 Axiom 运行了！

**测试：**
1. 输入 "apple" → 创建新 Canvas
2. 等待模块生成
3. 尝试编辑、删除模块
4. 打开 Library 查看历史

---

## 🎉 分享你的作品

你的 Axiom 现在已经上线，可以分享给任何人：

```
🌐 我的 Axiom 学习平台已上线！
体验地址: https://your-app.vercel.app

基于 AI 的个性化学习平台，支持：
✨ 智能内容生成
🎨 12+ 种互动模块
📚 学习记忆库
🌐 双语支持

#教育科技 #AI #在线学习
```

---

## 🚨 遇到问题？

### 常见问题快速修复

**问题：前端无法连接后端**
- 检查 Vercel 的 `VITE_API_BASE` 环境变量
- 确保 Railway 后端正在运行

**问题：CORS 错误**
- 检查 Railway 的 `FRONTEND_URL` 变量
- 确保与 Vercel URL 完全匹配（包括 https://）

**问题：API 密钥无效**
- 在 Railway Variables 中重新输入密钥
- 确保密钥没有多余空格

**问题：数据库错误**
- Railway 会自动创建数据目录
- 查看 Railway 日志找到具体错误

---

## 💡 提示

### 免费额度

- **Vercel**: 完全免费，无限制
- **Railway**: $5/月免费额度
- **Gemini API**: 有免费配额

### 监控使用

1. Railway Dashboard → 查看资源使用
2. Google Cloud Console → 查看 API 调用
3. 设置预算警报避免超支

### 更新应用

只需推送到 GitHub：
```bash
git add .
git commit -m "feat: 新功能"
git push origin main
```

Vercel 和 Railway 会自动部署！

---

**部署愉快！🎓**

