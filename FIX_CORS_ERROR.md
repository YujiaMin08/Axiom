# 🚨 修复 CORS 错误 - 立即解决

## 你看到的错误

```
Access to fetch at 'https://axiom-production-d972.up.railway.app/canvases' 
from origin 'https://axiom-kydhlkhph-yohjis-projects-cd869e14.vercel.app' 
has been blocked by CORS policy
```

## 🔧 立即修复（2 步）

### 步骤 1: 修复 Vercel 环境变量（最重要！）

**问题：** 你的 `VITE_API_BASE` 可能设置成了：
```
❌ https://axiom-production-d972.up.railway.app
```

**应该设置成：**
```
✅ https://axiom-production-d972.up.railway.app/api
```

**操作：**
1. 打开 **Vercel** 项目
2. **Settings** → **Environment Variables**
3. 找到 `VITE_API_BASE`
4. 编辑，确保值以 `/api` 结尾：
   ```
   https://axiom-production-d972.up.railway.app/api
   ```
5. **保存**
6. **Deployments** → 最新部署 → **⋯** → **Redeploy**

---

### 步骤 2: 修复 Railway CORS 配置

**问题：** Railway 的 `FRONTEND_URL` 可能没有设置或设置错误

**操作：**
1. 打开 **Railway** 项目
2. **Variables** 标签
3. 添加或编辑 `FRONTEND_URL`：
   ```
   https://axiom-kydhlkhph-yohjis-projects-cd869e14.vercel.app
   ```
   ⚠️ **重要**：
   - 必须包含 `https://`
   - 必须与 Vercel 给你的 URL **完全一致**
   - 如果是预览 URL（包含随机字符串），也要完全匹配

4. **保存**（Railway 会自动重新部署）

---

## ✅ 验证修复

### 1. 等待部署完成
- Railway: 1-2 分钟
- Vercel: 1-2 分钟

### 2. 硬刷新浏览器
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

### 3. 测试
- 输入 "apple" 并提交
- 应该能成功创建 Canvas

---

## 🔍 如何确认配置正确

### 检查 Vercel 环境变量

在浏览器控制台运行：
```javascript
console.log(import.meta.env.VITE_API_BASE)
```

**应该显示：**
```
https://axiom-production-d972.up.railway.app/api
```

**不应该显示：**
```
https://axiom-production-d972.up.railway.app  ❌（缺少 /api）
http://localhost:3001/api  ❌（本地地址）
undefined  ❌（未设置）
```

### 检查 Railway 环境变量

在 Railway → Variables，确认有：
```
FRONTEND_URL=https://axiom-kydhlkhph-yohjis-projects-cd869e14.vercel.app
```

---

## 🎯 你的具体配置

根据错误信息，你需要设置：

**Vercel:**
```
VITE_API_BASE=https://axiom-production-d972.up.railway.app/api
```

**Railway:**
```
FRONTEND_URL=https://axiom-kydhlkhph-yohjis-projects-cd869e14.vercel.app
```

---

## ⚠️ 注意 Vercel 预览 URL

Vercel 的预览 URL 每次部署可能会变化（包含随机字符串）。

**解决方案 A：使用生产域名**
1. 在 Vercel 添加自定义域名
2. 使用固定域名配置 `FRONTEND_URL`

**解决方案 B：使用通配符（已实现）**
代码已更新，支持所有 `*.vercel.app` 域名。

---

## 🚀 快速操作清单

- [ ] Vercel: `VITE_API_BASE` = `https://后端URL.railway.app/api` ✅
- [ ] Railway: `FRONTEND_URL` = `https://前端URL.vercel.app` ✅
- [ ] 等待重新部署完成
- [ ] 硬刷新浏览器
- [ ] 测试创建 Canvas

**完成这 5 步，问题应该就解决了！** 🎉

