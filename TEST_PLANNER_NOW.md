# 🚀 Gemini Planner 快速测试指南

## 立即开始测试

### 第一步：设置 API Key

在终端执行：

```bash
export GEMINI_API_KEY="AIzaSyCYNz3SqxnR9AoAG6CC8MW1KOW2r8ou2c4"
```

### 第二步：运行测试

```bash
cd /Users/minyujia/Documents/Projects/Axiom-new
npx tsx test-gemini-planner.ts
```

### 第三步：查看结果

测试完成后会：
1. 在终端显示彩色的详细结果
2. 生成 `gemini-planner-result.json` 文件

---

## 🎯 修改测试主题

编辑 `test-gemini-planner.ts` 第 77-78 行：

```typescript
const testTopic = 'apple';           // 改成你想测试的主题
const testDomain = 'LANGUAGE';       // LANGUAGE | SCIENCE | LIBERAL_ARTS
```

---

## 📊 建议测试的主题

### Language（语言）
- `apple` - 简单词汇
- `serendipity` - 复杂词汇
- `photosynthesis` - 科学术语

### Science（科学）
- `Newton's First Law` - 物理定律
- `photosynthesis` - 生物过程
- `chemical reactions` - 化学概念

### Liberal Arts（通识）
- `Renaissance` - 历史时期
- `climate change` - 跨学科议题
- `why do we cry when cutting onions` - 生活现象

---

## ✨ 模型选择：Gemini 2.0 Flash

**为什么选择 Flash：**
- ⚡ 速度快（< 1秒）
- 💰 成本低
- 🎯 对于结构化任务足够聪明
- 🆕 最新技术

**后续内容生成可以用 Pro**（需要更深入的内容时）

---

## 🔍 观察重点

测试时请关注：

### 1. 模块数量
- 简单主题应该 3-4 个
- 中等主题应该 4-5 个
- 复杂主题应该 5-6 个

### 2. 模块类型
- Language 应该有: definition, examples, story
- Science 应该有: intuition, experiment, formula
- Liberal Arts 应该有: overview, perspective_X

### 3. 学习路径
- 是否从简单到复杂？
- 是否符合学习规律？
- 设计思路是否合理？

---

## 🎉 测试完成后

1. 查看 `gemini-planner-result.json`
2. 告诉我结果如何
3. 如果满意，我们就接入到主系统
4. 如果需要调整，我们优化 prompt

---

**现在就开始测试吧！** 🚀

```bash
export GEMINI_API_KEY="AIzaSyCYNz3SqxnR9AoAG6CC8MW1KOW2r8ou2c4"
npx tsx test-gemini-planner.ts
```

