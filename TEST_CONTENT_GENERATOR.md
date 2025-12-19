# 内容生成器测试指南

## 🎯 功能说明

这个内容生成器使用 **Gemini 2.5 Flash** 为 Planner 生成的模块创建实际的教学内容。

---

## 🚀 快速开始

### 测试方式一：单模块测试（推荐）

测试单个模块的内容生成效果：

```bash
export GEMINI_API_KEY="AIzaSyCYNz3SqxnR9AoAG6CC8MW1KOW2r8ou2c4"
./node_modules/.bin/tsx test-content-generator.ts
```

默认测试：
- **主题**: photosynthesis
- **模块**: Solar Powered Life (intuition)

### 测试方式二：完整 Canvas 测试

先用 Planner 生成模块计划，再为所有文本模块生成内容：

```bash
export GEMINI_API_KEY="AIzaSyCYNz3SqxnR9AoAG6CC8MW1KOW2r8ou2c4"
./node_modules/.bin/tsx test-content-generator.ts full
```

默认测试：
- **主题**: apple
- **领域**: LANGUAGE
- **流程**: Planner → 生成内容

---

## 📝 修改测试参数

编辑 `test-content-generator.ts`：

### 单模块测试

修改第 28-34 行：

```typescript
const topic = 'apple';           // 改成你的主题
const domain = 'LANGUAGE';       // LANGUAGE | SCIENCE | LIBERAL_ARTS
const modulePlan = {
  type: 'definition',            // 模块类型
  title: 'Defining the Apple',   // 模块标题
  description: '...'             // 可选的描述
};
```

### 完整 Canvas 测试

修改第 95-96 行：

```typescript
const topic = 'red-black tree';
const domain = 'SCIENCE';
```

---

## 📊 输出结果

### 生成的内容包含

```json
{
  "title": "模块标题",
  "body": "Markdown 格式的正文内容（300-800字）",
  "key_points": [
    "关键要点1",
    "关键要点2",
    "关键要点3"
  ],
  "difficulty_level": "intermediate",
  "estimated_reading_time": 3
}
```

### 结果文件

- **单模块测试**: `content-generator-result.json`
- **完整 Canvas 测试**: `full-canvas-content-result.json`

---

## 🔍 观察重点

### 1. 内容质量

- ✅ 语言是否清晰易懂（适合 G7-G12）
- ✅ 是否引人入胜（有吸引力）
- ✅ 结构是否合理（有层次）
- ✅ 示例是否具体（可理解）

### 2. 双语支持

- ✅ LANGUAGE: 英文为主，中文解释
- ✅ SCIENCE: 专业术语英文，解释中文
- ✅ LIBERAL_ARTS: 自然混合

### 3. 长度适中

- ✅ 300-800 字（阅读时间 2-5 分钟）
- ✅ 不要太长（失去耐心）
- ✅ 不要太短（缺乏深度）

### 4. Key Points 质量

- ✅ 3-5 个要点
- ✅ 每个都是核心概念
- ✅ 易于记忆和理解

---

## 🎯 测试建议

### 测试不同领域

1. **LANGUAGE**: apple, serendipity, photosynthesis（科学术语）
2. **SCIENCE**: Newton's First Law, red-black tree, photosynthesis
3. **LIBERAL_ARTS**: Why do we cry when cutting onions?, Renaissance

### 测试不同模块类型

- `definition` - 定义类
- `intuition` - 直觉类
- `overview` - 概述类
- `examples` - 示例类

---

## 🔄 与 Planner 的完整流程测试

运行完整 Canvas 测试（`full` 模式）：

```bash
./node_modules/.bin/tsx test-content-generator.ts full
```

这会：
1. ✅ 调用 Planner 生成模块计划
2. ✅ 为每个文本模块生成内容
3. ✅ 保存完整的 Canvas 数据

**注意**: 如果 Planner 生成了 6 个模块，其中 4 个是文本类型，就会调用 4 次内容生成 API。

---

## ⚡ 性能提示

- **单模块**: ~2-5 秒
- **完整 Canvas**: ~10-30 秒（取决于模块数量）
- **API 限流**: 两次调用之间有 1 秒延迟

---

## 🎉 开始测试

### 快速测试单个模块

```bash
export GEMINI_API_KEY="AIzaSyCYNz3SqxnR9AoAG6CC8MW1KOW2r8ou2c4"
./node_modules/.bin/tsx test-content-generator.ts
```

### 测试完整流程

```bash
export GEMINI_API_KEY="AIzaSyCYNz3SqxnR9AoAG6CC8MW1KOW2r8ou2c4"
./node_modules/.bin/tsx test-content-generator.ts full
```

测试完成后告诉我结果，我们可以一起优化！🚀

