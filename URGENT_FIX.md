# 🚨 紧急修复 - CORS 错误

## 问题分析

从错误信息看，有两个问题：

1. **API 路径错误**：请求的是 `/canvases` 而不是 `/api/canvases`
   - 说明 `VITE_API_BASE` 环境变量可能没有正确设置

2. **CORS 错误**：后端没有允许前端来源
   - 说明 Railway 的 `FRONTEND_URL` 可能没有设置

---

## ⚡ 立即修复（3 分钟）

### 步骤 1: 修复 Vercel 环境变量（最重要！）

1. **打开 Vercel 项目**
2. **Settings** → **Environment Variables**
3. **检查是否有 `VITE_API_BASE`**：
   - 如果没有 → **Add New** → 添加：
     ```
     Key: VITE_API_BASE
     Value: https://axiom-production-d972.up.railway.app/api
     ```
   - 如果有但值不对 → **Edit** → 修改为：
     ```
     https://axiom-production-d972.up.railway.app/api
     ```
   ⚠️ **必须包含 `/api` 后缀！**

4. **保存**
5. **Deployments** → 找到最新部署 → 点击 **⋯** → **Redeploy**

---

### 步骤 2: 修复 Railway CORS 配置

1. **打开 Railway 项目**
2. **Variables** 标签
3. **检查是否有 `FRONTEND_URL`**：
   - 如果没有 → **New Variable** → 添加：
     ```
     Key: FRONTEND_URL
     Value: https://axiom-kydhlkhph-yohjis-projects-cd869e14.vercel.app
     ```
   - 如果有但值不对 → **Edit** → 修改为你的 Vercel URL
   
   ⚠️ **必须与 Vercel URL 完全一致（包括 `https://`）**

4. **保存**（Railway 会自动重新部署）

---

### 步骤 3: 等待并测试

1. **等待部署完成**（1-2 分钟）
   - Railway: 查看 Deployments 标签，等待绿色 ✅
   - Vercel: 查看 Deployments 标签，等待 Ready

2. **硬刷新浏览器**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

3. **打开浏览器控制台**（F12）
   - 查看 Console 标签
   - 应该看到：`🔗 API_BASE: https://axiom-production-d972.up.railway.app/api`
   - 如果看到 `localhost` 或 `undefined`，说明环境变量还没生效

4. **测试**
   - 输入 "apple" 并提交
   - 应该能成功创建 Canvas

---

## 🔍 如何验证配置

### 在浏览器控制台运行：

```javascript
// 检查 API_BASE
console.log('API_BASE:', import.meta.env.VITE_API_BASE);

// 应该显示：
// https://axiom-production-d972.up.railway.app/api
```

**如果显示：**
- ❌ `undefined` → Vercel 环境变量未设置
- ❌ `http://localhost:3001/api` → 使用了默认值，环境变量未生效
- ❌ `https://axiom-production-d972.up.railway.app` → 缺少 `/api` 后缀
- ✅ `https://axiom-production-d972.up.railway.app/api` → 正确！

---

## 🎯 你的具体配置值

根据错误信息，你需要设置：

### Vercel:
```
VITE_API_BASE=https://axiom-production-d972.up.railway.app/api
```

### Railway:
```
FRONTEND_URL=https://axiom-kydhlkhph-yohjis-projects-cd869e14.vercel.app
```

---

## ⚠️ 常见错误

### 错误 1: 环境变量设置了但没生效

**原因：** Vercel 需要重新部署才能读取新的环境变量

**解决：**
1. 确认环境变量已保存
2. 去 Deployments → 手动触发 Redeploy
3. 等待部署完成
4. 硬刷新浏览器

---

### 错误 2: API_BASE 还是 localhost

**原因：** 浏览器缓存了旧版本

**解决：**
1. 清除浏览器缓存
2. 或者使用无痕模式
3. 或者硬刷新：`Cmd + Shift + R`

---

### 错误 3: CORS 还是报错

**原因：** Railway 的 `FRONTEND_URL` 与 Vercel URL 不匹配

**解决：**
1. 检查 Vercel 给你的完整 URL（包括 `https://`）
2. 确保 Railway 的 `FRONTEND_URL` 与之一模一样
3. 注意：Vercel 预览 URL 每次可能不同，需要更新 `FRONTEND_URL`

**更好的方案：** 代码已更新，现在支持所有 `*.vercel.app` 域名，不需要精确匹配。

---

## 🚀 快速检查清单

- [ ] Vercel: `VITE_API_BASE` = `https://后端URL.railway.app/api` ✅
- [ ] Vercel: 已触发 Redeploy ✅
- [ ] Railway: `FRONTEND_URL` = `https://前端URL.vercel.app` ✅
- [ ] Railway: 部署状态是 Success ✅
- [ ] 浏览器: 硬刷新（Cmd+Shift+R）✅
- [ ] 浏览器控制台: 显示正确的 API_BASE ✅

---

## 🆘 还是不行？

### 检查 Railway 日志

1. Railway → Deployments → 最新部署 → **Logs**
2. 查看是否有：
   - `🌐 CORS 配置:` - 应该显示你的配置
   - `✅ CORS 允许来源:` - 应该显示你的前端 URL
   - `⚠️ CORS 阻止来源:` - 如果有，说明配置不对

### 检查 Vercel 构建日志

1. Vercel → Deployments → 最新部署 → **Build Logs**
2. 查看是否有构建错误

### 直接测试后端

在浏览器访问：
```
https://axiom-production-d972.up.railway.app/api/health
```

应该返回：
```json
{"status":"ok","message":"Axiom API Server is running"}
```

如果返回错误，说明后端有问题。

---

**按照这 3 步操作，问题应该就能解决！** 🎉

