# 🚨 快速修复 "FAILED TO FETCH" 错误

## 3 步快速修复

### 步骤 1: 检查后端是否运行（30秒）

1. 打开 **Railway** 项目
2. 查看 **Deployments** 标签
3. 如果显示 ❌ **Failed**：
   - 点击部署 → 查看 **Logs**
   - 如果看到 `GEMINI_API_KEY required`：
     - 去 **Variables** 标签
     - 添加：`GEMINI_API_KEY=你的密钥`
     - 添加：`JUXIN_API_KEY=你的密钥`
     - 等待自动重新部署

### 步骤 2: 配置前端环境变量（1分钟）

1. 打开 **Vercel** 项目
2. 点击 **Settings** → **Environment Variables**
3. 添加新变量：
   ```
   名称: VITE_API_BASE
   值: https://你的Railway后端URL.railway.app/api
   ```
   ⚠️ **重要**：
   - 使用 Railway 给你的完整 URL
   - 必须以 `/api` 结尾
   - 例如：`https://axiom-backend.up.railway.app/api`

4. 点击 **Save**
5. 去 **Deployments** → 点击最新部署的 **⋯** → **Redeploy**

### 步骤 3: 配置后端 CORS（1分钟）

1. 打开 **Railway** 项目
2. 点击 **Variables** 标签
3. 添加新变量：
   ```
   名称: FRONTEND_URL
   值: https://你的Vercel前端URL.vercel.app
   ```
   ⚠️ **重要**：
   - 使用 Vercel 给你的完整 URL
   - 必须包含 `https://`
   - 例如：`https://axiom-learning.vercel.app`

4. Railway 会自动重新部署（等待 1-2 分钟）

### 步骤 4: 测试（30秒）

1. **硬刷新浏览器**：`Cmd + Shift + R` (Mac) 或 `Ctrl + Shift + R` (Windows)
2. 尝试输入 "apple" 并提交
3. 如果还是失败，打开浏览器控制台（F12）查看具体错误

---

## 🔍 如何找到你的 URL

### Railway 后端 URL
1. Railway 项目 → **Settings** → **Networking**
2. 找到 **Public Domain**
3. 复制完整 URL（例如：`https://axiom-backend.up.railway.app`）

### Vercel 前端 URL
1. Vercel 项目 → **Deployments**
2. 找到最新的部署
3. 点击 **Visit** 旁边的 URL
4. 复制完整 URL（例如：`https://axiom-learning.vercel.app`）

---

## ✅ 验证配置

### 检查 Vercel 环境变量
```bash
# 在浏览器控制台运行
console.log(import.meta.env.VITE_API_BASE)
# 应该显示你的后端 URL，而不是 localhost
```

### 检查后端是否可访问
在浏览器直接访问：
```
https://你的后端URL.railway.app/api/canvases
```
应该返回：`[]`（空数组）

---

## 🆘 还是不行？

### 检查清单

- [ ] Railway 部署状态是 ✅ Success
- [ ] Vercel 部署状态是 ✅ Ready
- [ ] Railway 有 `GEMINI_API_KEY` 和 `JUXIN_API_KEY`
- [ ] Railway 有 `FRONTEND_URL`（与 Vercel URL 完全匹配）
- [ ] Vercel 有 `VITE_API_BASE`（格式：`https://后端URL/api`）
- [ ] 浏览器已硬刷新（Cmd+Shift+R）
- [ ] 后端 URL 可以直接访问（返回 `[]`）

### 如果全部 ✅ 但还是失败

1. **查看浏览器控制台**（F12 → Console）
   - 复制所有错误信息

2. **查看 Network 标签**（F12 → Network）
   - 找到失败的请求
   - 查看 Request URL 是否正确
   - 查看 Response 内容

3. **提交问题**：
   - 包含错误信息
   - 包含环境变量配置（隐藏密钥）
   - 包含部署平台信息

---

**按照这 3 步，99% 的问题都能解决！** 🚀


