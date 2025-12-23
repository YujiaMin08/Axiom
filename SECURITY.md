# 🔐 Axiom 安全指南

## ⚠️ 重要安全提醒

### API 密钥管理

**所有 API 密钥必须通过环境变量配置，绝不能硬编码在代码中！**

---

## 🔑 必需的 API 密钥

### 1. Google Gemini API Key

**获取方式：**
1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 创建新的 API 密钥
3. 复制密钥

**配置：**
```bash
# server/.env
GEMINI_API_KEY=your_actual_api_key_here
```

**安全建议：**
- ✅ 在 Google Cloud Console 设置使用配额限制
- ✅ 设置预算警报
- ✅ 定期轮换密钥
- ✅ 不要分享密钥给他人

---

### 2. Juxin API Key

**获取方式：**
联系 Juxin 服务提供商获取 API 密钥

**配置：**
```bash
# server/.env
JUXIN_API_KEY=your_actual_juxin_key_here
```

---

## 🛡️ 安全最佳实践

### 代码安全

1. **永远不要提交 `.env` 文件**
   - ✅ `.env` 已在 `.gitignore` 中
   - ✅ 使用 `.env.example` 作为模板

2. **检查 Git 历史**
   ```bash
   # 如果之前提交过密钥，需要从历史中移除
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch server/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **使用环境变量**
   ```typescript
   // ✅ 正确
   const API_KEY = process.env.API_KEY;
   if (!API_KEY) throw new Error('API_KEY required');
   
   // ❌ 错误
   const API_KEY = 'hardcoded-key-here';
   ```

### 部署安全

1. **生产环境**
   - 使用平台的环境变量功能（Railway, Vercel）
   - 不要将密钥写在代码中
   - 定期轮换密钥

2. **访问控制**
   - 设置 API 使用配额
   - 监控异常使用
   - 设置 IP 白名单（如果可能）

3. **密钥轮换**
   - 每 3-6 个月更换一次密钥
   - 更换后立即更新所有环境变量
   - 删除旧密钥

---

## 🚨 如果密钥已泄露

### 立即行动

1. **撤销旧密钥**
   - Google Cloud Console → API & Services → Credentials
   - 删除或禁用已泄露的密钥

2. **生成新密钥**
   - 创建新的 API 密钥
   - 更新所有环境变量

3. **检查使用情况**
   - 查看 API 调用日志
   - 检查是否有异常使用
   - 设置新的配额限制

4. **清理 Git 历史**（如果密钥已提交）
   ```bash
   # 使用 git filter-branch 或 BFG Repo-Cleaner
   # 从所有历史提交中移除密钥
   ```

---

## 📋 安全检查清单

部署前检查：

- [ ] 所有 `.env` 文件在 `.gitignore` 中
- [ ] 代码中无硬编码密钥
- [ ] `.env.example` 文件存在且不包含真实密钥
- [ ] 生产环境使用环境变量
- [ ] API 配额已设置
- [ ] 预算警报已配置
- [ ] 密钥访问权限已限制

---

## 🔍 如何检查代码中是否有密钥

```bash
# 搜索可能的 API 密钥模式
grep -r "AIzaSy" . --exclude-dir=node_modules
grep -r "sk-" . --exclude-dir=node_modules

# 搜索环境变量硬编码
grep -r "process.env.*||" . --exclude-dir=node_modules
```

---

## 📞 获取帮助

如果发现安全问题：
1. 立即撤销泄露的密钥
2. 生成新密钥
3. 更新所有环境变量
4. 检查是否有异常使用

---

**记住：安全第一！永远不要将 API 密钥提交到 Git！**


