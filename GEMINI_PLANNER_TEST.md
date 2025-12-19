# Gemini Planner 测试指南

这是一个**独立的测试实现**，用于验证真正的 Gemini AI Planner 效果，暂时不接入主产品。

---

## 🎯 功能说明

这个 Gemini Planner 会：

1. **智能分析主题**
   - 自动判断主题所属领域（LANGUAGE / SCIENCE / LIBERAL_ARTS）
   - 评估主题复杂度（beginner / intermediate / advanced）
   - 提取核心概念

2. **动态生成模块计划**
   - 根据主题特点决定需要几个模块（3-6 个，不固定）
   - 选择最适合的模块类型
   - 设计最优的学习路径

3. **提供设计思路**
   - AI 会解释为什么这样规划
   - 帮助理解模块设计逻辑

---

## 🚀 如何测试

### 前置要求

1. **配置 Gemini API Key**

创建 `.env` 文件（如果不存在）：

```bash
# 在项目根目录创建 .env 文件
touch .env
```

在 `.env` 文件中添加：

```
GEMINI_API_KEY=你的API密钥
```

或者直接在终端设置：

```bash
export GEMINI_API_KEY="你的API密钥"
```

获取 API Key：https://ai.google.dev/

### 测试方式一：单主题测试（推荐）

测试单个主题，查看详细的规划结果：

```bash
npx tsx test-gemini-planner.ts
```

默认测试主题是 `photosynthesis`（光合作用）。

#### 修改测试主题

编辑 `test-gemini-planner.ts` 文件，将第 75 行的主题改为你想测试的：

```typescript
const testTopic = 'apple';  // 改成你想测试的主题
```

### 测试方式二：批量测试

测试多个主题，对比不同领域的规划策略：

```bash
npx tsx test-gemini-planner.ts batch
```

批量测试会测试 5 个主题：
- `apple` (语言 - 简单)
- `photosynthesis` (科学 - 中等)
- `quantum entanglement` (科学 - 复杂)
- `Renaissance` (通识 - 历史)
- `climate change` (通识 - 跨学科)

---

## 📊 输出结果

### 终端输出示例

```
📚 主题: photosynthesis

📊 主题分析:
  主题: Photosynthesis
  领域: SCIENCE
  难度: intermediate
  核心概念: light energy, chlorophyll, glucose production, carbon dioxide

📋 模块计划 (共 5 个):

  1. 直觉理解
     类型: intuition
     用简单语言解释光合作用的本质

  2. 交互式实验
     类型: experiment
     可调节光照强度和 CO2 浓度的模拟器

  3. 化学方程式
     类型: formula
     详解 6CO2 + 6H2O → C6H12O6 + 6O2

  4. 现实应用
     类型: examples
     植物生长、农业、生态系统

  5. 理解测验
     类型: quiz
     验证对光合作用的理解

💡 设计思路:
  从直觉出发，通过可视化和交互让学生先"看懂"，
  再用公式精确表达，最后通过测验巩固理解。

✅ 测试成功！
💾 完整结果已保存到: gemini-planner-result.json
```

### 结果文件

测试完成后会生成 JSON 文件：

- **单主题测试**: `gemini-planner-result.json`
- **批量测试**: `gemini-planner-batch-results.json`

你可以打开这些文件查看完整的 JSON 结构。

---

## 🔍 查看结果

### 方法一：命令行查看

```bash
# 格式化显示 JSON
cat gemini-planner-result.json | python3 -m json.tool

# 或者用 jq（如果已安装）
cat gemini-planner-result.json | jq
```

### 方法二：在编辑器中打开

直接在 VS Code 或其他编辑器中打开 `gemini-planner-result.json`。

---

## 🧪 测试不同类型的主题

你可以测试各种主题，看看 Gemini 如何智能规划：

### 语言类

```typescript
'apple'
'photosynthesis' (也可以作为单词学习)
'serendipity'
'procrastination'
```

### 科学类

```typescript
'Newton\'s First Law'
'chemical reactions'
'DNA replication'
'black holes'
```

### 通识类

```typescript
'why do we cry when cutting onions'
'Renaissance'
'climate change'
'democracy'
```

---

## 📝 结果结构

生成的 JSON 包含：

```json
{
  "topic_analysis": {
    "main_topic": "主题名称",
    "domain": "LANGUAGE | SCIENCE | LIBERAL_ARTS",
    "complexity_level": "beginner | intermediate | advanced",
    "key_concepts": ["概念1", "概念2"]
  },
  "module_plan": [
    {
      "type": "模块类型",
      "title": "模块标题",
      "description": "模块描述"
    }
  ],
  "learning_path_reasoning": "AI 解释为什么这样设计"
}
```

---

## 🎯 验证重点

测试时请关注：

### 1. **领域判断准确性**
- `apple` 应该被判断为 `LANGUAGE`
- `photosynthesis` 应该是 `SCIENCE`
- `Renaissance` 应该是 `LIBERAL_ARTS`

### 2. **模块数量合理性**
- 简单主题（如 apple）: 3-4 个模块
- 中等主题（如 photosynthesis）: 4-5 个模块
- 复杂主题（如 quantum physics）: 5-6 个模块

### 3. **模块类型适配性**
- 语言主题应该包含: definition, examples, story
- 科学主题应该包含: intuition, experiment, formula
- 通识主题应该包含: overview, perspective_X

### 4. **学习路径逻辑**
- 是否从简单到复杂？
- 是否符合认知规律？
- 设计思路是否合理？

---

## 🔄 对比测试

你可以对比**假 Planner** 和 **Gemini Planner** 的结果：

### 假 Planner（当前产品使用）

```typescript
// Language 主题固定生成 4 个模块
[
  { type: 'definition', title: '定义与发音' },
  { type: 'examples', title: '用法示例' },
  { type: 'story', title: '词汇故事' },
  { type: 'quiz', title: '理解测验' }
]
```

### Gemini Planner（智能生成）

```typescript
// 可能根据主题复杂度生成 3-6 个模块
// 模块类型和标题都由 AI 决定
// 学习路径由 AI 优化
```

---

## ⚠️ 注意事项

1. **API 费用**: Gemini API 可能产生费用，建议先小规模测试
2. **网络要求**: 需要能访问 Google AI 服务
3. **响应时间**: 每次调用可能需要 2-5 秒
4. **不影响主系统**: 这是独立测试，不会改变当前产品的任何功能

---

## 🚀 测试步骤

### 完整流程

```bash
# 1. 设置 API Key
export GEMINI_API_KEY="your-api-key-here"

# 2. 运行单主题测试
npx tsx test-gemini-planner.ts

# 3. 查看结果
cat gemini-planner-result.json

# 4. (可选) 运行批量测试
npx tsx test-gemini-planner.ts batch

# 5. 查看批量结果
cat gemini-planner-batch-results.json
```

---

## 📈 下一步

测试满意后，我们可以：

1. ✅ **确认效果好** → 替换 `server/planner.ts` 中的假 Planner
2. 🔄 **需要调整** → 修改 prompt 或参数，重新测试
3. 📊 **收集数据** → 多测试几个主题，找出最优配置

---

## 🎉 开始测试

准备好后，运行：

```bash
export GEMINI_API_KEY="你的密钥"
npx tsx test-gemini-planner.ts
```

测试完成后告诉我结果，我们可以一起分析和优化！🚀

